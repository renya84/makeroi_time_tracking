import {MakeroiWidgetProxy, WidgetBuilder, WidgetFactory, WidgetManager } from '../types/core/builders';
import {MakeroiCore} from '../types/core/core';
import Factory from './factory';
import Proxy from './proxy';

export default class Manager implements WidgetManager {
    customWidget: MakeroiWidgetProxy | undefined;
    entity: string | null = null;
    isCard: boolean | null =  null;
    widget: any = null;

    core: MakeroiCore;
    factory: WidgetFactory;

    constructor(_widget: any, _core:MakeroiCore, _builder:WidgetBuilder) {
        this.widget = _widget;
        this.core = _core;
        this.factory = new Factory(_builder);
    }

    getWidget(entity: string, isCard: boolean): MakeroiWidgetProxy|undefined {
        if(entity!==this.entity && isCard!==this.isCard){
            this.entity = entity;
            this.isCard = isCard;
            const currentWidget = this.factory.create(entity, isCard);
            this.customWidget = new Proxy({core: this.core, customWidget: currentWidget, widget: this.widget});
            return this.customWidget;
        }
        return this.customWidget;
    }
}