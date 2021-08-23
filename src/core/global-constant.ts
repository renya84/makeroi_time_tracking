import {MakeroiGlobalConstant} from '../types/core/core';

export default class GlobalConstant implements MakeroiGlobalConstant{
    shared: any;
    widgetsList: string[];

    constructor() {
        this.widgetsList = [];
        this.shared = {};
    }

    attachWidget(shortcut: string): void {
        this.widgetsList.push(shortcut);
    }
}