const amoRefs = {
    input: '/tmpl/controls/input.twig',
    checkbox: '/tmpl/controls/checkbox.twig',
    checkboxDropdown: '/tmpl/controls/checkboxes_dropdown.twig',
    button: '/tmpl/controls/button.twig',
    date: '/tmpl/controls/date_field.twig',
    radio: '/tmpl/controls/radio.twig',
    select: '/tmpl/controls/select.twig',
    suggest: '/tmpl/controls/suggest.twig',
    textarea: '/tmpl/controls/textarea.twig',
};

const elemTemplate = {
    type: 'amo',
    ref: amoRefs.radio,
    label: 'aaa', //optional - wraps settings
    params: [{key: 'name', val: 'radio', disableJSONStringify: false}]
};

function settingsSetUp() {
    return [
        {
            type: 'amo',
            ref: amoRefs.input,
            label: 'ttt',
            params: [{key: 'name', val: 'input'}, {key: 'value', val: 'inputValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkboxDropdown,
            label: 'иии',
            params: [{
                key: 'items', val: 'dropdownList', disableJSONStringify: true
            }, {
                key: 'name',
                val: 'drop',
            }]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.checkbox,
            label: 'aaa',
            params: [{key: 'name', val: 'checkbox'}, {key: 'checked', val: 'checkboxValue', disableJSONStringify: true}]
        },
        {
            type: 'amo',
            ref: amoRefs.button,
            force: true,
            params: [{key: 'blue', val: true},
                {key: 'text', val: 'Сохранить'},
                {key:'class_name', val: 'styles.saveButton', disableJSONStringify: true}]
        },
    ];
}

function generateSettingsTwig(settings) {
    const fs = require('fs');
    try {
        fs.unlinkSync('./resources/templates/settings.twig');
        // eslint-disable-next-line no-empty
    } catch (e) {
    }

    const prepend = '<div class="{{ styles.settingsWrapper }}">{% if helpRef %}<div class="{{ styles.helpRef }}"><a href="{{ helpRef }}" target="_blank"><img src="{{ icon_link }}/question.svg" alt=""></a></div>{% endif %}';
    fs.appendFileSync('./resources/templates/settings.twig', prepend);

    for (let elem of settings) {
        let prefix;
        let postfix;
        if (elem.label) {
            prefix = '<div class="{{ styles.field }}">' +
                '        <div class="{{ styles.label }}">' +
                '            <span>' + elem.label + '</span>' +
                '        </div>' +
                '        <div class="{{ styles.value }}">';
            postfix = '  </div>\n' +
                '    </div>';
        } else {
            prefix = '<div class="{{ styles.block }}">';
            postfix = '</div>';
        }

        if (elem.type === 'amo') {
            prefix += '{{ widget.render({ ref: \'' + elem.ref + '\' }, {';
            for (let param of elem.params) {
                if(!param.disableJSONStringify){
                    prefix += '\n' + param.key + ':' + JSON.stringify(param.val) + ',';
                }else{
                    prefix += '\n' + param.key + ':' + param.val + ',';
                }
            }
            prefix += '\n})  }}';
        }
        prefix += postfix;
        fs.appendFileSync('./resources/templates/settings.twig', prefix);
    }

    fs.appendFileSync('./resources/templates/settings.twig', '</div>');
}

generateSettingsTwig(settingsSetUp());
