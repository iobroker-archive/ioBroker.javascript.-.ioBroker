import GenericBlock from '../GenericBlock';

class ActionPrintText extends GenericBlock {
    constructor(props) {
        super(props, ActionPrintText.getStaticData());
    }

    static compile(config, context) {
        return `console.log("${(config.text || '').replace(/"/g, '\\"')}");`;
    }

    onTagChange(tagCard) {
        this.setState({
            inputs: [
                {
                    nameRender: 'renderModalInput',
                    attr: 'text',
                    defaultValue: 'My device triggered',
                    nameBlock: 'Log text'
                }
            ]
        }, () => super.onTagChange(tagCard));
    }

    static getStaticData() {
        return {
            acceptedBy: 'actions',
            name: {
                en: 'Log text',
                ru: 'Log text'
            },
            id: 'ActionPrintText',
            icon: 'Subject',
        }
    }

    getData() {
        return ActionPrintText.getStaticData();
    }
}

export default ActionPrintText;