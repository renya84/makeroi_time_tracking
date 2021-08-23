import {LocalSettings, MakeroiLocalStore} from '../types/widget/interfaces';

export class LocalStore implements MakeroiLocalStore{
    public hasSettings = true;
    public dpSettings = true;
    // used in cookies naming, global constant shortcut
    public widgetShortcut = 'webpackcore';

    public defaultSettings:LocalSettings = {
        input: '',
        checkbox: true,
        checkboxDropdown: [
            {id: 'Москва', option: 'Москва', is_checked: true},
            {id: 'Санкт-Петергбург', option: 'Санкт-Петергбург', is_checked: true},
            {id: 'Сан-Франциско', option: 'Сан-Франциско', is_checked: true}
        ]
    }
}