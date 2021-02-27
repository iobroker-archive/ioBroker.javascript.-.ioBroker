import React, { PureComponent, Fragment } from 'react';
import cls from './style.module.scss';

import { Menu, MenuItem } from '@material-ui/core';

import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import Utils from '@iobroker/adapter-react/Components/Utils';
import I18n from '@iobroker/adapter-react/i18n';

import CustomButton from '../CustomButton';
import CustomCheckbox from '../CustomCheckbox';
import CustomInput from '../CustomInput';
import CustomInstance from '../CustomInstance';
import CustomModal from '../CustomModal';
import CustomSelect from '../CustomSelect';
import CustomSlider from '../CustomSlider';
import CustomSwitch from '../CustomSwitch';
import CustomTime from '../CustomTime';

import MaterialDynamicIcon from '../../helpers/MaterialDynamicIcon';
import utils from '../../helpers/utils';
import clsx from 'clsx';

class GenericBlock extends PureComponent {
    constructor(props, item) {
        super(props);
        item = item || {};
        let settings = props.settings || {
            tagCard: item.tagCardArray ? typeof item.tagCardArray[0] !== 'string' ? item.tagCardArray[0].title : item.tagCardArray[0] : ''
        }

        if (!settings.tagCard && item.tagCardArray) {
            settings.tagCard = typeof item.tagCardArray[0] !== 'string' ? item.tagCardArray[0].title : item.tagCardArray[0];
        }

        this.state = {
            inputs: item.inputs || props.inputs || [],
            name: item.name || props.name || '',
            icon: item.icon || props.icon || '',
            adapter: item.adapter || props.adapter || '',

            tagCardArray: item.tagCardArray || [],

            showSelectId: false,
            openTagMenu: false,
            openModal: false,
            iconTag: false,

            oid: {},
            instanceSelectionOptions: [],
            instanceSelectionDef: '',

            hideAttributes: [], // e.g. instance

            settings,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const settings = JSON.parse(JSON.stringify(nextProps.settings));
        if (!settings.tagCard && this.state.tagCardArray && this.state.tagCardArray.length) {
            settings.tagCard = typeof this.state.tagCardArray[0] !== 'string' ? this.state.tagCardArray[0].title : this.state.tagCardArray[0];
        }

        if (JSON.stringify(settings) !== JSON.stringify(this.state.settings)) {
            this.setState({settings});
        }
    }

    // called every time, the tagCard changes or at start
    onTagChange(tagCard, cb) {
        // analyse inputs and fill the attributes with default values
        let changed = false;
        let settings = JSON.parse(JSON.stringify(this.state.settings));
        this.state.inputs.forEach(input => {
            if (input.attr && input.defaultValue !== undefined) {
                if (settings[input.attr] === undefined) {
                    changed = true;
                    settings[input.attr] = input.defaultValue;
                }
            }
        });
        if (changed) {
            this.setState({settings}, () => cb && cb());
            this.props.onChange(settings);
        } else {
            cb && cb();
        }
    }

    // called if trigger added or removed
    onUpdate() {
        // do nothing, but blocks can overwrite it
    }

    // called every time if some attribute changes
    onValueChanged(value, attr) {
        // do nothing, but blocks can overwrite it
    }

    renderText = (input, value, onChange) => {
        const { className } = this.props;
        const { attr, frontText, backText, nameBlock, name } = input;
        return <Fragment key={attr}>
            <div className={clsx(cls.displayFlex, cls.blockMarginTop)}>
                {frontText && <div className={cls.frontText}>{frontText}</div>}
                <CustomInput
                    className={className}
                    autoComplete="off"
                    label={utils.getName(name)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={value}
                    onChange={onChange}
                    customValue
                />
                {backText && <div className={cls.backText}>{backText}</div>}
            </div>
            {nameBlock && <div className={cls.nameBlock}>{nameBlock}</div>}
        </Fragment>;
    }

    renderSwitch = (input, value, onChange) => {
        const { className } = this.props;
        const { attr, frontText, backText, nameBlock } = input;
        return <div key={attr}>
            <div className={clsx(cls.displayFlex, cls.blockMarginTop)}>
                {frontText && <div className={cls.frontText}>{frontText}</div>}
                <CustomSwitch
                    className={className}
                    label=''
                    customValue
                    value={value}
                    onChange={onChange}
                />
                {backText && <div className={cls.backText}>{backText}</div>}
            </div>
            {nameBlock && <div className={cls.nameBlock}>{nameBlock}</div>}
        </div>;
    }

    renderNameText = ({ attr, signature }, value) => <div
        className={clsx(!!signature ? cls.displayItalic : cls.displayFlex, cls.blockMarginTop)}
        key={attr}>
        {value}
    </div>;

    renderNumber = (input, value, onChange) => {
        const { className } = this.props;
        const { settings } = this.state;
        const { attr, backText, frontText, openCheckbox } = input;
        let visibility = true;
        if (openCheckbox) {
            visibility = typeof settings['offset'] === 'boolean' ? settings['offset'] : true
        }
        return visibility ? <div key={attr} className={clsx(cls.displayFlex, cls.blockMarginTop)}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomInput
                className={className}
                fullWidth
                autoComplete="off"
                label={input.noHelperText ? '' : 'number'}
                variant="outlined"
                size="small"
                type="number"
                value={value}
                onChange={onChange}
                customValue
            />
            {backText && <div className={cls.backText}>{backText}</div>}
        </div> : null;
    }

    renderColor = (input, value, onChange) => {
        const { className } = this.props;
        const { attr, backText, frontText } = input;
        return <div key={attr} className={clsx(cls.displayFlex, cls.blockMarginTop)}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomInput
                className={className}
                autoComplete="off"
                fullWidth
                variant="outlined"
                size="small"
                type="color"
                value={value}
                onChange={onChange}
            />
            {backText && <div className={cls.backText}>{backText}</div>}
        </div>;
    }

    renderCheckbox = (input, value, onChange) => {
        const { className } = this.props;
        const { settings } = this.state;
        const { attr, backText, frontText, defaultValue } = input;
        return <div key={attr} className={cls.displayFlex}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomCheckbox
                className={className}
                size="small"
                style={{ marginRight: 5 }}
                value={typeof settings[attr] === 'boolean' ? settings[attr] : defaultValue}
                customValue
                onChange={onChange}
            />
            {backText && <div onClick={() => onChange(typeof settings[attr] === 'boolean' ? !settings[attr] : !defaultValue)} className={cls.backText}>{backText}</div>}
        </div>;
    }

    renderSlider = (input, value, onChange) => {
        const { className } = this.props;
        const { attr, frontText, backText, nameBlock, min, max, step, unit } = input;
        return <div key={attr}>
            <div className={cls.displayFlex} style={{marginRight: 20}}>
                {frontText && <div className={cls.frontText}>{frontText}</div>}
                <CustomSlider
                    customValue
                    min={min}
                    max={max}
                    step={step}
                    unit={unit}
                    className={className}
                    autoComplete="off"
                    label="number"
                    variant="outlined"
                    size="small"
                    value={value}
                    onChange={onChange}
                />
                {backText && <div style={{ marginLeft: 20 }} className={cls.backText}>{backText}</div>}
            </div>
            {nameBlock && <div className={cls.nameBlock}>{nameBlock}</div>}
        </div>;
    }

    renderButton = (input, value, onClick) => {
        const { className } = this.props;
        const { attr, frontText, backText, buttonText } = input;
        return <div key={attr} className={clsx(cls.displayFlex, cls.blockMarginTop)}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomButton
                label={buttonText}
                fullWidth
                value={value}
                className={className}
                onClick={onClick}
            />
            {backText && <div className={cls.backText}>{backText}</div>}
        </div>;
    }

    renderObjectID = (input, value, onChange) => {
        const { showSelectId, settings } = this.state;
        const { className, socket } = this.props;
        const { attr, openCheckbox } = input;
        let visibility = true;
        if (openCheckbox) {
            visibility = typeof settings['offset'] === 'boolean' ? settings['offset'] : true
        }

        if (settings[attr] && !this.state[settings[attr]]) {
            setTimeout(() => {
                socket.getObject(value)
                    .then(obj =>
                        this.setState({ [settings[attr]]: obj }));
            }, 0);
        }
        // return null
        return visibility ? <div className={cls.blockMarginTop} key={attr}>
            <div className={cls.displayFlex}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    disabled
                    variant="outlined"
                    size="small"
                    value={value}
                    customValue
                />
                <CustomButton
                    square
                    style={{ marginLeft: 7 }}
                    value='...'
                    className={className}
                    onClick={() => this.setState({ showSelectId: true })}
                />
            </div>
            {this.state[this.state.settings[input.attr]] && <div className={clsx(cls.nameBlock, cls.displayItalic)}>{Utils.getObjectNameFromObj(this.state[settings[attr]], I18n.getLanguage())}</div>}
            {showSelectId ? <DialogSelectID
                key="tableSelect"
                imagePrefix="../.."
                dialogName={'javascript'}
                themeType={Utils.getThemeName()}
                socket={socket}
                statesOnly={true}
                selected={value}
                onClose={() => this.setState({ showSelectId: false })}
                onOk={(selected, name, common) =>
                    this.setState({ showSelectId: false }, () => {
                        // read type of object
                        socket.getObject(selected)
                            .then(obj => onChange({
                                [attr]: selected,
                                [attr + 'Role']: obj.common.role,
                                [attr + 'Type']: obj.common.type,
                                [attr + 'Unit']: obj.common.unit,
                                [attr + 'States']: obj.common.states,
                                [attr + 'Min']: obj.common.min,
                                [attr + 'Max']: obj.common.max,
                                [attr + 'Step']: obj.common.step,
                                [attr + 'Def']: obj.common.def,
                                [attr + 'Write']: obj.common.write,
                                [attr + 'Read']: obj.common.read,
                            }, null, () =>
                                this.props.setOnUpdate && this.props.setOnUpdate(true)));
                    })}
            /> : null}
        </div> : null;
    }

    renderIconTag = () => {
        return <div className={cls.iconTag}>
            {this.state.settings.tagCard}
        </div>;
    }

    renderTime = (input, value, onChange) => {
        const { attr, backText, frontText } = input
        return <div key={attr} className={cls.displayFlex} style={{ whiteSpace: 'nowrap' }}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomTime
                value={value}
                onChange={onChange}
            />
            {backText && <div className={cls.backText}>{backText}</div>}
        </div>;
    };

    renderSelect = (input, value, onChange) => {
        const { className } = this.props;
        const { name, options, frontText, backText, attr, multiple } = input;
        return <div key={attr} className={clsx(cls.displayFlex, cls.blockMarginTop)} style={{ whiteSpace: 'nowrap' }}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomSelect
                title={name}
                className={className}
                options={options}
                value={value}
                onChange={val => onChange(val, attr)}
                multiple={multiple}
                customValue
            />
            {backText && <div className={cls.backText}>{backText}</div>}
        </div>;
    };

    renderInstance = (input, value, onChange) => {
        const { className, socket } = this.props;
        const { name, options, frontText, backText, attr, adapter } = input;
        if (this.state.hideAttributes.includes(attr)) {
            return null;
        }
        return <div key={attr} className={clsx(cls.displayFlex, cls.blockMarginTop)} style={{ whiteSpace: 'nowrap' }}>
            {frontText && <div className={cls.frontText}>{frontText}</div>}
            <CustomInstance
                socket={socket}
                adapter={adapter}
                title={name}
                className={className}
                options={options}
                value={value}
                onChange={onChange}
                customValue
                onInstanceHide={value => this.setState({ hideAttributes: [...this.state.hideAttributes, attr] }, () => onChange(value))} // hide instance if only exactly one exists
            />
            {backText && <div className={cls.backText}>{backText}</div>}
        </div>;
    }

    renderModalInput = (input, value, onChange) => {
        const { openModal } = this.state;
        const { className } = this.props;
        const { attr, nameBlock, frontText, backText } = input;
        return <div key={attr}>
            <div className={clsx(cls.displayFlex, cls.blockMarginTop)}>
                {frontText && <div className={cls.frontText}>{frontText}</div>}
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={value}
                    onChange={onChange}
                    customValue
                />
                <CustomButton
                    square
                    // fullWidth
                    style={{ marginLeft: 5 }}
                    value='...'
                    className={className}
                    onClick={() => this.setState({ openModal: true })}
                />
                {backText && <div className={cls.backText}>{backText}</div>}
            </div>
            {openModal ? <CustomModal
                open={true}
                onApply={val =>
                    this.setState({ openModal: false }, () =>
                        val !== null && val !== undefined && onChange(val))}
                onClose={() => this.setState({ openModal: false })}
                defaultValue={value}
                textInput={true}
            /> : null}
            {nameBlock && <div className={cls.nameBlock}>{nameBlock}</div>}
        </div>;
    };

    /////////////////////////////
    tagGenerate = () => {
        let { tagCardArray, openTagMenu } = this.state;
        let { tagCard } = this.state.settings;
        let result = tagCard;
        if (tagCardArray.length > 3) {
            result = <div>
                <div aria-controls="simple-menu" aria-haspopup="true"
                    onClick={(e) => this.setState({ openTagMenu: e.currentTarget })}>{result}</div>
                <Menu
                    id="simple-menu"
                    anchorEl={openTagMenu}
                    keepMounted
                    open={Boolean(openTagMenu)}
                    onClose={() => this.setState({ openTagMenu: null })}
                >
                    {tagCardArray.map(el => {
                        let tag = el;
                        if (typeof el !== 'string') {
                            tag = el.title;
                        }
                        return <MenuItem key={tag}
                            selected={tag === tagCard}
                            style={{ placeContent: 'space-between' }}
                            onClick={e => {
                                const settings = { ...this.state.settings, tagCard: tag };
                                this.setState({ openTagMenu: null, settings }, () => {
                                    this.props.onChange(settings);
                                    this.onTagChange(tag);
                                });
                            }}>{I18n.t(tag)}{typeof el !== 'string' && el.title2 && <div style={{ marginLeft: 4 }}>{el.title2}</div>}</MenuItem>
                    })}
                </Menu>
            </div>;
        }

        return result;
    };

    tagGenerateNew = () => {
        const { tagCardArray, settings, settings: { tagCard } } = this.state;
        let newTagCardArray = [...tagCardArray]
        if (typeof newTagCardArray[0] !== 'string') {
            newTagCardArray = newTagCardArray.map(el => el.title);
        }

        if (tagCard && newTagCardArray.length < 4) {
            const newSettings = { ...settings };
            const newTagCard = newTagCardArray[(newTagCardArray.indexOf(tagCard) + 1) % newTagCardArray.length]
            newSettings.tagCard = newTagCard;
            this.setState({ settings: newSettings }, () => {
                this.props.onChange(newSettings);
                this.onTagChange(newTagCard);
            });
        }
    };

    componentDidMount = () => {
        this.onTagChange();
        // detect changes
    };

    componentDidUpdate = prevProps => {
        if (this.props.acceptedBy !== 'triggers' && this.props.onUpdate) {
            setTimeout(() => this.onUpdate(), 0);
        }
    }

    onChangeInput = attribute => {
        return (value, attr, cb) => {
            const settings = JSON.parse(JSON.stringify(this.state.settings));

            if (typeof value === 'object' && (!attr || typeof attr === 'function')) {
                Object.keys(value).forEach(_attr => settings[_attr] = value[_attr]);
            } else {
                settings[attr || attribute] = value;
            }
            settings.id = this.getData().id;
            settings._id = this.props._id;

            this.setState({ settings }, () => {
                this.onValueChanged(value, attr || attribute);
                this.props.onChange(settings);
                cb && cb();
            });
        }
    }

    render = () => {
        const { inputs, name, icon, iconTag, settings, adapter, settings: { tagCard } } = this.state;
        const { socket, notFound } = this.props;

        return <Fragment>
            {iconTag ? this.renderIconTag() :
                <MaterialDynamicIcon iconName={icon} className={cls.iconThemCard} adapter={adapter} socket={socket} />}
            <div className={cls.blockName}>
                <span className={cls.nameCard}>
                    {name && name.en}
                    {!!notFound ? `${settings.id} not found` : ''}
                </span>
                {inputs.filter(({ nameRender }) => this[nameRender])
                    .map(input => {
                        const { nameRender, defaultValue, attr, options } = input;
                        return this[nameRender](
                            input,
                            settings[attr] !== undefined ? settings[attr] : defaultValue,
                            this.onChangeInput(attr),
                            options || []
                        );
                    })}
            </div>
            {tagCard && <div className={cls.controlMenuTop} style={{ opacity: 1, height: 22, top: -22 }}>
                <div onClick={() => this.tagGenerateNew()} className={cls.tagCard}>{this.tagGenerate()}</div>
            </div>}
        </Fragment>;
    };
}

export default GenericBlock;