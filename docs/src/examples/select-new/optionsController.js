import { OptionsModel, SelectedOptionModel } from "./optionsModel.js";

export { OptionsController, SelectedOptionController };

/**
 * @typedef OptionsControllerType
 * @property { () => Array<OptionType> }               getOptions
 * @property { (model:OptionType) => void }            addOption
 * @property { (model:OptionType) => void }            delOption
 * @property { (cb:ConsumerType<OptionType>) => void } onOptionAdd
 * @property { (cb:ConsumerType<OptionType>) => void } onOptionDel
 */

/**
 * OptionsController maintains an {@link OptionsModel}.
 * @return { OptionsControllerType }
 * @constructor
 */
const OptionsController = () => {

    const optionsModel = OptionsModel();

    const addOption = (option) => {
        if(!optionsModel.getList().includes(option)){
            optionsModel.getObsList().add(option);
        }
    };

    return {
        getOptions  : optionsModel.getList,
        addOption   : addOption,
        delOption   : optionsModel.getObsList().del,
        onOptionAdd : optionsModel.getObsList().onAdd,
        onOptionDel : optionsModel.getObsList().onDel,
    }
};


/**
 * @typedef SelectedOptionControllerType
 * @property { ()  => OptionType }        getSelectedOption
 * @property { (OptionType) => void }     setSelectedOption
 * @property { () => void }               clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelection
 */

/**
 * SelectedOptionController takes a {@link SelectedOptionModel} that will serve 
 * as a representation of a selection.
 * Listeners to selection changes will react by synchronizing with the selection.
 * @return { SelectedOptionControllerType }
 * @constructor
 */
const SelectedOptionController = () => {

    const selectedOptionModel = SelectedOptionModel();

    return {
        getSelectedOption  : selectedOptionModel.getSelectedOption,
        setSelectedOption  : selectedOptionModel.setSelectedOption,
        clearSelectedOption: selectedOptionModel.clearSelectedOption,
        onOptionSelection  : selectedOptionModel.onOptionSelected,
    }
};
