import { OptionsModel, SelectedOptionModel } from "./optionsModel.js";

export { OptionsController, SelectedOptionController };

/**
 * @typedef OptionsControllerType
 * @property { () => Boolean }                          areOptionsSorted
 * @property { (Boolean) => void }                      setOptionsSorted
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
    /** @type { Boolean } */
    let sortOptions = true;

    return {
        areOptionsSorted: () => sortOptions,
        setOptionsSorted: (newVal) => sortOptions = newVal,
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

    return {
        getSelectedOption  : selectedOptionModel.getSelectedOption,
        setSelectedOption  : selectedOptionModel.setSelectedOption,
        clearSelectedOption: selectedOptionModel.clearSelectedOption,
        onOptionSelected   : selectedOptionModel.onOptionSelected,
    }
};
