import { Observable }                     from "../../observable.js";
import { SimpleAttributeInputController } from "../simpleForm/simpleInputController.js";
import { SimpleInputModel }               from "../simpleForm/simpleInputModel.js";
import { ColumnOptionsComponent }         from "./columnOptionsComponent.js";
import { SelectedOptionController }       from "./optionsController.js";
import { nullOption }                     from "./optionsModel.js";

export { SelectController };


/**
 * Internal, mutable, singleton state to make select id unique.
 * @private
 */
let idCounter = 0;


/**
 * @typedef SelectAttributes
 * @property { String? }  label
 * @property { String? }  name
 * @property { Boolean? } isRequired                    - select need to have value selected in form, default false
 * @property { Boolean? } isDisabled                    - selected value can not be changed, default false
 * @property { Boolean? } sortOptionsAlphabetically     - sort the values of each column, default true
 * @property { Boolean? } isCursorPositionWithSelection - the keyboard action also effects the selection change, default false
 */

/**
 * @typedef SelectControllerType
 * @property { () => String }                    getId
 * @property { () => Number }                    getNumberOfColumns
 * @property { () => SimpleInputControllerType } getInputController
 * @property { () => Boolean }                   isCursorPositionWithSelection

 * @property { () => Boolean }                   isRequired
 * @property { (Boolean) => void }               setRequired
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onRequiredChanged

 * @property { () => Boolean }                   isDisabled
 * @property { (Boolean) => void }               setDisabled
 * @property { (cb: ValueChangeCallback<Boolean>) => void }    onDisabledChanged

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
 * @property { (max: Number, min: Number) => void }            clearColumnOptions
 * @property { (Number) => void }                clearSelectedOptions
 * @property { (Number) => ColumnOptionsComponentType }        getColumnOptionsComponent
 */

/**
 * SelectController maintains a number given of {@link ColumnOptionsComponent}.
 * The visibility of both - options and selected option - views are held by observables.
 * The name and label used for the html input element are as well managed here.
 * @param { SelectAttributes }
 * @param { Number }           numberOfColumns
 * @returns { SelectControllerType }
 * @constructor
 * @example
        const selectController = SelectController({
            label: 'City',
            name:  'city'
        }, 2);
 */
const SelectController = ({
    label = "",
    name = "",
    isRequired = false,
    isDisabled = false,
    isCursorPositionWithSelection = false,
}, numberOfColumns = 1
) => {
    const id = "select-component-" + idCounter++;

    // beware of negative numbers
    numberOfColumns = Math.max(numberOfColumns, 1);

    const cursorPositionController = SelectedOptionController();
    const columns = Array(numberOfColumns)
        .fill("")
        .map((_, col) => ColumnOptionsComponent(cursorPositionController, col));

    const selectedOptionVisibility  = Observable(true);
    const optionsVisibility         = Observable(false);
    const required                  = Observable(isRequired);
    const disabled                  = Observable(isDisabled);

    const simpleInputStructure = SimpleInputModel(/** @type { AttributeType<String> } */ {
        label: label,
        value: columns[0].getSelectedOption().getValue(),
        name : name,
        type : "text",
    });
    const inputController = SimpleAttributeInputController(simpleInputStructure);

    columns[0].onOptionSelected((option) => {
        if (!disabled.getValue()) {
            inputController.setValue(option.getValue());
            inputController.setValid(
                !required.getValue() ||
                    (option.getId() !== nullOption.getId() && required.getValue())
            );
        }
    });

    disabled.onChange((newValue) => {
        columns.forEach((column) => {
            column.setSelectedOptionDisabled(newValue);
        });
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
        if (maxCol <= 0) {
            return [selectedOption];
        }
        return [...getSelectedOptionOfColumns(maxCol - 1), selectedOption];
    };

    return {
        getId                         : () => id,
        getNumberOfColumns            : () => numberOfColumns,
        getInputController            : () => inputController,
        isCursorPositionWithSelection : () => isCursorPositionWithSelection,

        isRequired       : required.getValue,
        setRequired      : required.setValue,
        onRequiredChanged: required.onChange,

        isDisabled       : disabled.getValue,
        setDisabled      : disabled.setValue,
        onDisabledChanged: disabled.onChange,

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
