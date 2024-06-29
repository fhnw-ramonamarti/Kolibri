import { Observable }                        from "../../observable.js";
import { OptionsModel, SelectedOptionModel } from "./optionsModel.js";

export { OptionsController, SelectedOptionController };

/**
 * @typedef OptionsControllerType
 * @property { () => Array<OptionType> }                getOptions

 * @property { (OptionType) => void }                   addOption
 * @property { (OptionType) => void }                   delOption
 * @property { (cb: ConsumerType<OptionType>) => void } onOptionAdd
 * @property { (cb: ConsumerType<OptionType>) => void } onOptionDel
 */

/**
 * OptionsController maintains an {@link OptionsModel}.
 * It only adds options which are not already contained.
 * @returns { OptionsControllerType }
 * @constructor
 * @example
        const optionsController = OptionsController();
 */
const OptionsController = () => {

    const optionsModel = OptionsModel();

    return {
        getOptions      : optionsModel.getList,

        addOption       : optionsModel.getObsList().add,
        delOption       : optionsModel.getObsList().del,
        onOptionAdd     : optionsModel.getObsList().onAdd,
        onOptionDel     : optionsModel.getObsList().onDel,
    }
};


/**
 * @typedef SelectedOptionControllerType
 * @property { ()  => OptionType }                             getSelectedOption
 * @property { (OptionType) => void }                          setSelectedOption
 * @property { () => void }                                    clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected

 * @property { ()  => Boolean }                                isDisabled
 * @property { (Boolean) => void }                             setDisabled
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onDisabledChanged
 */

/**
 * SelectedOptionController takes a {@link SelectedOptionModel} that will serve
 * as a representation of a selection.
 * @returns { SelectedOptionControllerType }
 * @constructor
 * @example
        const selectedOptionController = SelectedOptionController();
 */
const SelectedOptionController = () => {

    const selectedOptionModel = SelectedOptionModel();
    const disabled            = Observable(false);

    const setSelectedOption = (option) => {
        if (!disabled.getValue()) {
            selectedOptionModel.setSelectedOption(option);
        }
    };

    const clearSelectedOption = () => {
        if (!disabled.getValue()) {
            selectedOptionModel.clearSelectedOption();
        }
    };

    return {
        getSelectedOption  : selectedOptionModel.getSelectedOption,
        setSelectedOption  : setSelectedOption,
        clearSelectedOption: clearSelectedOption,
        onOptionSelected   : selectedOptionModel.onOptionSelected,

        isDisabled       : disabled.getValue,
        setDisabled      : disabled.setValue,
        onDisabledChanged: disabled.onChange,
    }
};
