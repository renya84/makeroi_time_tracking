import CustomWidget from './custom-widget';
import {byName, comparator, compareArrById, isChecked, mapChecked} from '../utils/getters';
import settingsStyles from '../styles/core/settings.module.sass';

export default class Settings extends CustomWidget {

    async onSettings(): Promise<boolean> {
        const result = await super.onSettings();
        if(!result){
            return false;
        }

        const wrap = $('div.modal.' + this.widget.params.widget_code);
        await super.onSettings();
        const store = await this.store();
        const settingsTab = wrap.find('div.view-integration-modal__tab-setting');
        // WARNING: IN MOST CASES YOU NEED TO ADD SPECIAL FIELD IN SETTINGS FOR THIS SETTINGS
        let data = store.settings;
        let currentData = data;
        if (store.local.hasSettings && settingsTab[0]) {
            const twig = await this.lib.renderTemplate('settings', {
                styles: settingsStyles,
                data: '123',
                widget: this.widget,
                icon_link: this.lib.imagePath(),
                helpRef: store.widget.instruction,
                dropdownList: data.checkboxDropdown.map((elem) => {
                    return {id: elem, option: elem, is_checked: true};
                }),
                inputValue: data.input,
                checkboxValue: data.checkbox
            });
            settingsTab.append(twig);

            const saveButton = settingsTab.find('.' + settingsStyles.saveButton);
            saveButton.trigger('button:save:disable');

            settingsTab.on('input', () => {
                const retrievedData = {
                    input: byName(wrap, 'input').val() ? byName(wrap, 'input').val()?.toString() as string : '',
                    checkbox: isChecked(byName(wrap, 'checkbox')),
                    checkboxDropdown: mapChecked(byName(wrap, 'drop')),
                };
                const changes = {
                    input: data.input === retrievedData.input,
                    checkbox: data.checkbox === retrievedData.checkbox,
                    checkboxDropdown: compareArrById(data.checkboxDropdown, retrievedData.checkboxDropdown),
                };
                if (comparator(changes)) {
                    saveButton.trigger('button:save:enable');
                } else {
                    saveButton.trigger('button:save:disable');
                }
                currentData = retrievedData;
            });
            saveButton.on('click', this.errorHandler.wrap(async () => {
                if (!saveButton.hasClass('button-input-disabled')) {
                    saveButton.trigger('button:load:start');
                    console.log('datasent', {...store.settings, ...currentData});
                    await this.api.settings({...store.settings, ...currentData});
                    store.settings = {...store.settings, ...currentData};
                    saveButton.trigger('button:load:stop');
                    data = currentData;
                    saveButton.trigger('button:save:disable');
                }
            }, this));
        }
        return true;
    }
}