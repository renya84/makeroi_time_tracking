import {Template} from 'twig';
import {MakeroiWidgetProxy} from './builders';
import {FeedbackRequestTypes, NotificationTypes, RequestTypes, WidgetStatus} from './enums';
import {ModalSettings} from './lib';
import {MakeroiStore, Tariff } from './store';
import {LocalSettings, MakeroiLocalStore} from '../widget/interfaces';
import {WidgetFeedbackParams} from './widget-core';

export interface MakeroiWidget {
    widget?: any;
    onRender: () => boolean | Promise<boolean>;
    onBind: () => boolean | Promise<boolean>;
    onInit: () => boolean | Promise<boolean>;
    onSettings: () => boolean | Promise<boolean>;
    onDpSettings: () => boolean | Promise<boolean>;
    onAdvancedSettings: () => boolean | Promise<boolean>;
    onDestroy: () => boolean | Promise<boolean>;
}


export interface MakeroiCore extends MakeroiWidget{
    AMOCRM?:any
    store:() => Promise<MakeroiStore>;
    cssLoaded: boolean;
}

export interface MakeroiErrorHandler {
    notifications:MakeroiNotifications;
    handle: (callback: () => any, context: any) => Promise<boolean>;
    softHandle: (callback: () => any, context: any) => Promise<boolean>;
    hardHandle: (callback: () => any, context: any) => Promise<boolean>;
    wrap: (callback:(...params:any)=>any, context: any) => (...params:any)=>any;
}


export interface MakeroiApi {
    widget: any;
    hostApi: string;
    amoApi: string;
    unauthorizedRequest: (route: string, requestType: RequestTypes, data?: any) => Promise<any>
    unauthorizedAmoRequest: (route: string, requestType: RequestTypes, data?: any) => Promise<any>
    request: (route: string, requestType: RequestTypes, data?: any) => Promise<any>
    requestStatus: () => Promise<any>;
    activate: (phone:string)=>Promise<any>;
    uninstall: ()=>Promise<any>;
    notificationErrorReport: (error:any)=>Promise<any>;
    feedbackReport: (data: WidgetFeedbackParams, type: FeedbackRequestTypes)=> Promise<any>;
    payment: (tariff: any) => Promise<any>;
    settings: (settings: any) => Promise<any>;
    rating: (points: number) => Promise<any>;

    //amoCRM api
    getCurrentUser:() => Promise<any>;
}

export interface MakeroiLib {
    widget: any;
    api: MakeroiApi;
    getTemplate: (templateName: string) => Promise<Template>;
    renderTemplate: (templateName: string, params: any) => Promise<string>;
    openModal: (settings?: ModalSettings) => Promise<JQuery>;
    openFeedbackModal: (confidence: string) => Promise<JQuery>;
    openSuccessModal: (text: string) => Promise<JQuery>;
    imagePath: ()=>string;
    observe: (target:Node, callback:(mutation:any)=>void, watchParams?:string | string[]) => MutationObserver
}


export interface MakeroiNotifications{
    widget: any;
    lib: MakeroiLib;
    api: MakeroiApi;
    store?: MakeroiStore;
    openErrorNotification: (text:string, type:NotificationTypes, error?:any)=>Promise<JQuery>;
    openDemoNotification: (widgetName:string, text:string, type:NotificationTypes)=>Promise<JQuery>;
    openRatingNotification: (widgetName:string, description:string, type:NotificationTypes)=>Promise<JQuery>;
}

export interface MakeroiLogger {
    production: boolean;
    buffer: any[];
    log: (...args: any[]) => void;
}

export interface MakeroiGlobalConstant{
    widgetsList: string[];
    shared: any;

    attachWidget: (shortcut:string)=>void;
}

