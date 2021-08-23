import {WidgetBuilder, WidgetFactory } from '../types/core/builders';
import {MakeroiWidget} from '../types/core/core';


export default class Factory implements WidgetFactory {
    builder: WidgetBuilder;

    constructor(_builder: WidgetBuilder) {
        this.builder = _builder;
    }

    create(entity: string, isCard: boolean): MakeroiWidget | undefined {
        switch (entity) {
        case 'leads': {
            if (isCard) {
                if (this.builder.lcard) {
                    return this.builder.lcard;
                }
            } else {
                if (this.builder.llist) {
                    return this.builder.llist;
                }
            }
            break;
        }
        case 'leads-pipeline': {
            if (this.builder.leadsPipeline) {
                return this.builder.leadsPipeline;
            }
            break;
        }
        case 'customers': {
            if (isCard) {
                if (this.builder.ccard) {
                    return this.builder.ccard;
                }
            } else {
                if (this.builder.clist) {
                    return this.builder.clist;
                }
            }
            break;
        }
        case 'customers-pipeline': {
            if (this.builder.customersPipeline) {
                return this.builder.customersPipeline;
            }
            break;
        }
        case 'todo': {
            if (this.builder.tlist) {
                return this.builder.tlist;
            }
            break;
        }
        case 'todo-line': {
            if (this.builder.tasksPipeline) {
                return this.builder.tasksPipeline;
            }
            break;
        }
        case 'leads-dp': {
            if (this.builder.digitalPipeline) {
                return this.builder.digitalPipeline;
            }
            break;
        }
        case 'widgetsSettings': {
            if (this.builder.settings) {
                return this.builder.settings;
            }
            break;
        }
        case 'advanced-settings': {
            if(this.builder.advancedSettings){
                return this.builder.advancedSettings;
            }
            break;
        }
        }
        return undefined;
    }

}