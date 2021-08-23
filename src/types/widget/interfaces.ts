export interface MakeroiLocalStore{
    hasSettings:boolean,
    dpSettings:boolean,
    defaultSettings:any,
    widgetShortcut: string
}

export interface LocalSettings{
    input: string,
    checkbox: boolean,
    checkboxDropdown: Array<any>
}