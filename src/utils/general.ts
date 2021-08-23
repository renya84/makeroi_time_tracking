export function formatError(e:any):string{
    let message = null;
    if(e.responseJSON){
        message = JSON.stringify(e.responseJSON);
    }
    return message!==null?message:JSON.stringify(e.message);
}