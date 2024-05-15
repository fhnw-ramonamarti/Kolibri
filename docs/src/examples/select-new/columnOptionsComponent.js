import { projectColumnOptionsView }                    from "./columnOptionsProjector.js";
import { OptionsController, SelectedOptionController } from "./optionsController.js";

export { ColumnOptionsComponent };

/**
 * @typedef ColumnOptionsComponentType
 * @property { (OptionType) => void }        addOption
 * @property { (OptionType) => void }        delOption
 * @property { (ops: Array<OptionType>) => void } replaceOptions

 * @property { ()  => OptionType }                             getSelectedOption
 * @property { (OptionType)  => void }                         setSelectedOption
 * @property { ()  => void }                                   clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected

 * @property { () => HTMLDivElement } getColumnView
 */

/**
 * 
 * @param { SelectedOptionControllerType } cursorPositionController 
 * @param { ?Number }                      columnNumber 
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

    /**
     * 
     * @param { Array<OptionType> } options 
     */
    const replaceOptions = (options) => {
        optionsController.getOptions().forEach(option => {
            optionsController.delOption(option);
        });
        options.forEach(option => {
            optionsController.addOption(option);
        });
    }

    return {
        addOption     : optionsController.addOption,
        delOption     : optionsController.delOption,
        replaceOptions: replaceOptions,

        getSelectedOption  : selectedOptionController.getSelectedOption,
        setSelectedOption  : selectedOptionController.setSelectedOption,
        clearSelectedOption: selectedOptionController.clearSelectedOption,
        onOptionSelected   : selectedOptionController.onOptionSelected,
        
        getColumnView   : () => columnView,
    }
}
