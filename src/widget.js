import WidgetCore from './core/widget-core';
import Builder from './widget/builder';
import Manager from './core/widget-manager';

export default function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let widget = this;
    let builder = new Builder(this, AMOCRM);
    this.core = new WidgetCore(this, AMOCRM);
    this.manager = new Manager(this, this.core, builder);

    this.callbacks = {
        render: function () {
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onRender, customWidget);
            return true;
        },
        init: function () {
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onInit, customWidget);
            return true;
        },
        bind_actions: function () {
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onBind, customWidget);
            return true;
        },
        settings: function () {
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onSettings, customWidget);
            return true;
        },
        onSave: function () {
            return true;
        },
        destroy: function () {
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onDestroy, customWidget);
            return true;
        },
        advancedSettings: function (){
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onAdvancedSettings, customWidget);
            return true;
        },
        dpSettings: function (){
            let customWidget =  widget.manager.getWidget(AMOCRM.data.current_entity, AMOCRM.isCard());
            widget.core.errorHandler.handle(customWidget.onDpSettings, customWidget);
            return true;
        }
    };
    return this;
}