import {MakeroiApi} from '../types/core/core';
import {FeedbackRequestTypes, RequestTypes} from '../types/core/enums';
import {WidgetFeedbackParams} from '../types/core/widget-core';
import $ from 'jquery';
import {LocalSettings} from '../types/widget/interfaces';

export default class Api implements MakeroiApi {
    hostApi: string;
    amoApi: string;
    widget: any;
    AMOCRM: any;

    constructor(_widget: any, AMOCRM: any) {
        this.widget = _widget;
        this.AMOCRM = AMOCRM;
        // this.hostApi = 'https://core.makeroi.tech/api/v0';
        // this.hostApi = 'https://jsonplaceholder.typicode.com';
        this.hostApi = 'https://kernel.makeroi.dev/api/v0';
        // this.hostApi = 'https://webhook.site/aa0cb217-4cfb-46d4-a01f-5f92f7a8833b';
        this.amoApi = 'https://'+this.AMOCRM.constant('account').subdomain+'.amocrm.ru'+'/api/v4';
    }

    public async request(route: string, requestType: RequestTypes, data: any, ajaxParams?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.widget.$authorizedAjax({
                url: this.hostApi + route,
                type: requestType,
                data: data,
                success: function (data: any) {
                    resolve(data);
                },
                error: function (error: any) {
                    reject(error);
                },
                dataType: 'json',
                ...ajaxParams,
            });
        });
    }

    public async unauthorizedRequest(route: string, requestType: RequestTypes, data?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            $.ajax({
                url: this.hostApi + route,
                type: requestType,
                data: data?data:{},
                success: function (data:any) {
                    resolve(data);
                },
                error: function (error:any) {
                    reject(error);
                },
                dataType: 'json',
            });
        });
    }

    public async unauthorizedAmoRequest(route: string, requestType: RequestTypes, data?: any): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            $.ajax({
                url: this.amoApi + route,
                type: requestType,
                data: data?data:{},
                success: function (data:any) {
                    resolve(data);
                },
                error: function (error:any) {
                    reject(error);
                },
                dataType: 'json',
            });
        });
    }

    public async requestStatus(): Promise<any> {
        const user = this.AMOCRM.constant('user');
        const account = this.AMOCRM.constant('account');
        return await this.request('/handshake', RequestTypes.POST, {
            'phone': user.personal_mobile ? user.personal_mobile : 'not specified',
            'widgets': Object.entries(this.AMOCRM.widgets.list).map(([key, widget]: [string, any]) => {
                return {
                    'integration_id': widget.params?.oauth_client_uuid ? widget.params?.oauth_client_uuid : '',
                    'name': widget?.langs?.widget?.name ? widget?.langs?.widget?.name : '',
                    'description': widget?.langs?.widget?.description ? widget?.langs?.widget?.description : '',
                    'email': widget?.params?.support?.email ? widget?.params?.support?.email : null,
                    'author_name': widget?.params?.support?.name ? widget?.params?.support?.name : null,
                    'link': widget?.params?.support?.link ? widget?.params?.support?.link : null,
                };
            }),
            'tariff_name': account?.tariffName,
            'paid_from': account?.paid_from,
            'paid_till': account?.paid_till,
            'pay_type': account?.pay_type,
            'user_uuid': user?.uuid,
            'user_amojo_id': user?.amojo_id
        });
    }

    public async activate(phone: string): Promise<any> {
        return await this.request('/activate', RequestTypes.POST, {
            'input_phone': phone
        });
    }

    public async uninstall(): Promise<any> {
        return await this.request('/uninstall', RequestTypes.POST, {});
    }

    public async notificationErrorReport(e: any): Promise<any> {
        return await this.request('/bugreport', RequestTypes.POST, {
            error: e ? JSON.stringify(e.toString()) : 'no error object was provided',
            message: e?.message ? e?.message : 'no message provided',
            stack: e?.stack ? e?.stack : 'no stack provided'
        });
    }

    public async feedbackReport(data: WidgetFeedbackParams, type: FeedbackRequestTypes) :Promise<any>{
        const formData = new FormData();
        let route = '/back.call';
        for(const key in data){
            if(key==='files') {
                data[key]?.forEach((file, index)=>{
                    formData.append(key+'['+index+']', file);
                });
            }else {
                // @ts-ignore
                formData.append(key, data[key]);
            }
        }
        switch (type) {
        case FeedbackRequestTypes.CALL_BACK: {
            route = '/back.call';
            break;
        }
        case FeedbackRequestTypes.BUG_REPORT: {
            route = '/ticket';
            break;
        }
        case FeedbackRequestTypes.WISH:{
            route = '/wish';
        }
        }
        return await this.request(route, RequestTypes.POST, formData, {
            cache: false,
            contentType: false,
            processData: false,
        });
    }

    public async payment(tariff:any): Promise<any>{
        return this.request('/payment', RequestTypes.POST, tariff);
    }

    public async settings(settings:LocalSettings):Promise<any>{
        // @ts-ignore
        return this.request('/settings', RequestTypes.POST, {settings: JSON.stringify(settings)});
    }

    public async rating(points:number):Promise<any>{
        return this.request('/score', RequestTypes.POST, {points});
    }

    public async getCurrentUser():Promise<any>{
        return this.unauthorizedAmoRequest(`/users/${this.AMOCRM.constant('user').id}`, RequestTypes.GET);
    }
}
