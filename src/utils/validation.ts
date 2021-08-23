export default class Validation{
    public static inBetween(param:number, left:number, right:number):boolean{
        return param>=left && param <=right;
    }

    public static checkCountry(AMOCRM:any):string|null{
        const countries = ['RU', 'BY', 'KZ', 'UA'];
        const currentCountry = AMOCRM.constant('account')?.country;
        if(countries.includes(currentCountry)){
            return currentCountry.toLowerCase();
        }
        return null;
    }

    public static setCountryAndPhone(phoneInput:JQuery, AMOCRM:any):void{
        // @ts-ignore
        phoneInput.intlTelInput({
            onlyCountries: ['ru', 'by', 'kz', 'ua'],
        });
        // @ts-ignore
        phoneInput.intlTelInput('selectCountry', 'ru');
        const autoSetCountry = Validation.checkCountry(AMOCRM);
        if(autoSetCountry){
            // @ts-ignore
            phoneInput.intlTelInput('selectCountry', autoSetCountry);
        }
        const personalMobile = AMOCRM.constant('user').personal_mobile;
        if(personalMobile){
            let mobile;
            if(personalMobile.slice(0,1) === '8'){
                mobile = '7'+personalMobile.slice(1);
            }else{
                mobile = personalMobile;
            }
            // @ts-ignore
            phoneInput.intlTelInput('setNumber', mobile);
        }
    }
}