let externalModules = [
    'jquery',
    'backbone',
    'underscore',
    'clipboard',
    'twigjs',
    'twig',
    'moment',
    'lib/components/base/modal',
    'intl-tel-input',
    'intl-tel-input-utils'
];

const pattern = externalModules.reduce((acc, elem,index)=>{
    if(index!==externalModules.length-1){
        acc+=elem+'|';
    }else{
        acc+=elem+')$';
    }
    return acc;
}, '^(');

const prefix = 'webpackcore';

module.exports = {
    regExp: new RegExp(pattern),
    externalModules,
    prefix,
};