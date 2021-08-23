import {MakeroiCore,  MakeroiWidget} from './core';

export interface WidgetBuilder {
    lcard: MakeroiWidget | null;
    llist: MakeroiWidget | null;
    leadsPipeline: MakeroiWidget | null;

    cucard: MakeroiWidget | null;
    culist: MakeroiWidget | null;
    customersPipeline: MakeroiWidget | null;

    tlist: MakeroiWidget | null;
    tasksPipeline: MakeroiWidget | null;

    ccard: MakeroiWidget | null;
    clist: MakeroiWidget | null;

    comcard: MakeroiWidget | null;

    settings: MakeroiWidget | null;

    advancedSettings: MakeroiWidget | null;

    digitalPipeline: MakeroiWidget | null;
}

export interface WidgetFactory {
    builder: WidgetBuilder;
    create: (entity: string, isCard: boolean) => MakeroiWidget  | undefined;
}

export interface WidgetManager {
    widget: any;
    core: MakeroiCore;
    factory: WidgetFactory;

    customWidget: MakeroiWidgetProxy | undefined;


    entity: string | null;
    isCard: boolean | null;

    getWidget: (entity: string, isCard: boolean) => MakeroiWidgetProxy | undefined;
}

export interface MakeroiWidgetProxySettings {
    core: MakeroiCore;
    customWidget: MakeroiWidget | undefined;
    widget: any;
}

export interface MakeroiWidgetProxy {
    core: MakeroiCore;
    customWidget: MakeroiWidget | undefined;
    widget: any;

    onRender: () => boolean | Promise<boolean>;
    onBind: () => boolean | Promise<boolean>;
    onInit: () => boolean | Promise<boolean>;
    onSettings: () => boolean | Promise<boolean>;
    onDpSettings: () => boolean | Promise<boolean>;
    onAdvancedSettings: () => boolean | Promise<boolean>;
    onDestroy: () => boolean | Promise<boolean>;
}
