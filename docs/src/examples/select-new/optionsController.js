import { OptionsModel, SelectedOptionModel } from "./optionsModel.js";

export { OptionsController, SelectedOptionController };

/**
 * @typedef OptionsControllerType
 * @property { () => Boolean }                          areOptionsSorted
 * @property { (Boolean) => void }                      setOptionsSorted
 * @property { () => Array<OptionType> }                getOptions
 * @property { (OptionType) => Boolean }                containsOption
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
    let   sortOptions  = true;

    /**
    * @param { OptionType } option 
    * @returns { Boolean } - option with value and label already in options list
    */
    const containsOption = (option) => {
        return optionsModel.getList().findIndex(o => optionEquals(o, option)) >= 0;
    };

    /**
     * @param { OptionType } option
     */
    const addOption = (option) => {
        if(!containsOption(option)) {
            optionsModel.getObsList().add(option);
        }
    };

    return {
        areOptionsSorted: () => sortOptions,
        setOptionsSorted: (newVal) => sortOptions = newVal,
        getOptions      : optionsModel.getList,
        containsOption  : containsOption,
        addOption       : addOption,
        delOption       : optionsModel.getObsList().del,
        onOptionAdd     : optionsModel.getObsList().onAdd,
        onOptionDel     : optionsModel.getObsList().onDel,
    }
};


/**
 * @typedef SelectedOptionControllerType
 * @property { ()  => OptionType }                             getSelectedOption
 * @property { (OptionType) => void }                          setSelectedOption
 * @property { (OptionType) => Boolean }                       isSelectedOption
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

    /**
     * @param { OptionType } option 
     * @returns { Boolean } - selected option is same as parameter
     */
    const isSelectedOption = (option) =>
        optionEquals(selectedOptionModel.getSelectedOption(), option);

    return {
        getSelectedOption  : selectedOptionModel.getSelectedOption,
        setSelectedOption  : selectedOptionModel.setSelectedOption,
        isSelectedOption   : isSelectedOption,
        clearSelectedOption: selectedOptionModel.clearSelectedOption,
        onOptionSelected   : selectedOptionModel.onOptionSelected,
    }
};

/**
 * Compares two options by value and label instead of their id.
 * @private
 * @param { OptionType } a 
 * @param { OptionType } b 
 * @returns { Boolean } - option with value and label are equal
 */
const optionEquals = (a, b) => a.getLabel() === b.getLabel() && a.getValue() === b.getValue();
