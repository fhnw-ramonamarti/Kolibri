import { projectColumnOptionsView }                    from "./columnOptionsProjector.js";
import { OptionsController, SelectedOptionController } from "./optionsController.js";

export { ColumnOptionsComponent };

/**
 * @typedef ColumnOptionsComponentType
 * @property { (OptionType) => Boolean }          containsOption
 * @property { (OptionType) => void }             addOption
 * @property { (OptionType) => void }             delOption
 * @property { () => void }                       clearOptions

 * @property { ()  => OptionType }                getSelectedOption
 * @property { (OptionType)  => void }            setSelectedOption
 * @property { (OptionType)  => Boolean }         isSelectedOption
 * @property { ()  => void }                      clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected

 * @property { () => HTMLDivElement }             getColumnView
 */

/**
 * ColumnOptionsComponent maintains a {@link OptionsController} and 
 * a {@link SelectedOptionController} as well it creates the view.
 * It supports replacing all current options by new passed options.
 * @param { SelectedOptionControllerType } cursorPositionController 
 * @param { Number }                       columnNumber
 * @return { ColumnOptionsComponentType }
 * @example
        const cursorPositionController = SelectedOptionController();
        const columnOptionsComponent = ColumnOptionsComponent(
            cursorPositionController,
            1
        );
 */
const ColumnOptionsComponent = (cursorPositionController, columnNumber = 0) => {
    const optionsController        = OptionsController();
    const selectedOptionController = SelectedOptionController();
    
    const columnView = projectColumnOptionsView(
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
        containsOption: optionsController.containsOption,
        addOption     : optionsController.addOption,
        delOption     : optionsController.delOption,
        clearOptions  : clearOptions,

        getSelectedOption  : selectedOptionController.getSelectedOption,
        setSelectedOption  : selectedOptionController.setSelectedOption,
        isSelectedOption   : selectedOptionController.isSelectedOption,
        clearSelectedOption: selectedOptionController.clearSelectedOption,
        onOptionSelected   : selectedOptionController.onOptionSelected,
        
        getColumnView   : () => columnView,
    }
}
