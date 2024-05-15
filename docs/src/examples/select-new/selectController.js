import { Observable }               from "../../kolibri/observable.js";
import { ColumnOptionsComponent }   from "./columnOptionsComponent.js";
import { SelectedOptionController } from "./optionsController.js";

export { SelectController };


/**
 * Internal, mutable, singleton state to make option id unique.
 * @private
 */
let idCounter = 0;


/**
 * @typedef SelectAttribute
 * @property { ?String } label
 * @property { ?String } name
 * @property { ?Number } numberColumns - default 1
 */

/**
 * @typedef SelectControllerType
 * @property { () => String }                   getId
 * @property { () => Number }                   getNumberColumns

 * @property { () => String }                   getLabel
 * @property { (String) => void }               setLabel
 * @property { (cb: ValueChangeCallback<String>) => void }     onLabelChange

 * @property { () => String }                   getName
 * @property { (String) => void }               setName
 * @property { (cb: ValueChangeCallback<String>) => void }     onNameChange

 * @property { () => Boolean }                  isOptionsVisible
 * @property { (Boolean) => void }              setOptionsVisibility
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onOptionsVisibilityChange

 * @property { () => Boolean }                  isSelectedOptionVisible
 * @property { (Boolean) => void }              setSelectedOptionVisibility
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onSelectedOptionVisibilityChange

 * @property { ()  => OptionType }              getCursorPosition
 * @property { (OptionType) => void }           setCursorPosition
 * @property { () => void }                     clearCursorPosition
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onCursorPositionChanged

 * @property { () => OptionType }               getSelectedValueOption
 * @property { (OptionType) => void }           setSelectedValueOption
 * @property { () => void }                     clearSelectedValueOption
 * @property { (Number) => ColumnOptionsComponentType }        getColumnOptionsComponent
 */

/**
 * @param { SelectAttribute }
 * @return { SelectControllerType }
 * @constructor
 */
const SelectController = ({ label = "", name = "", numberColumns = 1}) => {
    const id = "select-component-" + idCounter++;

    // beware of negative numbers
    numberColumns = Math.max(numberColumns, 1);

    const cursorPositionController = SelectedOptionController();
    const columns = Array(numberColumns).fill("").map((_, col) => ColumnOptionsComponent(cursorPositionController, col));

    const selectedOptionVisibility  = Observable(true);
    const optionsVisibility         = Observable(false);

    const nameObs  = Observable(name);
    const labelObs = Observable(label);

    return {
        getId           : () => id,
        getNumberColumns: () => numberColumns,

        getLabel     : labelObs.getValue,
        setLabel     : labelObs.setValue,
        onLabelChange: labelObs.onChange,

        getName     : nameObs.getValue,
        setName     : nameObs.setValue,
        onNameChange: nameObs.onChange,

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
        getColumnOptionsComponent: (col) => columns[col],
    }
};
