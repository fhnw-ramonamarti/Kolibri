import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import {
    VALID,
    VALUE,
    EDITABLE,
    LABEL,
    NAME,
    TYPE,
    PLACEHOLDER,
    LIST_ELEMENTS,
    SELECTION_ELEMENTS,
    FOCUS_ELEMENT,
    DEBOUNCE_TEXT,
    CHOICEBOX_OPEN,
} from "../../docs/src/kolibri/presentationModel.js";

import { countryList } from "../countries.js";
import { ChoiceInputModel2, ChoiceAttribute } from "./choiceInputModel.js";

export { ChoiceInputController, ALL, COUMN_NAMES };

/** Constants */
const ALL = "All";
let COUMN_NAMES = ["continent", "name"];

// todo to be changed in future versions - currently fixed element list
const activeCountryList = (continent = ALL) => countryList.filter((e) => [e.continent, ALL].includes(continent));

/**
 * @typedef { object } ChoiceInputControllerType
 * @template _T_
 * @property { ()  => _T_ }                         getListObjects
 * @property { (List<Map<String,_T_>>)  => void }   setListObjects
 * @property { ()  => _T_ }                         getSelectedObject
 * @property { (Map<String,_T_>)  => void }         setSelectedObject
 * @property { ()  => Map<String,_T_> }             getFocusedObject
 * @property { (Map<String,_T_>)  => void }         setFocusedObject
 * @property { ()  => _T_ }                         getValue
 * @property { (_T_) => void }                      setValue
 * @property { ()  => String}                       getType
 * @property { (String)  => void}                   setDebounceText
 * @property { ()  => String}                       getDebounceText
 * @property { (Boolean) => void}                   setChoiceboxOpen
 * @property { ()  => Boolean}                      getChoiceboxOpen
 * @property { (valid: !Boolean) => void }          setValid
 * @property { (Number) => void }                   setTimeout
 * @property { () => void }                         triggerDebounceInput
 * @property { (converter: Converter<_T_>)        => void } setConverter
 * @property { (cb: ValueChangeCallback<String>)  => void } onLabelChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onValidChanged
 * @property { (cb: ValueChangeCallback<List<Map<String,_T_>>>) => void } onListObjectsChanged
 * @property { (cb: ValueChangeCallback<Map<String,_T_>>)       => void } onSelectedObjectChanged
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onFocusedObjectChanged
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onValueChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onNameChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onPlaceholderChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onDebounceTextChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onEditableChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onChoiceboxOpenChanged
 */

/**
 * The ChoiceInputController gives access to a {@link ChoiceInputModel} but in a limited fashion.
 * It does not expose the underlying {@link ChoiceAttribute} but only those functions that a user of this
 * controller needs to see.
 * While controllers might contain business logic, this basic controller does not contain any.
 * @constructor
 * @template _T_
 * @param  { ChoiceInputAttributes<_T_> } args
 * @return { ChoiceInputControllerType<_T_> }
 * @example
 *     const controller = SimpleInputController({
            listObjects :   [{country: "Switzerland", continent: "Europe"}, 
                                {country: "United States", continent:"North America"}, 
                                {country: "Germany", continent: "Europe"}],
            selcectedObject :  {continent: "Europe"},
            focusedObject : {column:1, value:"Switzerland"},
            filledValue :   "",
            placeholder:    "Choose Country",
            label:          "Country",
            name:           "country",
            colNames:       ["continent","country"],
     });
 */
const ChoiceInputController = (args) => {
    COUMN_NAMES = args.colNames;
    return ChoiceAttributeInputController(ChoiceInputModel2({ ...args }));
};

const ChoiceAttributeInputController = (attribute) => {
    // ------Debounce-start---------------------------------------------
    let timeout = 800;

    const decounceController = SimpleInputController({
        value: "",
        name : "debounce",
        type : "text",
    });

    const [_, debounceInput] = InputProjector.projectDebounceInput(timeout)(decounceController, "countryField");

    decounceController.onValueChanged((text) => {
        if (text !== "") {
            let firstFittingCountry = activeCountryList()
                .map((e) => e.name)
                .find((e) => e.toLowerCase().startsWith(attribute.getObs(DEBOUNCE_TEXT).getValue().toLowerCase()));
            console.debug("Debounce: " + text + " - " + firstFittingCountry); // todo DEBUG
            if (firstFittingCountry) {
                attribute
                    .getObs(FOCUS_ELEMENT)
                    .setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), value: firstFittingCountry });
                if (!attribute.getObs(CHOICEBOX_OPEN).getValue()) {
                    attribute.getObs(SELECTION_ELEMENTS).setValue({
                        ...attribute.getObs(SELECTION_ELEMENTS).getValue(),
                        [COUMN_NAMES[1]]: firstFittingCountry,
                    });
                }
            }
        }
        debounceInput.querySelector("input").value = "";
    });

    // ------Debounce-end-----------------------------------------------

    return {
        getListObjects         : attribute.getObs(LIST_ELEMENTS).getValue,
        setListObjects         : attribute.getObs(LIST_ELEMENTS).setValue,
        getSelectedObject      : attribute.getObs(SELECTION_ELEMENTS).getValue,
        setSelectedObject      : attribute.getObs(SELECTION_ELEMENTS).setValue,
        getFocusedObject       : attribute.getObs(FOCUS_ELEMENT).getValue,
        setFocusedObject       : attribute.getObs(FOCUS_ELEMENT).setValue,
        setValue               : attribute.setConvertedValue,
        getValue               : attribute.getObs(VALUE).getValue,
        setValid               : attribute.getObs(VALID).setValue,
        getType                : attribute.getObs(TYPE).getValue,
        getDebounceText        : attribute.getObs(DEBOUNCE_TEXT).getValue,
        setDebounceText        : attribute.getObs(DEBOUNCE_TEXT).setValue,
        getChoiceboxOpen       : attribute.getObs(CHOICEBOX_OPEN).getValue,
        setChoiceboxOpen       : attribute.getObs(CHOICEBOX_OPEN).setValue,
        onListObjectsChanged   : attribute.getObs(LIST_ELEMENTS).onChange,
        onSelectedObjectChanged: attribute.getObs(SELECTION_ELEMENTS).onChange,
        onFocusedObjectChanged : attribute.getObs(FOCUS_ELEMENT).onChange,
        onValueChanged         : attribute.getObs(VALUE).onChange,
        onValidChanged         : attribute.getObs(VALID).onChange,
        onLabelChanged         : attribute.getObs(LABEL).onChange,
        onNameChanged          : attribute.getObs(NAME).onChange,
        onPlaceholderChanged   : attribute.getObs(PLACEHOLDER).onChange,
        onEditableChanged      : attribute.getObs(EDITABLE).onChange,
        onDebounceTextChanged  : attribute.getObs(DEBOUNCE_TEXT).onChange,
        onChoiceboxOpenChanged : attribute.getObs(CHOICEBOX_OPEN).onChange,
        setConverter           : attribute.setConverter,
        setTimeout             : (newVal) => (timeout = newVal),
        triggerDebounceInput   : (key) => {
            attribute.getObs(DEBOUNCE_TEXT).setValue(decounceController.getValue() + key);
            decounceController.setValue(decounceController.getValue() + key);
            debounceInput.querySelector("input").dispatchEvent(new Event("input"));
        },
    };
};
