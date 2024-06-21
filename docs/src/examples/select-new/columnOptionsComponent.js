import { projectColumnOptionsView }                    from "./columnOptionsProjector.js";
import { OptionsController, SelectedOptionController } from "./optionsController.js";

export { ColumnOptionsComponent };

/**
 * @typedef ColumnOptionsComponentType
 * @property { (Boolean) => void }                setOptionsSorted
 * @property { () => Array<OptionType> }          getOptions
 * @property { (OptionType) => void }             addOption
 * @property { (OptionType) => void }             delOption
 * @property { () => void }                       clearOptions

 * @property { ()  => OptionType }                getSelectedOption
 * @property { (OptionType)  => void }            setSelectedOption
 * @property { ()  => void }                      clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected
 * @property { ()  => Boolean }                   isSelectedOptionDisabled
 * @property { (Boolean) => void }                setSelectedOptionDisabled
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onSelectedOptionDisabledChanged

 * @property { () => HTMLDivElement }             getColumnView
 */

/**
 * ColumnOptionsComponent maintains a {@link OptionsController} and 
 * a {@link SelectedOptionController} as well it creates the view.
 * It supports replacing all current options by new passed options.
 * @param { SelectedOptionControllerType } cursorPositionController 
 * @param { Number }                       columnNumber
 * @returns { ColumnOptionsComponentType }
 * @example
        const cursorPositionController = SelectedOptionController();
        const columnOptionsComponent = ColumnOptionsComponent(
            cursorPositionController,
            1
        );
 */
const ColumnOptionsComponent = (cursorPositionController, columnNumber = 0) => {
    const optionsController        = /** @type { OptionsControllerType } */ OptionsController();
    const selectedOptionController = SelectedOptionController();
    
    const [columnView] = projectColumnOptionsView(
        optionsController,
        selectedOptionController,
        cursorPositionController,
        columnNumber
    );

    const clearOptions = () => {
        optionsController.getOptions().forEach(option => {
            optionsController.delOption(option);
        });
    }

    return {
        setOptionsSorted: optionsController.setOptionsSorted,
        getOptions      : optionsController.getOptions,
        addOption       : optionsController.addOption,
        delOption       : optionsController.delOption,
        clearOptions    : clearOptions,

        getSelectedOption  : selectedOptionController.getSelectedOption,
        setSelectedOption  : selectedOptionController.setSelectedOption,
        clearSelectedOption: selectedOptionController.clearSelectedOption,
        onOptionSelected   : selectedOptionController.onOptionSelected,
        isSelectedOptionDisabled       : selectedOptionController.isDisabled,
        setSelectedOptionDisabled      : selectedOptionController.setDisabled,
        onSelectedOptionDisabledChanged: selectedOptionController.onDisabledChanged,
        
        getColumnView   : () => columnView,
    }
}
