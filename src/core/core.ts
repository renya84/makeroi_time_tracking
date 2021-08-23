
import {
    MakeroiApi, MakeroiErrorHandler, MakeroiGlobalConstant,
    MakeroiLib,
    MakeroiLogger,
    MakeroiNotifications,
} from '../types/core/core';

import {Notifications, NotificationsManager} from './notifications';
import Api from './api';
import Lib from './lib';
import Logger from './logger';
import {StoreManager} from './store';
import ErrorHandlerManager from './error-handler';
import {MakeroiStore } from '../types/core/store';
import GlobalConstant from './global-constant';


export default class Core {
    widget:any;
    AMOCRM:any;
    api: MakeroiApi;
    lib: MakeroiLib;
    notifications: MakeroiNotifications;
    logger: MakeroiLogger;
    errorHandler: MakeroiErrorHandler;
    MAKEROI: MakeroiGlobalConstant;

    constructor(widget:any, AMOCRM:any) {
        this.widget = widget;
        this.AMOCRM = AMOCRM;
        this.api  = new Api(widget, AMOCRM);
        this.lib = new Lib(widget, AMOCRM, this.api);
        // @ts-ignore
        this.logger = new Logger(PRODUCTION);
        this.notifications = NotificationsManager.getNotifications(widget, this.lib, this.api);
        this.errorHandler = ErrorHandlerManager.getErrorHander(this.notifications);

        this.MAKEROI = this.attachToGlobalConstant();
    }

    async store(requestAgain?:boolean):Promise<MakeroiStore>{
        let store = null;
        if(requestAgain){
            store = await StoreManager.reRequestStore({widget:this.widget, api: this.api, notifications: this.notifications});
        }else{
            store = await StoreManager.getStore({widget:this.widget, api: this.api, notifications: this.notifications});
        }
        return store;
    }

    private attachToGlobalConstant():MakeroiGlobalConstant{
        // @ts-ignore
        if(!window.MAKEROI){
            // @ts-ignore
            window.MAKEROI = new GlobalConstant();
        }
        // @ts-ignore
        return window.MAKEROI;
    }
}