import { projectColumnOptionsView, updateScrollbar }   from "./columnOptionsProjector.js";
import { OptionsController, SelectedOptionController } from "./optionsController.js";

export { ColumnOptionsComponent };

/**
 * @typedef ColumnOptionsComponentType
 * @property { () => Array<OptionType> }           getOptions
 * @property { (opts: Array<OptionType>) => void } addOptions
 * @property { (opts: Array<OptionType>) => void } delOptions
 * @property { () => void }                        clearOptions

 * @property { ()  => OptionType }                 getSelectedOption
 * @property { (OptionType)  => void }             setSelectedOption
 * @property { ()  => void }                       clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected
 
 * @property { ()  => Boolean }                    isSelectedOptionDisabled
 * @property { (Boolean) => void }                 setSelectedOptionDisabled
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onSelectedOptionDisabledChanged

 * @property { () => HTMLDivElement }              getColumnView
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

    /**
     * @returns { HTMLDivElement } - placeholder while loading
     */
    const createHolder = () => {
        const placeHolder = document.createElement('div');
        placeHolder.classList.add('column-holder');
        placeHolder.classList.add('options-column');
        const loader = document.createElement('div');
        loader.classList.add('column-loader');
        placeHolder.appendChild(loader);
        return placeHolder;
    };

    /**
     * @param { Array<OptionType> } options 
     */
    const addAllOptions = (options) => {
        const placeHolder = createHolder();
        columnView.replaceWith(placeHolder);
        if(options.length > 50){
            setTimeout(
                () => {
                    options.forEach((option) => {
                        optionsController.addOption(option);
                    });
                    updateScrollbar(columnView);
                    placeHolder.replaceWith(columnView);
                }, 80
            );
        } else {
            options.forEach((option) => {
                optionsController.addOption(option);
            });
            placeHolder.replaceWith(columnView);
            updateScrollbar(columnView);
        }
    };

    /**
     * @param { Array<OptionType> } options 
     */
    const delOptions = (options) => {
        const placeHolder = createHolder();
        columnView.replaceWith(placeHolder);
        options.forEach((option) => {
            optionsController.delOption(option);
        });
        placeHolder.replaceWith(columnView);
        updateScrollbar(columnView);
    };

    const clearOptions = () => {
        const placeHolder = createHolder();
        columnView.replaceWith(placeHolder);
        optionsController.getOptions().forEach((option) => {
            optionsController.delOption(option);
        });
        placeHolder.replaceWith(columnView);
        updateScrollbar(columnView);
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
        
        getColumnView: () => columnView,
    }
}
