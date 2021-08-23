import {MakeroiApi, MakeroiLib, MakeroiNotifications} from '../types/core/core';
import notificationStyles from '../styles/core/notification.module.sass';
import $ from 'jquery';
import {NotificationTypes} from '../types/core/enums';
import {MakeroiStore} from '../types/core/store';
import {setCookie} from '../utils/cookies';

interface RemoveNotificationEventArgs {
    sendErrorReport?: boolean
}

export class NotificationsManager {
    static notifications: MakeroiNotifications | null = null;

    public static getNotifications(widget: any, lib: MakeroiLib, api: MakeroiApi): MakeroiNotifications {
        if (!NotificationsManager.notifications) {
            NotificationsManager.notifications = new Notifications(widget, lib, api);
        }
        return NotificationsManager.notifications;
    }

    public static setStore(store: MakeroiStore, widget: any, lib: MakeroiLib, api: MakeroiApi): void {
        NotificationsManager.getNotifications(widget, lib, api).store = store;
    }

}

export class Notifications implements MakeroiNotifications {
    widget: any;
    lib: MakeroiLib;
    api: MakeroiApi;
    store?: MakeroiStore;

    private leftMenu: JQuery | undefined

    constructor(widget: any, lib: MakeroiLib, api: MakeroiApi) {
        this.lib = lib;
        this.widget = widget;
        this.api = api;
    }

    private async openNotificationBody(): Promise<JQuery> {
        const stamp = Date.now();
        const notification = await this.lib.renderTemplate('notifications/notification', {
            styles: notificationStyles,
            stamp: stamp
        });
        $('body').append(notification);
        return $('body').find('.' + notificationStyles.container + '[data-stamp=' + stamp + ']');
    }


    public async openErrorNotification(text: string, type: NotificationTypes, widgetError?: any): Promise<JQuery> {
        let container = await this.openNotificationBody();
        if (type === NotificationTypes.VALIDATION_ERROR) {
            const error = await this.lib.renderTemplate('notifications/validation_error', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
                text: text,
                constants: this.store?.constants
            });
            container.append(error);
            container.addClass(notificationStyles.serverErrorContainer);
            setTimeout(this.removeNotification.bind(this, container), 7000);
        } else if (type === NotificationTypes.WIDGET_ERROR) {
            const error = await this.lib.renderTemplate('notifications/widget_error', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
                text: text
            });
            container.append(error);
            container.find('.' + notificationStyles.widgetErrorFooterInner).on('click', async () => {
                container.find('.' + notificationStyles.widgetErrorFooterInner).addClass(notificationStyles.hidden);
                container.find('.' + notificationStyles.widgetErrorSpinner).removeClass(notificationStyles.hidden);
                await this.api.notificationErrorReport(widgetError);
                const report = await this.lib.renderTemplate('notifications/widget_error_report', {
                    styles: notificationStyles,
                    imagePath: this.widget.params.path + '/images',
                });
                container.empty();
                container.append(report);
                container.find('.' + notificationStyles.cross).on('click', this.removeNotification.bind(this, container, {}));
            });
            container.find('.'+notificationStyles.notificationsCallback).on('click',()=>{
                this.lib.openFeedbackModal(this.store?.constants.links.confidence);
            });
            container.addClass(notificationStyles.widgetErrorContainer);
        } else if (type === NotificationTypes.WIDGET_ERROR_REPORT) {
            const report = await this.lib.renderTemplate('notifications/widget_error_report', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
            });
            container.append(report);
            container.addClass(notificationStyles.widgetErrorContainer);
            setTimeout(this.removeNotification.bind(this, container), 7000);
        }

        container = this.calcAndPlace(container);
        return container;
    }

    public async openDemoNotification(widgetName: string, text: string, type: NotificationTypes): Promise<JQuery> {
        let container = await this.openNotificationBody();
        if (type === NotificationTypes.DEMO_FINISHED) {
            const demo = await this.lib.renderTemplate('notifications/demo_period', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
                text: text,
                widgetName: widgetName
            });
            container.append(demo);
            container.addClass(notificationStyles.demoContainer);
            container.find('.' + notificationStyles.demoAside).on('click', () => {
                container.find('.' + notificationStyles.demoAside).addClass(notificationStyles.hidden);
                container.find('.' + notificationStyles.demoPay).removeClass(notificationStyles.hidden);
                container.find('.' + notificationStyles.demoLater).on('click', () => {
                    this.removeNotification(container);
                });
                container.find('.' + notificationStyles.demoPayment).on('click', () => {
                    // @ts-ignore
                    const destLocation = 'https://' + AMOCRM.constant('account').subdomain + '.amocrm.ru/settings/widgets/';
                    if(window.location.href === destLocation){
                        $('#'+this.widget.params.widget_code).trigger('click');
                    }else{
                        window.location.href = destLocation;
                    }
                });
            });
        }

        container = this.calcAndPlace(container);
        return container;
    }

    public async openRatingNotification(widgetName: string, description: string, type: NotificationTypes): Promise<JQuery> {
        let container = await this.openNotificationBody();
        if (type === NotificationTypes.RATING) {
            const rating = await this.lib.renderTemplate('notifications/rating', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
                widgetName: widgetName,
                description: description
            });
            container.append(rating);
            container.addClass(notificationStyles.ratingContainer);
            const stars = container.find('.' + notificationStyles.ratingStars + ' svg');
            stars.each((index, element) => {
                const el = $(element);
                el.on('mouseenter', this.onStarHover.bind(this, stars, index));
                el.on('click', this.onStarClick.bind(this, container, index, widgetName, description));
            });
            container.find('.' + notificationStyles.ratingStars).on('mouseleave', () => {
                stars.each((index, element) => {
                    const el = $(element);
                    el.attr('class', '');
                });
            });
        } else if (type === NotificationTypes.RATING_GOOD) {
            const rating = await this.lib.renderTemplate('notifications/rating_good', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
            });
            container.append(rating);
            container.addClass(notificationStyles.ratingContainer);
            container.find('.' + notificationStyles.thanksLink).on('click', () => {
                //@ts-ignore
                window.location = 'https://' + AMOCRM.constant('account').subdomain + '.amocrm.ru/settings/widgets';
            });
            setTimeout(this.removeNotification.bind(this, container), 7000);
        } else if (type === NotificationTypes.RATING_BAD) {
            const rating = await this.lib.renderTemplate('notifications/rating_bad', {
                styles: notificationStyles,
                imagePath: this.widget.params.path + '/images',
            });
            container.append(rating);
            container.addClass(notificationStyles.ratingContainer);
            container.find('.'+notificationStyles.thanksLink).on('click', async ()=>{
                await this.lib.openFeedbackModal(this.store?.constants.links.confidence);
                this.removeNotification(container);
            });
            setTimeout(this.removeNotification.bind(this, container), 7000);
        }
        container = this.calcAndPlace(container);
        return container;
    }

    private removeNotification(notification: JQuery, eventArgs?: RemoveNotificationEventArgs): void {
        const currentNotifications = this.updateNotificationsList();
        const index = currentNotifications.findIndex((_notification) => notification.data('stamp') === _notification.data('stamp'));
        if (index !== -1) {
            notification.removeClass(notificationStyles.opacityFull);
            setTimeout(() => {
                const event = new CustomEvent('notifications.close', {
                    detail: eventArgs,
                });
                notification[0].dispatchEvent(event);
                notification.remove();
                currentNotifications.splice(index, 1);
                currentNotifications.reduce((_, _notification, index) => {
                    const topOffset = this.calcYOffset(_notification, 20, index) + 'px';
                    _notification.css({top: topOffset});
                    return null;
                }, null);
            }, 200);
        }
    }

    private calcYOffset(notification: JQuery, botOffset?: number, ignoreNumber?: number): number {
        let arr = this.updateNotificationsList();
        if (ignoreNumber !== undefined) {
            arr = arr.slice(0, ignoreNumber);
        }
        if (botOffset === undefined) {
            botOffset = 0;
        }
        const arrayOffset = arr.reduce((offset, _notification) => {
            const height = _notification.outerHeight();
            if (height && notification.data('stamp') !== _notification.data('stamp')) {
                // @ts-ignore
                return offset + height + botOffset;
            }
            return offset;
        }, 0);
        const notificationHeight = notification.outerHeight();
        if (notificationHeight) {
            return window.innerHeight - arrayOffset - notificationHeight - botOffset;
        }
        return window.innerHeight - arrayOffset;
    }

    private calcXOffset(notification: JQuery): number {
        if (!this.leftMenu) {
            this.leftMenu = $('.left-menu');
        }
        const width = this.leftMenu.outerWidth();
        if (width) {
            return width + 20;
        }
        return 65 + 20;
    }

    private calcAndPlace(notification: JQuery): JQuery {
        const leftOffset = this.calcXOffset(notification) + 'px';
        const topOffset = this.calcYOffset(notification, 20) + 'px';
        notification.css({left: leftOffset, top: topOffset});
        notification.addClass(notificationStyles.opacityFull);
        notification.find('.' + notificationStyles.cross).on('click', this.removeNotification.bind(this, notification, {}));
        return notification;
    }

    private onStarHover(stars: JQuery, index: number): void {
        stars.each((i, element) => {
            const el = $(element);
            if (i <= index) {
                el.attr('class', notificationStyles.ratingStarActive);
            } else {
                el.attr('class', '');
            }
        });
    }

    private async onStarClick(notification: JQuery, index: number, widgetName: string, description: string): Promise<void> {
        notification.find('.' + notificationStyles.ratingStars).addClass(notificationStyles.hidden);
        notification.find('.' + notificationStyles.ratingSpinner).removeClass(notificationStyles.hidden);
        await this.api.rating(index + 1);
        setCookie('makeroi_rated',1, 24 );
        if (index <= 2) {
            await this.openRatingNotification(widgetName, description, NotificationTypes.RATING_BAD);
        } else {
            await this.openRatingNotification(widgetName, description, NotificationTypes.RATING_GOOD);
        }
        this.removeNotification(notification);
    }

    private updateNotificationsList(): JQuery[]{
        const notifications = $('.makeroi-notification');
        const arr:JQuery[] = [];
        notifications.each((index, elem)=>{
            arr.push($(elem));
        });
        return arr;
    }
}