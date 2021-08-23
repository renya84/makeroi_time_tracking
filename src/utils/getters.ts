export function byName(wrap:JQuery, name:string):JQuery{
    return wrap.find(`[name="${name}"]`);
}

export function isChecked(input:JQuery):boolean{
    return input.is(':checked');
}

export function mapChecked(inputArr:JQuery):Array<any>{
    const result:any[] = [];
    inputArr.each((index, item)=>{
        const el = $(item);
        if (el.prop('checked'))
            result.push(el.attr('value'));
    });
    return  result;
}


export function compareArrById(arr1:any, arr2:any):boolean{
    if(arr1.length !== arr2.length){
        return false;
    }

    for(let i = 0; i<arr1.length; i++){
        if(arr1[i].id!==arr2[i]){
            return false;
        }
    }
    return true;
}

export function comparator(obj:any):boolean{
    for(const param in obj){
        if(!obj[param]){
            return true;
        }
    }
    return false;
}

