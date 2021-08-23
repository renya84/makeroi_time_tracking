export function hasCookie(key:string):boolean{
    return document.cookie.split(';').some(elem=>elem.trim().startsWith(key+'='));
}

export function setCookie(key:string, val:any, hours:number):void{
    document.cookie = key+'='+val.toString()+'; expires='+(new Date(Date.now()+3600e3*hours)).toUTCString();
}

export function eraseCookie(key:string):void{
    document.cookie = key+'='+1+'; max-age=0';
}