import { Moment } from 'moment';
import {LocalSettings, MakeroiLocalStore} from '../widget/interfaces';
import {WidgetStatus} from './enums';
import {MakeroiApi, MakeroiNotifications} from './core';

export interface MakeroiStore {
    data: any;
    local: MakeroiLocalStore;

    widgetStatus: WidgetStatus;
    isActive: boolean;
    isPaid: boolean;
    expires: Moment;
    createdAt: Moment;
    ratedUsers: number[];
    constants: any;
    tariffs: Tariff[];
    version: any;
    account: any;
    description: string;
    widget: any;
    trialLen: number;
    payments:any;

    settings: LocalSettings;
}

export interface MakeroiStoreManagerSettings{
    widget: any;
    api: MakeroiApi;
    notifications: MakeroiNotifications;
}

export interface ValidationResult {
    valid: boolean
    message?: string
}

export interface Tariff{
    name:string;
    price: number;
    desc:string;
}