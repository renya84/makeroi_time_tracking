import {MakeroiErrorHandler, MakeroiNotifications} from '../types/core/core';
import {NotificationTypes} from '../types/core/enums';
import {formatError} from '../utils/general';

export default class ErrorHandlerManager {
    static errorHandler: MakeroiErrorHandler;

    public static getErrorHander(notifications:MakeroiNotifications){
        if(!ErrorHandlerManager.errorHandler){
            ErrorHandlerManager.errorHandler = new ErrorHandler(notifications);
        }
        return ErrorHandlerManager.errorHandler;
    }
}

export class ErrorHandler implements MakeroiErrorHandler {

    notifications:MakeroiNotifications;

    constructor(notifications:MakeroiNotifications) {
        this.notifications = notifications;
    }

    async hardHandle(callback: () => any, context: any): Promise<boolean> {
        try {
            if (callback) {
                return await callback.call(context);
            }
        } catch (e) {
            console.debug(e);
        }
        return Promise.resolve(false);
    }

    async softHandle(callback: () => any, context: any): Promise<boolean> {
        try {
            if (callback) {
                return await callback.call(context);
            }
        } catch (e) {
            await this.notifications.openErrorNotification(formatError(e), NotificationTypes.WIDGET_ERROR);
        }
        return Promise.resolve(false);
    }

    handle(callback: () => any, context: any): Promise<boolean> {
        const handler = this.softHandle.bind(this);
        return handler(callback, context);
    }

    wrap(callback:(...params:any)=>any, context: any): (...params:any)=>any{
        return this.softHandle.bind(this, callback, context);
    }
}