import {MakeroiWidgetProxy, MakeroiWidgetProxySettings} from '../types/core/builders';
import {MakeroiCore, MakeroiWidget} from '../types/core/core';

export default class Proxy implements MakeroiWidgetProxy {

    customWidget: MakeroiWidget | undefined;
    core: MakeroiCore;
    widget: any;

    constructor(args: MakeroiWidgetProxySettings) {
        this.customWidget = args.customWidget;
        this.core = args.core;
        this.widget = args.widget;
    }

    private widgetIsInstalledAndActive(): boolean {
        return this.widget.params.active !== 'N' || this.widget.params.widget_active === 'Y';
    }

    async onBind(): Promise<boolean> {
        if (this.widgetIsInstalledAndActive()) {
            const store = await this.core.store();
            await this.core.onBind();
            if (store?.isActive && this.customWidget) {
                await this.customWidget.onBind();
            }
        }
        return true;
    }

    async onInit(): Promise<boolean> {
        if (this.widgetIsInstalledAndActive()) {
            const store = await this.core.store();
            await this.core.onInit();
            if (store?.isActive && this.customWidget) {
                await this.customWidget.onInit();
            }
        }
        return true;
    }

    async onRender(): Promise<boolean> {
        if (this.widgetIsInstalledAndActive()) {
            const store = await this.core.store();
            await this.core.onRender();
            if (store?.isActive && this.customWidget) {
                await this.customWidget.onRender();
            }
        }
        return true;
    }

    async onSettings(): Promise<boolean> {
        await this.core.onSettings();
        //on settings is always active
        if(this.customWidget){
            await this.customWidget.onSettings();
        }
        return true;
    }

    public async onAdvancedSettings(): Promise<boolean> {
        if (this.widgetIsInstalledAndActive()) {
            await this.core.onAdvancedSettings();
            if (this.customWidget) {
                await this.customWidget.onAdvancedSettings();
            }
        }
        return true;
    }

    public async onDestroy(): Promise<boolean> {
        if (this.widgetIsInstalledAndActive()) {
            const store = await this.core.store();
            await this.core.onDestroy();
            if (store?.isActive && this.customWidget) {
                await this.customWidget.onDestroy();
            }
        }
        return true;
    }

    public async onDpSettings(): Promise<boolean> {
        if (this.widgetIsInstalledAndActive()) {
            await this.core.onDpSettings();
            if (this.customWidget) {
                await this.customWidget.onDpSettings();
            }
        }
        return true;
    }
}