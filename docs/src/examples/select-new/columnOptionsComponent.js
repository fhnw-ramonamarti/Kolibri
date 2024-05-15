import { OptionsController, SelectedOptionController } from "./optionsController";

export { ColumnOptionsComponent };

/**
 * @typedef ColumnOptionsComponentType
 * @property { (OptionType) => void } addOption
 * @property { (OptionType) => void } delOption

 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected

 * @property { () => HTMLDivElement } getColumnView
 */

/**
 * 
 * @param { SelectedOptionControllerType } cursorPositionController 
 */
const ColumnOptionsComponent = (cursorPositionController) => {
    const optionsController        = OptionsController();
    const selectedOptionController = SelectedOptionController();
    
    const columnView = projectColumnOptionsView(
        optionsController,
        selectedOptionController,
        cursorPositionController
    );

    return {
        addOption       : optionsController.addOptions,
        delOption       : optionsController.delOptions,

        onOptionSelected: selectedOptionController.onOptionSelected,
        
        getColumnView   : () => columnView,
    }
}
