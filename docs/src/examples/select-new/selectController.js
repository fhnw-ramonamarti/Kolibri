import { Observable }                     from "../../kolibri/observable.js";
import { SimpleAttributeInputController } from "../../kolibri/projector/simpleForm/simpleInputController.js";
import { SimpleInputModel }               from "../../kolibri/projector/simpleForm/simpleInputModel.js";
import { ColumnOptionsComponent }         from "./columnOptionsComponent.js";
import { SelectedOptionController }       from "./optionsController.js";

export { SelectController };


/**
 * Internal, mutable, singleton state to make select id unique.
 * @private
 */
let idCounter = 0;


/**
 * @typedef SelectAttribute
 * @property { ?String } label
 * @property { ?String } name
 * @property { ?Number } numberOfColumns - default 1
 */

/**
 * @typedef SelectControllerType
 * @property { () => String }                    getId
 * @property { () => Number }                    getNumberOfColumns

 * @property { () => SimpleInputControllerType } getInputController
 * @property { () => String }                    getInputValue
 * @property { (String) => void }                setInputValid

 * @property { () => Boolean }                   isOptionsVisible
 * @property { (Boolean) => void }               setOptionsVisibility
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onOptionsVisibilityChange

 * @property { () => Boolean }                   isSelectedOptionVisible
 * @property { (Boolean) => void }               setSelectedOptionVisibility
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onSelectedOptionVisibilityChange

 * @property { ()  => OptionType }               getCursorPosition
 * @property { (OptionType) => void }            setCursorPosition
 * @property { () => void }                      clearCursorPosition
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onCursorPositionChanged

 * @property { () => OptionType }                getSelectedValueOption
 * @property { (OptionType) => void }            setSelectedValueOption
 * @property { () => void }                      clearSelectedValueOption
 
 * @property { (Number) => void }                getSelectedOptionOfColumns
 * @property { (Number) => Array<OptionType> }   clearColumnOptions
 * @property { (Number) => ColumnOptionsComponentType }        getColumnOptionsComponent
 */

/**
 * SelectController maintains a number given of {@link ColumnOptionsComponent}.
 * The visibility of both - options and selected option - views are held by observables.
 * The name and label used for the html input element are as well managed here.
 * @param { SelectAttribute }
 * @returns { SelectControllerType }
 * @constructor
 * @example
        const selectController = SelectController({
            label: 'City',
            name:  'city',
            numberOfColumns: 2
        });
 */
const SelectController = ({ label = "", name = "", numberOfColumns = 1}) => {
    const id = "select-component-" + idCounter++;

    // beware of negative numbers
    numberOfColumns = Math.max(numberOfColumns, 1);

    const cursorPositionController = SelectedOptionController();
    const columns = Array(numberOfColumns)
        .fill("")
        .map((_, col) => ColumnOptionsComponent(cursorPositionController, col));

    const selectedOptionVisibility  = Observable(true);
    const optionsVisibility         = Observable(false);

    const simpleInputStructure = SimpleInputModel({
        label: label,
        value: columns[0].getSelectedOption().getValue(),
        name : name,
        type : "hidden",
    });
    const inputController = SimpleAttributeInputController(simpleInputStructure);

    columns[0].onOptionSelected((option) => {
        inputController.setValue(option.getValue());
    });

    /**
     * @param { Number } maxCol - max column number to delete the options from until column 0
     */
    const clearSelectedOptions = (maxCol) => {
        if (maxCol <= 0) {
            return;
        }
        columns[maxCol].clearSelectedOption();
        clearSelectedOptions(maxCol - 1);
    };

    /**
     * @param { Number } maxCol - max column number to delete the options from until column 0
     * @param { Number } minCol - min column number to delete the options to
     */
    const clearColumnOptions = (maxCol, minCol = 0) => {
        minCol = Math.max(0, minCol);
        if (maxCol < minCol) {
            return;
        }
        columns[maxCol].clearOptions();
        clearColumnOptions(maxCol - 1, minCol);
    };

    /**
     * @param { Number } maxCol  - max column number to delete the options from until column 0
     * @returns { Array<OptionType> }
     */
    const getSelectedOptionOfColumns = (maxCol = numberOfColumns - 1) => {
        const selectedOption = columns[maxCol].getSelectedOption();
        if(maxCol <= 0){
            return [selectedOption];
        }
        return [...getSelectedOptionOfColumns(maxCol - 1), selectedOption];
    };

    return {
        getId           : () => id,
        getNumberOfColumns: () => numberOfColumns,

        getInputController : () => inputController,
        getInputValue      : inputController.getValue,
        setInputValid      : inputController.setValid,

        isOptionsVisible         : optionsVisibility.getValue,
        setOptionsVisibility     : optionsVisibility.setValue,
        onOptionsVisibilityChange: optionsVisibility.onChange,

        isSelectedOptionVisible         : selectedOptionVisibility.getValue,
        setSelectedOptionVisibility     : selectedOptionVisibility.setValue,
        onSelectedOptionVisibilityChange: selectedOptionVisibility.onChange,
        
        getCursorPosition      : cursorPositionController.getSelectedOption,
        setCursorPosition      : cursorPositionController.setSelectedOption,
        clearCursorPosition    : cursorPositionController.clearSelectedOption,
        onCursorPositionChanged: cursorPositionController.onOptionSelected,

        getSelectedValueOption   : columns[0].getSelectedOption,
        setSelectedValueOption   : columns[0].setSelectedOption,
        clearSelectedValueOption : columns[0].clearSelectedOption,
        
        getSelectedOptionOfColumns: getSelectedOptionOfColumns,
        clearColumnOptions        : clearColumnOptions,
        clearSelectedOptions      : clearSelectedOptions,
        getColumnOptionsComponent : (col) => columns[col],
    }
};
