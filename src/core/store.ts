import {MakeroiApi, MakeroiNotifications} from '../types/core/core';
import {NotificationTypes, WidgetStatus} from '../types/core/enums';
import MakeroiServerError from './error';
import Validation from '../utils/validation';
import {
    MakeroiStore,
    MakeroiStoreManagerSettings,
    Tariff,
    ValidationResult
} from '../types/core/store';
import {LocalSettings, MakeroiLocalStore} from '../types/widget/interfaces';
import {LocalStore} from '../widget/store';
import moment, {Moment} from 'moment';
import {formatError} from '../utils/general';

require('moment');

export class StoreManager {
    store: MakeroiStore | undefined;
    static store: MakeroiStore | undefined = undefined;
    private static request: Promise<MakeroiStore> | null = null;

    static async getStore(settings:MakeroiStoreManagerSettings): Promise<MakeroiStore> {
        if (!this.store) {
            if (!this.request) {
                this.request = settings.api.requestStatus().then((response: any) => {
                    const validationResult = this.validateData(response);
                    if (validationResult.valid && response) {
                        this.store = new Store(response.data);
                    } else {
                        this.store = new Store(null);
                        throw new MakeroiServerError(validationResult.message);
                    }
                    this.store = this.parseStatus(this.store, settings);
                    this.store = this.parseSettings(this.store, settings);
                    return this.store;
                }).catch(async (e: any) => {
                    await settings.notifications.openErrorNotification(formatError(e), NotificationTypes.WIDGET_ERROR);
                    return new Store(null);
                });
            }
            //@ts-ignore
            return this.request;
        }
        return this.store;
    }

    static async reRequestStore(settings:MakeroiStoreManagerSettings): Promise<MakeroiStore> {
        this.request = null;
        this.store = undefined;
        return this.getStore(settings);
    }

    private static parseStatus(store: MakeroiStore, settings:MakeroiStoreManagerSettings): MakeroiStore {
        if(!store.widgetStatus){
            return store;
        }
        // @ts-ignore
        if (store.widgetStatus === WidgetStatus.NOT_ACTIVATED) {
            if (settings.widget.params.active) {
                if (settings.widget.params.active !== 'Y') {
                    store.widgetStatus = WidgetStatus.INSTALLED_NOT_ACTIVE;
                }
            }
        } else if(store.widgetStatus === WidgetStatus.TRIAL_SUBSCRIPTION) {
            if(store.data.install.status.is_expired){
                store.widgetStatus = WidgetStatus.TRIAL_SUBSCRIPTION_EXPIRED;
            }
        } else if (store.widgetStatus === WidgetStatus.PAID_SUBSCRIPTION) {
            if(store.data.install.status.is_expired){
                store.widgetStatus = WidgetStatus.PAID_SUBSCRIPTION_EXPIRED;
            }
        }
        return store;
    }

    private static parseSettings(store: MakeroiStore, settings:MakeroiStoreManagerSettings): MakeroiStore {
        if (store.data?.install?.settings?.settings) {
            try {
                store.data.install.settings = JSON.parse(store.data.install.settings.settings);
            } catch (e) {
                settings.notifications.openErrorNotification('error in parsing settings', NotificationTypes.WIDGET_ERROR);
                return store;
            }
        }
        return store;
    }

    private static validateData(response: any): ValidationResult {
        const validators: ((response: any) => ValidationResult)[] = [
            function dataSignature(response: any): ValidationResult {
                if (response?.success) {
                    return {
                        valid: true
                    };
                }
                return {
                    valid: false,
                    message: 'Server responded with success: false'
                };
            },
            function install(response: any): ValidationResult {
                const id = response?.data?.install?.status?.id;
                if (response?.data?.install?.status?.id) {
                    if (Validation.inBetween(id, 0, 8)) {
                        return {
                            valid: true
                        };
                    }
                }
                return {
                    valid: false,
                    message: `Invalid status widget field ${id}, should be number in between 0 and 8`
                };
            },
        ];
        for (const validator of validators) {
            const result = validator(response);
            if (!result.valid) {
                return result;
            }
        }
        return {
            valid: true,
        };
    }
}

export class Store implements MakeroiStore {
    data: any;
    local: MakeroiLocalStore;

    constructor(data: any) {
        this.data = data;
        this.local = new LocalStore();
    }

    get isActive(): boolean {
        const status = this.widgetStatus;
        return status === WidgetStatus.FREE_INSTALLATION ||
            status === WidgetStatus.PAID_SUBSCRIPTION ||
            status === WidgetStatus.TRIAL_SUBSCRIPTION ||
            status === WidgetStatus.PARTNER_SUBSCRIPTION;
    }

    get widgetStatus(): WidgetStatus {
        return this.data?.install.status.id as WidgetStatus;
    }

    set widgetStatus(status: WidgetStatus) {
        if (this.data?.install?.status?.id) {
            this.data.install.status.id = status;
        }
    }

    get constants(): any {
        return this.data?.constants;
    }

    get tariffs(): Tariff[] {
        return this.data?.widget.tariffs;
    }

    get version(): any {
        return this.data?.widget.version;
    }

    get account(): any {
        return this.data?.account;
    }

    get description(): string {
        return this.data?.widget.description;
    }

    get widget(): string {
        return this.data?.widget;
    }

    get settings(): LocalSettings {
        if (this.data?.install?.settings && !Array.isArray(this.data?.install?.settings)) {
            return this.data?.install?.settings;
        }
        return this.local.defaultSettings;
    }

    set settings(settings: LocalSettings) {
        this.data.install.settings = settings;
    }

    get isPaid(): boolean {
        return !!this.data?.widget?.is_paid;
    }

    get expires(): Moment {
        return moment.unix(this.data?.install?.status?.expires);
    }

    get createdAt(): Moment{
        return moment.unix(this.data?.install?.created_at);
    }

    get ratedUsers(): number[]{
        return this.data?.install?.rated_users;
    }

    get trialLen(): number{
        return this.data?.widget?.trial_len;
    }

    get payments(): string{
        return this.data?.install?.payments;
    }
}