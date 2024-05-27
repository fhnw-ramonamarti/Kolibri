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
 * @property { ?Number } numberColumns - default 1
 */

/**
 * @typedef SelectControllerType
 * @property { () => String }                    getId
 * @property { () => Number }                    getNumberColumns

 * @property { () => SimpleInputControllerType } getInputController
 * @property { () => String }                    getInputValue
 * @property { (String) => void }                setInputValid
 * @property { (cb: ValueChangeCallback<String>) => void }     onInputValueChanged
 * @property { (cb: ValueChangeCallback<String>) => void }     onInputLabelChanged
 * @property { (cb: ValueChangeCallback<String>) => void }     onInputNameChanged

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
 * @property { (Number) => ColumnOptionsComponentType }        getColumnOptionsComponent
 */

/**
 * SelectController maintains a number given of {@link ColumnOptionsComponent}.
 * The visibility of both - options and selected option - views are held by observables.
 * The name and label used for the html input element are as well managed here.
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

    const simpleInputStructure = SimpleInputModel({
        label: label,
        value: columns[0].getSelectedOption().getValue(),
        name: name,
        type: "hidden",
    });
    const inputController = SimpleAttributeInputController(simpleInputStructure);

    /**
     * @param { Number } maxCol - max column number to delete the options from until column 0
     */
    const clearColumnOptions = (maxCol) => {
        if (maxCol < 0) {
            return;
        }
        columns[maxCol].replaceOptions([]);
        clearColumnOptions(maxCol - 1);
    };

    return {
        getId           : () => id,
        getNumberColumns: () => numberColumns,

        getInputController : () => inputController,
        getInputValue      : inputController.getValue,
        setInputValid      : inputController.setValid,
        onInputValueChanged: inputController.onValueChanged,
        onInputLabelChanged: inputController.onLabelChanged,
        onInputNameChanged : inputController.onNameChanged,

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
        clearColumnOptions       : clearColumnOptions,
        getColumnOptionsComponent: (col) => columns[col],
    }
};
