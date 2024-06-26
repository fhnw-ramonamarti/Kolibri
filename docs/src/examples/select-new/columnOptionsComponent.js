import { projectColumnOptionsView }                    from "./columnOptionsProjector.js";
import { OptionsController, SelectedOptionController } from "./optionsController.js";

export { ColumnOptionsComponent };

/**
 * @typedef ColumnOptionsComponentType
 * @property { () => Array<OptionType> }          getOptions
 * @property { (Array<OptionType>) => void }      addOptions
 * @property { (Array<OptionType>) => void }      delOptions
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

    const [columnViewShadow] = projectColumnOptionsView(
        optionsController,
        selectedOptionController,
        cursorPositionController,
        columnNumber,
        true
    );

    /**
     * @param { Array<OptionType> } options 
     */
    const addAllOptions = (options) => {
        options.forEach((option) => {
            optionsController.addOption(option);
        });
        columnView.replaceChildren(...columnViewShadow.children);
    };

    /**
     * @param { Array<OptionType> } options 
     */
    const delOptions = (options) => {
        options.forEach((option) => {
            optionsController.delOption(option);
        });
        columnView.replaceChildren(...columnViewShadow.children);
    };

    const clearOptions = () => {
        optionsController.getOptions().forEach(option => {
            optionsController.delOption(option);
        });
        columnView.replaceChildren();
    }

    return {
        getOptions  : optionsController.getOptions,
        addOptions  : addAllOptions,
        delOptions  : delOptions,
        clearOptions: clearOptions,

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
