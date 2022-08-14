import $ from 'jquery';
import {MakeroiCore} from '../types/core/core';
import Core from './core';

import footerStyles from '../styles/core/style_footer.module.sass';
import tabsStyles from '../styles/core/style_tabs.module.sass';
import settingsStyles from '../styles/core/settings.module.sass';
import {NotificationTypes, WidgetStatus} from '../types/core/enums';
import Validation from '../utils/validation';
import {Tariff} from '../types/core/store';
import moment from 'moment';
import {hasCookie, setCookie} from '../utils/cookies';

require('intl-tel-input');
require('intl-tel-input-utils');
require('moment');

export default class WidgetCore extends Core implements MakeroiCore {
    cssLoaded: boolean;
    private interval: any;

    constructor(widget: any, AMOCRM: any) {
        super(widget, AMOCRM);
        this.cssLoaded = false;
        this.interval = null;
    }

    public async onSettings(): Promise<boolean> {
        if (this.widget.params.active !== 'N' || this.widget.params.widget_active === 'Y') {
            await this.settingsSetUp(false);
        } else {
            const wrap = $('div.modal.' + this.widget.params.widget_code);
            wrap.find('.widget_settings_block__fields').addClass('hidden');
            wrap.find('.widget_main_info button').on('click', async (event) => {
                if (!$(event.target).hasClass('button-input-disabled') && !this.interval) {
                    await this.showSettingsLoadingSpinner(wrap);
                    this.interval = setInterval(async () => {
                        if (this.widget.params.active !== 'N' || this.widget.params.widget_active === 'Y') {
                            clearInterval(this.interval);
                            setTimeout(this.settingsSetUp.bind(this, true), 100);
                        }
                    });
                }
            });
        }
        return true;
    }

    public async onBind(): Promise<boolean> {
        return false;
    }

    public async onInit(): Promise<boolean> {
        await this.handleFeedbackNotification();
        await this.handleSubscriptionEndNotification();
        return true;
    }

    public async onRender(): Promise<boolean> {
        if (!this.cssLoaded) {
            this.loadCSS();
        }
        return true;
    }

    public loadCSS(): void {
        if (!this.cssLoaded) {
            $('head')
                .append('<link type="text/css" rel="stylesheet" href="' + this.widget.params.path + '/main.css?v=' + Date.now() + '" >');
            this.cssLoaded = true;
        }
    }

    private async settingsSetUp(requestSettings: boolean) {
        const wrap = $('div.modal.' + this.widget.params.widget_code);
        // prevent widget settings being opened and rendered several times
        if (!WidgetCore.settingsDoubleModalWorkaround(wrap)) {
            return false;
        }

        await this.showSettingsLoadingSpinner(wrap);
        const store = await this.store(requestSettings);
        await this.hideSettingsLoadingSpinner(wrap);
        console.debug(store);


        const tabs = wrap.find('div.view-integration-modal__tabs .tabs');

        // временно переместить кнопку редактирование виджета
        // footer
        await this.footer(wrap);
        this.uninstallRequest(wrap);
        // open modal version
        await this.showVersionWidget(wrap);
        // initialise tabs
        await this.initTabs(wrap);
        // open modal pay history
        await this.showPayHistory(wrap);
        // open tab description
        await this.descriptionTab(wrap);
        // open tab activation
        await this.activationTab(wrap);

        // open tab subscription
        await this.subscriptionTab(wrap);
    }

    private async showSettingsLoadingSpinner(wrap: JQuery) {
        if (!wrap.find('.' + settingsStyles.loadingWrapper).get(0)) {
            await this.loadCSS();
            const loadingBlock = await this.lib.renderTemplate('settings_loading', {
                styles: settingsStyles,
            });
            const descSpace = wrap.find('.widget-settings__desc-space');
            descSpace.find('.widget_settings_block').addClass('hidden');
            descSpace.append(loadingBlock);
        }
    }

    private async hideSettingsLoadingSpinner(wrap: JQuery) {
        const descSpace = wrap.find('.widget-settings__desc-space');
        const spinner = descSpace.find('.' + settingsStyles.loadingWrapper);
        spinner.remove();
    }

    private hideTab(modal: JQuery): void {
        modal.find('.widget-settings__wrap-desc-space > div').each(function (i, div) {
            if ($(div).hasClass(footerStyles.footer) || $(div).hasClass('view-integration-modal__tabs')) {
                $(div).removeClass('hidden');
            } else {
                $(div).addClass('hidden');
            }
        });
    }

    private async footer(wrap: JQuery): Promise<boolean> {
        const footer = await this.lib.getTemplate('footer');
        const store = await this.store();
        const str = 'https://makeroi.com';
        let site = '';
        if (str) {
            try {
                const data = new URL(str);
                site = data.hostname;
            } catch (e) {
                site = str;
            }
        }
        const s = footer.render({
            icon_link: this.widget.params.path + '/images',
            site: store.constants.links.site,
            siteName: site,
            mail: store.constants.emails.sales,
            phone: store.constants.phones.sales,
            version: store.widget.version.current?.name,
            style: footerStyles,
            facebook: store.constants.links.facebook,
            whatsapp: store.constants.links.whatsapp,
            telegram: store.constants.links.telegram,
            youtube: store.constants.links.youtube,
            widgets: store.constants.links.widgets,
        });
        wrap.find('div.widget-settings__wrap-desc-space')
            .addClass(footerStyles.settingsWrapDescSpace).append(s);
        return false;
    }

    private async descriptionTab(wrap: JQuery): Promise<boolean> {
        const block = await this.lib.getTemplate('tab_description');
        const s = await this.store();
        const b = block.render({
            text: s.description
        });
        wrap.find('.widget-settings__desc-space').append(b);
        return false;
    }

    private async showVersionWidget(wrap: JQuery): Promise<boolean> {
        const store = await this.store();
        const versions = store.widget.version.history.map((v: any) => {
            const date = new Date(v.created_at * 1000);
            const dd = String(date.getUTCDate()).padStart(2, '0');
            const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
            v.created_at = dd + '.' + mm + '.' + date.getUTCFullYear();
            return v;
        });
        wrap.on('click', '.' + footerStyles.versionShowInfo, async () => {
            const block = await this.lib.getTemplate('version_info');
            const b = block.render({
                version: store.widget.version.current?.name,
                versions: versions,
                description: store.widget.version.current?.description,
                style: footerStyles
            });
            const modal = await this.lib.openModal({data: b});
            modal.find('.makeroi-version__history_show_more').on('click', function () {
                $(this).addClass('hidden').next().removeClass('hidden');
            });
        });
        return false;
    }

    private async showPayHistory(wrap: JQuery): Promise<boolean> {
        const store = await this.store();
        wrap.on('click', '.' + footerStyles.payShowInfo, async () => {
            const block = await this.lib.getTemplate('pay_history');
            const payments = store.payments.map((v: any) => {
                v.price = v.price.toLocaleString('ru-RU');
                return v;
            });
            const b = block.render({
                list: payments,
                style: footerStyles
            });
            const modal = await this.lib.openModal({data: b, className: footerStyles.payHistoryModal});

        });
        return false;
    }

    private async activationTab(wrap: JQuery): Promise<boolean> {
        const store = await this.store();
        const tabActivation = await this.lib.getTemplate('tab_activation');
        const t = tabActivation.render({
            self: this.widget,
            style: tabsStyles,
            confidence: store.constants.links.confidence
        });
        wrap.find('.view-integration-modal__activation').html(t);

        const $button = wrap.find('button.makeroi-activation_button');
        const inputPolitics = wrap.find('input[name="makeroi-politics"]');
        $button.trigger('button:save:disable');
        let validationError = '';
        const validationBlock = wrap.find('.' + tabsStyles.tab__activation__validation_error);

        function validator(): void {
            let valid = true;
            // @ts-ignore
            if (!window.intlTelInputUtils.isValidNumber(phoneInput.val())) {
                valid = false;
                validationError = 'Проверьте указанный номер телефона';
            } else if (!inputPolitics.prop('checked')) {
                valid = false;
                validationError = 'Для активации виджета необходимо ознакомиться с Пользовательским соглашением и Политикой конфиденциальности';
            }
            if (valid) {
                validationError = '';
                validationBlock.addClass(tabsStyles.hidden);
                validationBlock.html(validationError);
                $button.trigger('button:save:enable');
            } else {
                $button.trigger('button:save:disable');
            }
        }

        const phoneInput = wrap.find('input[name="makeroi-phone__activation"]');
        Validation.setCountryAndPhone(phoneInput, this.AMOCRM);
        phoneInput.trigger('change');

        phoneInput.on('paste cut input keyup change', validator);
        inputPolitics.on('change', validator);

        $button.on('click', () => {
            validator();
            if (!$button.hasClass('button-input-disabled') && validationError === '') {
                $button.trigger('button:load:start');
                this.api.activate(phoneInput.val() as string).then(async (data) => {
                    const store = await this.store(true);
                    console.debug('re-request', store);
                    $('#save_' + this.widget.params.widget_code).trigger('click');
                    $button.trigger('button:load:stop');
                }).catch(async (e: any) => {
                    $button.trigger('button:load:stop');
                    this.notifications.openErrorNotification(JSON.stringify(e.responseJSON), NotificationTypes.WIDGET_ERROR);
                });
            } else {
                validationBlock.removeClass(tabsStyles.hidden);
                validationBlock.html(validationError);
            }
        });

        if(store.account.partner?.name){
            await this.addPartner(wrap.find('.' + tabsStyles.tabActivation));
        } else {
            await this.addFeedback(wrap.find('.' + tabsStyles.tabActivation));
        }
        return false;
    }

    private async addFeedback(wrap: JQuery): Promise<boolean> {
        const feedback = await this.lib.getTemplate('feedback_block');
        const store = await this.store();
        const f = feedback.render({
            self: this.widget,
            style: tabsStyles
        });
        wrap.append(f);
        wrap.find('.' + tabsStyles.feedbackButton).on('click', async () => {
            await this.lib.openFeedbackModal(store.constants.links.confidence);
        });
        return false;
    }

    public async onAdvancedSettings(): Promise<boolean> {
        return true;
    }

    public async onDestroy(): Promise<boolean> {
        return true;
    }

    public async onDpSettings(): Promise<boolean> {
        return true;
    }

    private async initTabs(wrap: JQuery): Promise<boolean> {
        const s = await this.store();
        wrap.find('div.widget_settings_block').addClass('hidden');

        if (s.widgetStatus === WidgetStatus.BLOCKED) {
            wrap.find('label[for="description"]')
                .after('<label class="tabs__item view-integration-modal__tab-widget_blocked" for="widget_blocked">Блокировка</label>')
                .after('<input type="radio" name="type_integration_modal" id="widget_blocked" class="hidden tabs__input">');
            const blocked = await this.lib.getTemplate('blocked_widget');
            const b = blocked.render({
                self: this.widget,
                style: tabsStyles
            });
            wrap.find('.widget-settings__wrap-desc-space')
                .append('<div class="view-integration-modal__widget_blocked">' + b + '</div>');
            wrap.find('input#widget_blocked').prop('checked', true);
        } else if (s.widgetStatus === WidgetStatus.NOT_ACTIVATED || s.widgetStatus === WidgetStatus.INSTALLED_NOT_ACTIVE) {
            wrap.find('label[for="description"]')
                .after('<label class="tabs__item view-integration-modal__tab-activation" for="activation">Активация</label>')
                .after('<input type="radio" name="type_integration_modal" id="activation" class="hidden tabs__input">');
            wrap.find('.widget-settings__wrap-desc-space')
                .append('<div class="view-integration-modal__activation"></div>');
            wrap.find('input#activation').prop('checked', true);
            wrap.find('.widget-settings__desc-space').addClass('hidden');
        } else if (s.widgetStatus === WidgetStatus.REFRESH_ACCESS) {
            wrap.find('label[for="description"]')
                .after('<label class="tabs__item view-integration-modal__tab-widget_request_access" for="request_access">Предоставить доступ</label>')
                .after('<input type="radio" name="type_integration_modal" id="request_access" class="hidden tabs__input">');
            const template = await this.lib.renderTemplate('request_access', {
                self: this.widget,
                styles: tabsStyles,
            });
            wrap.find('.widget-settings__wrap-desc-space')
                .append('<div class="view-integration-modal__request_access">' + template + '</div>');
            wrap.find('.widget-settings__desc-space').addClass('hidden');
            wrap.find('input#request_access').prop('checked', true);
            const accessButton = wrap.find('.' + tabsStyles.tabWidgetRequestButton);
            accessButton.on('click', () => {
                accessButton.trigger('button:load:start');
                $('#save_' + this.widget.params.widget_code).trigger('click');
            });
        } else if (s.widgetStatus !== WidgetStatus.DISABLED) {
            wrap.find('label[for="description"]')
                .after('<label class="tabs__item view-integration-modal__tab-subscription" for="subscription">Подписка</label>')
                .after('<input type="radio" name="type_integration_modal" id="subscription" class="hidden tabs__input">')
                .after(s.local.hasSettings ? '<label class="tabs__item view-integration-modal__tab-setting" for="tab-setting">Настройки</label>' : '')
                .after('<input type="radio" name="type_integration_modal" id="tab-setting" class="hidden tabs__input">');
            wrap.find('.widget-settings__wrap-desc-space')
                .append('<div class="view-integration-modal__tab-setting hidden"></div>')
                .append('<div class="view-integration-modal__subscription hidden"></div>');
        }

        wrap.find('input[name="type_integration_modal"]').each((i, input) => {
            $(input).on('change', () => {
                const id = $(input).attr('id');
                wrap.find('div.view-integration-modal__access').find('div.integration-users-list__list').empty();
                $(input).removeAttr('checked');
                this.hideTab(wrap);
                wrap.find('div.view-integration-modal__' + id).removeClass('hidden');
                $(input).prop('checked', true);
                if (id === 'subscription') {
                    wrap.find('.' + footerStyles.versionShowInfo).removeClass(footerStyles.versionShowInfo)
                        .addClass(footerStyles.payShowInfo)
                        .find('span').text('История платежей');
                } else {
                    if (s.widget.version.current.name) {
                        wrap.find('.' + footerStyles.payShowInfo).removeClass(footerStyles.payShowInfo)
                            .addClass(footerStyles.versionShowInfo)
                            .find('span').text(s.widget.version.current.name);
                    }
                }
            });
        });
        return false;
    }

    private async subscriptionTab(wrap: JQuery): Promise<boolean> {
        const store = await this.store();
        const tabSubscription = await this.lib.getTemplate('tab_subscription');

        const tariffs = store.tariffs.map((v: any) => {
            v.price = v.price.toLocaleString('ru-RU');
            return v;
        });
        const t = tabSubscription.render({
            self: this.widget,
            style: tabsStyles,
            folder: this.widget.params.path + '/images',
            isPaid: store.widget.is_paid,
            paySetting: tariffs,
            confidence: store.constants.links.confidence,
            selected : 1,
            status: store.widgetStatus,
            expires: store.expires.format('D.M.YYYY')
        });
        wrap.find('.view-integration-modal__subscription').html(t);

        wrap.find('div.' + tabsStyles.periodRateItem).each(function (i, div) {
            $(div).on('click', function () {
                const item = $(this);
                wrap.find('div.' + tabsStyles.periodRateItem).removeClass('selected');
                const left = $(this).css('left');
                wrap.find('div#' + tabsStyles.rateSelector).animate({
                    left: left
                }, 300, 'linear', function () {
                    item.addClass('selected').trigger('selected', $(div).attr('data-value'));
                });
            });
        });
        wrap.find('div.' + tabsStyles.periodRateItem + '[data-value="1"]').trigger('click');
        let currentPayItem = 0;
        wrap.find('div.' + tabsStyles.periodRateItem).on('selected', (e, id) => {
            currentPayItem = id;
            const payItem: any = WidgetCore.getPayItem(id, store.tariffs);
            const paySpan: JQuery = wrap.find('span.' + tabsStyles.selectedSumPrice);
            const duration: JQuery = wrap.find('div.' + tabsStyles.selectedDuration);
            const sum: number = payItem.price;
            paySpan.text(sum.toLocaleString('ru-RU'));
            duration.text('Кол-во месяцев: ' + payItem.duration);
        });
        if (store.account.partner?.name) {
            await this.subscriptionPartner(wrap.find('.' + tabsStyles.subscriptionWrap));
        }else{
            await this.addFeedback(wrap.find('.' + tabsStyles.subscriptionWrap));
        }

        // send payment to backend
        const payButton = wrap.find('.' + tabsStyles.payButtonOpen);
        payButton.on('click', this.errorHandler.wrap(async () => {
            payButton.trigger('button:load:start');
            const payItem: any = WidgetCore.getPayItem(currentPayItem, store.tariffs);
            await this.api.payment(payItem);
            payButton.trigger('button:load:stop');
            await this.lib.openSuccessModal('Заявка на оплату принята, с вами скоро свяжутся!');
        }, this));

        if(store.account.partner?.name){
            await this.addPartner(wrap.find('.' + tabsStyles.tabActivation));
        }else{
            await this.addFeedback(wrap.find('.' + tabsStyles.tabActivation));
        }

        wrap.find('.' + tabsStyles.openFeedBack).on('click', async () => {
            await this.lib.openFeedbackModal(store.constants.links.confidence);
        });
        return false;
    }

    private uninstallRequest(wrap: JQuery): void {
        wrap.find('.js-widget-uninstall').on('click', () => {
            this.api.uninstall().then(async (data) => {
                $('#save_' + this.widget.params.widget_code).trigger('click');
                const timeID = setInterval(() => {
                    const modalConfirm = $('body').find('div.js-modal-confirm');
                    if (modalConfirm.length > 0) {
                        clearInterval(timeID);
                        modalConfirm.find('button.modal-body__actions__save').trigger('click');
                        this.store(true);
                    }
                });
            }).catch();
        });
    }

    private async handleSubscriptionEndNotification(): Promise<void> {
        const store = await this.store();
        if (store.isPaid && !hasCookie(store.local.widgetShortcut + '_payment')) {
            this.api.getCurrentUser().then(async (user) => {
                if (user.rights.is_admin) {
                    const today = moment();
                    const name = this.widget?.langs?.widget?.name;
                    if (store.widgetStatus === WidgetStatus.PAID_SUBSCRIPTION_EXPIRED || store.widgetStatus === WidgetStatus.TRIAL_SUBSCRIPTION_EXPIRED) {
                        await this.notifications.openDemoNotification(name, 'Пробная подписка истекла', NotificationTypes.DEMO_FINISHED);
                        setCookie(store.local.widgetShortcut + '_payment', true, 1);
                        return;
                    }
                    const diff = store.expires?.diff(today, 'days');
                    if (store.widgetStatus === WidgetStatus.TRIAL_SUBSCRIPTION && diff <= Math.ceil(store.trialLen / 3)) {
                        await this.notifications.openDemoNotification(name, `До конца пробной подписки осталось 
                    ${diff === 0 ? 'менее одного дня' : diff + 'дней'}`, NotificationTypes.DEMO_FINISHED);
                        setCookie(store.local.widgetShortcut + '_payment', true, 1);
                        return;
                    }
                    if (store.widgetStatus === WidgetStatus.PAID_SUBSCRIPTION && store.expires?.diff(today, 'days') < 5) {
                        await this.notifications.openDemoNotification(name, `До конца платной подписки осталось 
                    ${diff === 0 ? 'менее одного дня' : diff + 'дней'}`, NotificationTypes.DEMO_FINISHED);
                        setCookie(store.local.widgetShortcut + '_payment', true, 24);
                    }
                }
                // если недает сделать запрос - пользователь не админ
            }).catch((e) => {
            });
        }
    }

    private async handleFeedbackNotification(): Promise<void> {
        if (this.AMOCRM.data.current_entity !== 'widgetSettings') {
            return;
        }
        const store = await this.store();
        if (!store.createdAt) {
            return;
        }
        if (moment().diff(store.createdAt, 'days') < 7) {
            return;
        }
        const currentId = this.AMOCRM.constants('user');
        if (store?.ratedUsers?.some(id => id === currentId)) {
            return;
        }
        if (!hasCookie('makeroi_rated')) {
            const name = this.widget?.langs?.widget?.name;
            const description = this.widget?.langs?.widget?.short_description;
            await this.notifications.openRatingNotification(name, description, NotificationTypes.RATING);
        }
    }

    private static getPayItem(id: number, arrayItem: any): Tariff | undefined {
        const sID = id - 1;
        for (const i in arrayItem) {
            if (Number(i) === sID) {
                return arrayItem[i];
            }
        }
    }

    public static settingsDoubleModalWorkaround(wrap: JQuery): boolean {
        let render = true;
        wrap.each((index, element) => {
            if (index >= 1) {
                element.remove();
                render = false;
            }
        });
        return render;
    }

    private async addPartner(wrap: JQuery): Promise<boolean> {
        const partner = await this.lib.getTemplate('partner_block');
        const store = await this.store();
        const f = partner.render({
            self: this.widget,
            style: tabsStyles,
            icon_link: this.widget.params.path + '/images',
            mail: store.account.partner?.emails.support,
            name: store.account.partner?.name,
            phones: store.account.partner?.phones.support
        });
        wrap.append(f);
        return false;
    }

    private async subscriptionPartner(wrap: JQuery): Promise<boolean> {
        const partner = await this.lib.getTemplate('partner_subscription_block');
        const store = await this.store();
        const f = partner.render({
            self: this.widget,
            style: tabsStyles,
            icon_link: this.widget.params.path + '/images',
            mail: store.account.partner?.emails.support,
            name: store.account.partner?.name,
            phones: store.account.partner?.phones.support
        });
        wrap.append(f);
        return false;
    }
}