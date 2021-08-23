import { WidgetBuilder } from '../types/core/builders';
import {MakeroiWidget} from '../types/core/core';
import Lcard from './lcard';

export default class Builder implements WidgetBuilder{
    lcard: MakeroiWidget | null = null;
    llist: MakeroiWidget | null = null;
    leadsPipeline: MakeroiWidget | null = null;

    cucard: MakeroiWidget | null = null;
    culist: MakeroiWidget | null = null;
    customersPipeline: MakeroiWidget | null = null;

    advancedSettings: MakeroiWidget | null = null;
    ccard: MakeroiWidget | null = null;
    clist: MakeroiWidget | null = null;

    comcard: MakeroiWidget | null = null;
    settings: MakeroiWidget | null = null;

    tlist: MakeroiWidget | null = null;
    tasksPipeline: MakeroiWidget | null = null;

    digitalPipeline: MakeroiWidget | null = null;

    constructor(widget:any, AMOCRM:any) {
        const c = new Lcard(widget, AMOCRM);
        this.settings = c;
    }
}