import {WidgetFeedbackParams} from '../types/core/widget-core';
import tabsStyles from '../styles/core/style_tabs.module.sass';
import {MakeroiLib} from '../types/core/core';

export default class FeedbackUtils {
    public static removeFileListItem(files: any, id: number): any {
        const array: any[] = [];
        for (const i in files) {
            if (files[i].key !== id) {
                array.push(files[i]);
            }
        }
        return array;
    }

    public static switchButtonSendFeedBack(type: string, data: WidgetFeedbackParams, button: JQuery, phoneValid: boolean): void {
        const name = String(data.name).replace(/ /g, '').length;
        const email = String(data.email).replace(/ /g, '').length;
        const text = String(data.text).replace(/ /g, '').length;
        if (type === 'feedback_call') {
            if (phoneValid && name > 2) {
                button.trigger('button:save:enable');
            } else {
                button.trigger('button:save:disable');
            }
        } else if (type === 'bug_report' || type === 'wishes') {
            if (name > 2 && email > 5 && text > 10) {
                button.trigger('button:save:enable');
            } else {
                button.trigger('button:save:disable');
            }
        }
    }

    public static getValueFeedBackString(wrap: JQuery, name: string): string {
        const value = wrap.find(name).val();
        if (typeof value === 'string') {
            return value;
        } else {
            return '';
        }
    }

    public static getValueFeedBackNumber(wrap: JQuery, name: string): number {
        const value = wrap.find(name).val();
        if (typeof value === 'number') {
            return value;
        } else {
            return 0;
        }
    }

    public static async addFileBugReport(list: JQuery, file: any, widget: any, lib: MakeroiLib): Promise<boolean> {
        const fileBugReport = await lib.getTemplate('feedback_file_bug_report');
        const f = fileBugReport.render({
            folder: widget.params.path + '/images',
            style: tabsStyles,
            name: file.name,
            id: file.key
        });
        list.append(f);
        return false;
    }

    public static validateFiles(files: File[]): string | null {
        const acceptedFiles = [
            'image/png',
            'image/jpg',
            'image/gif',
            'image/txt',
            'image/bmp',
        ];
        let errorStr = '';
        let typeStr = '';
        let sizeStr = '';
        for (const file of files) {
            if (!acceptedFiles.includes(file.type)) {
                typeStr += file.name+' ';
            }
        }
        if(typeStr!==''){
            errorStr =  'Можно загружать файлы только c расширениями png, jpg, gif, txt, bmp. Но вы загрузили: '+errorStr+'. ';
        }

        for (const file of files) {
            if (!acceptedFiles.includes(file.type)) {
                typeStr += file.name+' ';
            }
        }
        const maxSize = 1048676*20;
        for(const file of files){
            if(file.size > maxSize){
                sizeStr += file.name + ' ';
            }
        }
        if(sizeStr !== ''){
            errorStr = 'Вы загрузили слишком большие файлы. Размер файлов не должен превышать 20Мб: '+sizeStr + '. ';
        }
        if(errorStr!==''){
            return errorStr;
        }
        return null;
    }

    public static setAutoConfigurableParameters(modal:JQuery, AMOCRM: any) {
        const user = AMOCRM.constant('user');
        const userName = user.name;
        const userEmail = user.login;
        modal.find('input[name="makeroi-name_call"]').val(userName);
        modal.find('input[name="makeroi-name_report"]').val(userName);
        modal.find('input[name="makeroi-name_wishes"]').val(userName);
        modal.find('input[name="makeroi-email_report"]').val(userEmail);
        modal.find('input[name="makeroi-emai_wishes"]').val(userEmail);
    }
}