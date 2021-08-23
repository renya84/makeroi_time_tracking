// @ts-ignore
import Modal from 'lib/components/base/modal';
import {MakeroiApi, MakeroiLib} from '../types/core/core';
import {Template} from 'twig';
import {ModalSettings} from '../types/core/lib';
import $ from 'jquery';
import tabsStyles from '../styles/core/style_tabs.module.sass';
import modalsStyles from '../styles/core/modals.module.sass';
import Validation from '../utils/validation';
import FeedbackUtils from '../utils/feedback';
import {WidgetFeedbackParams} from '../types/core/widget-core';
import {FeedbackRequestTypes} from '../types/core/enums';

export default class Lib implements MakeroiLib {
    widget: any;
    modalDefaults: ModalSettings;
    AMOCRM: any;
    api: MakeroiApi;


    private currentNotifications: JQuery[]

    constructor(widget: any, AMOCRM: any, api: MakeroiApi) {
        this.widget = widget;
        this.AMOCRM = AMOCRM;
        this.api = api;
        this.modalDefaults = {
            cross: true,
        };
        this.currentNotifications = [];
    }

    public async getTemplate(templateName: string): Promise<Template> {
        return this.widget.render({
            promised: true,
            href: '/templates/' + templateName + '.twig',
            base_path: this.widget.params.path,
        });
    }

    public async renderTemplate(templateName: string, params: any): Promise<string> {
        const template = await this.getTemplate(templateName);
        return template.render(params);
    }

    public async openModal(settings?: ModalSettings): Promise<JQuery> {
        const mergedSettings = {...this.modalDefaults, ...settings};
        const data: JQuery = $('<div></div>');
        if (mergedSettings.cross) {
            data.append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
        }
        if (mergedSettings.data) {
            data.append(mergedSettings.data);
        }
        return new Promise<JQuery>((resolve, reject) => {
            new Modal({
                class_name: 'modal-list ' + mergedSettings.className ? mergedSettings.className : '',
                init: function ($modal_body: JQuery) {
                    $modal_body
                        .trigger('modal:loaded')
                        .append(data ? data : '')
                        .trigger('modal:centrify');
                    resolve($modal_body);
                },
                destroy: function () {
                }
            });
        });
    }

    public async openSuccessModal(text: string): Promise<JQuery> {
        const success = await this.renderTemplate('success', {
            text: text,
            image_path: this.imagePath(),
            styles: modalsStyles
        });
        const body = await this.openModal({data: success, className: modalsStyles.successModal});
        body.css('margin-top', parseInt(body.css('margin-top')) - 170 + 'px');
        body.css('height', 350 + 'px');
        return body;
    }


    public async openFeedbackModal(confidence:string):Promise<JQuery>{
        const feedbackModal = await this.getTemplate('feedback_modal');
        const d = feedbackModal.render({
            self: this.widget,
            folder: this.widget.params.path + '/images',
            confidence: confidence,
            style: tabsStyles
        });
        const modal = await this.openModal({data: d, className: tabsStyles.feedbackModal});
        modal.css('margin-top', parseInt(modal.css('margin-top')) - 80 + 'px');
        const phoneInput = modal.find('input[name="makeroi-phone_call"]');
        Validation.setCountryAndPhone(phoneInput, this.AMOCRM);
        FeedbackUtils.setAutoConfigurableParameters(modal, this.AMOCRM);

        modal.find('input[name="makeroi-view_tab"]').on('change', function (e) {
            const name = $(e.currentTarget).get(0).id;
            modal.find('.makeroi-tab__view').addClass('hidden');
            modal.find('.makeroi-tab__view[data-tab="' + name + '"]').removeClass('hidden');
            modal.find('div[data-tab]').addClass('hidden');
            modal.find('div[data-tab="' + name + '"]').removeClass('hidden');
            modal.trigger('modal:change');
            // modal.find('input').val('');
            // modal.find('textarea').val('');
        });
        modal.find('textarea').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        modal.on('keyup cut paste', 'input, textarea', function () {
            $(this).trigger('modal:change');
        });

        let files: File[] = [];
        const $file: JQuery = modal.find('input[name="bug_report_file"]');
        $file.on('change', () => {
            const file = $file.prop('files')[0];
            const d = new Date();
            file['key'] = d.getTime();
            files.push(file);
            FeedbackUtils.addFileBugReport(modal.find('.' + tabsStyles.fileList + ' > ul'), file, this.widget, this);
        });
        modal.on('click', '.' + tabsStyles.fileRemove, (e) => {
            const id = Number($(e.currentTarget).parent().attr('data-id'));
            files = FeedbackUtils.removeFileListItem(files, id);
            $(e.currentTarget).parent().remove();
        });
        let data: WidgetFeedbackParams = {};
        let requestType = FeedbackRequestTypes.CALL_BACK;
        const $button = modal.find('button.makeroi-send_button');
        $button.trigger('button:save:disable');
        modal.on('modal:change', () => {
            const type = modal.find('input[name="makeroi-view_tab"]:checked').get(0).id;
            // @ts-ignore
            const phoneValid = window.intlTelInputUtils.isValidNumber(modal.find('input[name="makeroi-phone_call"]').val());
            $button.trigger('button:save:disable');
            if (type === 'feedback_call') {
                requestType = FeedbackRequestTypes.CALL_BACK;
                data = {
                    name: FeedbackUtils.getValueFeedBackString(modal, 'input[name="makeroi-name_call"]'),
                    phone: FeedbackUtils.getValueFeedBackString(modal, 'input[name="makeroi-phone_call"]')
                };
            } else if (type === 'bug_report') {
                requestType = FeedbackRequestTypes.BUG_REPORT;
                data = {
                    name: FeedbackUtils.getValueFeedBackString(modal, 'input[name="makeroi-name_report"]'),
                    email: FeedbackUtils.getValueFeedBackString(modal, 'input[name="makeroi-email_report"]'),
                    text: FeedbackUtils.getValueFeedBackString(modal, 'textarea[name="makeroi-bug_report"]'),
                    files: files,
                };
            } else if (type === 'wishes') {
                requestType = FeedbackRequestTypes.WISH;
                data = {
                    name: FeedbackUtils.getValueFeedBackString(modal, 'input[name="makeroi-name_wishes"]'),
                    email: FeedbackUtils.getValueFeedBackString(modal, 'input[name="makeroi-emai_wishes"]'),
                    text: FeedbackUtils.getValueFeedBackString(modal, 'textarea[name="makeroi-wishes"]'),
                };
            }
            FeedbackUtils.switchButtonSendFeedBack(type, data, $button, phoneValid);
        });
        if (this.AMOCRM.constant('user').personal_mobile) {
            modal.trigger('modal:change');
        }

        // send FeedBack
        $button.on('click', async () => {
            if (!$button.hasClass('button-input-disabled')) {
                $button.trigger('button:load:start');
                let validationError: string | null = null;
                if (requestType === FeedbackRequestTypes.BUG_REPORT && data.files) {
                    validationError = FeedbackUtils.validateFiles(data.files);
                }
                if (validationError) {
                    await this.openModal({data: validationError});
                    $button.trigger('button:load:stop');
                } else {
                    this.api.feedbackReport(data, requestType).then(async (d) => {
                        await this.openSuccessModal('Заявка успешно отправлена!');
                        $button.trigger('button:load:stop');
                        modal.find('.modal-body__close').trigger('click');
                    }).catch((e) => {
                        this.openModal({data: e.responseJSON.toString()});
                        $button.trigger('button:load:stop');
                    });
                }
            }
        });
        return modal;
    }

    public imagePath(): string {
        return this.widget.params.path + '/images';
    }

    public observe(target: Node, callback: (mutation: any) => void, watchParams?: string | string[]): MutationObserver {
        let eventList: string[] = [];
        if (watchParams === undefined) {
            eventList = ['childList'];
        } else if (typeof watchParams === 'string') {
            eventList = [watchParams];
        } else if (Array.isArray(watchParams)) {
            eventList = watchParams;
        }
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (eventList.includes(mutation.type)) {
                    callback(mutation);
                }
            }
        });
        const config = Object.fromEntries(eventList.map((prop) => {
            if(typeof prop !== 'string')
                return prop;
            return [prop, true];
        }));
        observer.observe(target, config);
        return observer;
    }

}