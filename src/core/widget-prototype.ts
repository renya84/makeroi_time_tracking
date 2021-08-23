import {MakeroiWidget} from '../types/core/core';
import Core from './core';
import $ from 'jquery';
import settingsStyles from '../styles/core/settings.module.sass';

export default class WidgetPrototype extends Core implements MakeroiWidget {

    public async onBind(): Promise<boolean> {
        return true;
    }

    public async onInit(): Promise<boolean> {
        const store = await this.store();
        this.MAKEROI.attachWidget(store.local.widgetShortcut);
        return true;
    }

    public async onRender(): Promise<boolean> {
        return true;
    }

    public async onSettings(): Promise<boolean> {
        const wrap = $('div.modal.' + this.widget.params.widget_code);

        // prevent widget settings being rendered several times
        if (!WidgetPrototype.settingsDoubleRenderWorkaround(wrap)) {
            return false;
        }else{
            wrap.append($(`<div class="${settingsStyles.renderBlocker}"></div>`));
        }

        const store = await this.store();
        const settingsTab = wrap.find('div.view-integration-modal__tab-setting');
        if(store.local.dpSettings){
            const twig2 = await this.lib.renderTemplate('dp_settings', {
                styles: settingsStyles,
                icon_link: this.lib.imagePath()
            });
            settingsTab.append(twig2);
        }
        return true;
    }

    public async onAdvancedSettings(): Promise<boolean> {
        return true;
    }

    public async onDestroy(): Promise<boolean> {
        return true;
    }

    public async onDpSettings(): Promise<boolean> {
        return true;
    }

    public static settingsDoubleRenderWorkaround(wrap:JQuery):boolean{
        const blocker = wrap.find('.'+settingsStyles.renderBlocker);
        return blocker.length === 0;
    }
}