import CustomWidget from './custom-widget';
import {NotificationTypes, RequestTypes} from '../types/core/enums';
import settingsStyles from '../styles/core/settings.module.sass';
import {byName, comparator, compareArrById, isChecked, mapChecked} from '../utils/getters';

export default class Lcard extends CustomWidget {

    public async onSettings(): Promise<boolean> {
        const result = await super.onSettings();
        if(!result){
            return false;
        }

        const s = await this.store();
        console.debug(s);
        const sendRequest = $('<button style="margin-left: 20px; margin-right: 20px">Post Request</button>');
        sendRequest.on('click', ()=>{
            this.api.requestStatus().then((data:any) => {
                console.debug(data);
            }).catch((err:any)=>{
                console.debug(err);
            });
        });
        const wrap = $('div.modal.' + this.widget.params.widget_code);
        const button = $('<button>notifications</button>');
        wrap.find('.widget_settings_block').append(button);
        wrap.find('.widget_settings_block').append(sendRequest);
        button.on('click', async () => {
            // await this.notifications.openErrorNotification('y! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! error', NotificationTypes.VALIDATION_ERROR);
            // await this.notifications.openErrorNotification('hey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! errorhey! error', NotificationTypes.WIDGET_ERROR);
            await this.notifications.openDemoNotification('Адрес на карте', 'Демо период подошел к концу', NotificationTypes.DEMO_FINISHED);
            await this.notifications.openRatingNotification('Адрес на карте', 'Демо период подошел к концу', NotificationTypes.RATING);
            await this.notifications.openRatingNotification('Адрес на карте', 'Демо период подошел к концу', NotificationTypes.RATING_GOOD);
            await this.notifications.openRatingNotification('Адрес на карте', 'Демо период подошел к концу', NotificationTypes.RATING_BAD);
        });
        wrap.find('.widget-settings__wrap-desc-space').append(sendRequest);
        wrap.find('.widget-settings__wrap-desc-space').append(button);

        const settingsTab = wrap.find('div.view-integration-modal__tab-setting');
        // WARNING: IN MOST CASES YOU NEED TO ADD SPECIAL FIELD IN SETTINGS FOR THIS SETTINGS
        let data = s.settings;
        let currentData = data;
        if(s.local.hasSettings && settingsTab[0]){
            const twig = await this.lib.renderTemplate('settings',{
                styles: settingsStyles,
                data: '123',
                widget: this.widget,
                icon_link: this.lib.imagePath(),
                helpRef: s.widget.instruction,
                dropdownList: data.checkboxDropdown.map((elem)=>{
                    return {id: elem.id, option: elem.id, is_checked: true};
                }),
                inputValue: data.input,
                checkboxValue: data.checkbox
            });
            settingsTab.append(twig);
            settingsTab.attr('style', 'visibility: hidden; display: block !important;');
            if(settingsTab.get(0)?.scrollHeight > 400){
                const modalBody = wrap.find('.modal-body');
                modalBody.css('margin-top', parseInt(modalBody.css('margin-top')) - 90 + 'px');
            }
            settingsTab.attr('style', '');
            const saveButton = settingsTab.find('.'+settingsStyles.saveButton);
            saveButton.trigger('button:save:disable');

            settingsTab.on('input',  ()=>{
                const retrievedData = {
                    input:byName(wrap, 'input').val() ? byName(wrap, 'input').val()?.toString() as string : '',
                    checkbox: isChecked(byName(wrap, 'checkbox')),
                    checkboxDropdown: mapChecked(byName(wrap, 'drop')),
                };
                const changes = {
                    input: data.input === retrievedData.input,
                    checkbox: data.checkbox === retrievedData.checkbox,
                    checkboxDropdown: compareArrById(data.checkboxDropdown, retrievedData.checkboxDropdown),
                };
                if(comparator(changes)){
                    saveButton.trigger('button:save:enable');
                }else{
                    saveButton.trigger('button:save:disable');
                }
                currentData = retrievedData;
            });
            saveButton.on('click',this.errorHandler.wrap(async ()=>{
                if(!saveButton.hasClass('button-input-disabled')){
                    saveButton.trigger('button:load:start');
                    console.log('datasent',{...s.settings, ...currentData});
                    await this.api.settings({...s.settings, ...currentData});
                    s.settings = {...s.settings, ...currentData};
                    saveButton.trigger('button:load:stop');
                    data = currentData;
                    saveButton.trigger('button:save:disable');
                }
            }, this));
        }
        return true;
    }
}