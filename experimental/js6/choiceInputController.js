import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import {
    VALID,
    VALUE,
    LABEL,
    NAME,
    PLACEHOLDER,
    LIST_ELEMENTS,
    FOCUS_ELEMENT,
    DEBOUNCE_TEXT,
    CHOICEBOX_OPEN,
    EDITABLE,
} from "../../docs/src/kolibri/presentationModel.js";

import { ChoiceDetailModel, ChoiceMasterModel, ChoiceAttribute } from "./choiceInputModel.js";

export { ChoiceDetailController, ChoiceMasterController, ALL };

/** Constants */
const ALL = "All";

const ChoiceDetailController = (args) => {
    return ChoiceDetailAttributeController(ChoiceDetailModel({ ...args }));
};
const ChoiceMasterController =
    (categoryColumn, valueColumn, timeout = 800) =>
    (args) => {
        return ChoiceMasterAttributeController(categoryColumn, valueColumn, timeout)(ChoiceMasterModel({ ...args }));
    };

const ChoiceDetailAttributeController = (attribute) => {
    return {
        getValue: attribute.getObs(VALUE).getValue,
        setValue: attribute.setConvertedValue,
        getName: attribute.getObs(NAME).getValue,
        getLabel: attribute.getObs(LABEL).getValue,
        getPlaceholder: attribute.getObs(PLACEHOLDER).getValue,
        setValid: attribute.getObs(VALID).setValue,
        setConverter: attribute.setConverter,

        onValueChanged: attribute.getObs(VALUE).onChange,
        onValidChanged: attribute.getObs(VALID).onChange,
        onLabelChanged: attribute.getObs(LABEL).onChange,
        onNameChanged: attribute.getObs(NAME).onChange,
        onPlaceholderChanged: attribute.getObs(PLACEHOLDER).onChange,
        onEditableChanged: attribute.getObs(EDITABLE).onChange,
    };
};

const ChoiceMasterAttributeController = (categoryColumn, valueColumn, timeout) => (attribute) => {
    const colNames = [categoryColumn, valueColumn];
    const categories = ()=>[
        ALL,
        ...[
            ...new Set(
                attribute
                    .getObs(LIST_ELEMENTS)
                    .getValue()
                    .map((e) => e[categoryColumn])
            ),
        ].sort(),
    ];

    const elements = ()=>attribute
        .getObs(LIST_ELEMENTS)
        .getValue()
        .filter((e) => [e[categoryColumn], ALL].includes(attribute.getObs(VALUE).getValue()[categoryColumn]))
        .map((e) => e[valueColumn]);

    // ------Debounce-start---------------------------------------------

    const decounceController = SimpleInputController({
        value: attribute.getObs(DEBOUNCE_TEXT).getValue(),
        name: "country-debounce",
        type: "text",
    });

    const [_, debounceInput] = InputProjector.projectDebounceInput(timeout)(
        decounceController,
        "countryField-debounce"
    );

    decounceController.onValueChanged((text) => {
        if (text !== "") {
            // todo over filtered / all elems
            let firstFittingCountry = attribute
                .getObs(LIST_ELEMENTS)
                .getValue()
                .filter((e) => [e[categoryColumn], ALL].includes(attribute.getObs(VALUE).getValue()[categoryColumn]))
                .map((e) => e[valueColumn])
                .find((e) => e.toLowerCase().startsWith(attribute.getObs(DEBOUNCE_TEXT).getValue().toLowerCase()));
            console.debug("Debounce: " + text + " - " + firstFittingCountry); // todo DEBUG
            if (firstFittingCountry) {
                attribute
                    .getObs(FOCUS_ELEMENT)
                    .setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), value: firstFittingCountry });
                if (!attribute.getObs(CHOICEBOX_OPEN).getValue()) {
                    attribute.getObs(VALUE).setValue({
                        ...attribute.getObs(VALUE).getValue(),
                        [valueColumn]: firstFittingCountry,
                    });
                }
            }
        }
        debounceInput.querySelector("input").value = "";
    });

    // ------Debounce-end-----------------------------------------------

    const focusValue = () => attribute.getObs(FOCUS_ELEMENT).getValue().value;
    const setFocusedObject = (val) =>
        attribute.getObs(FOCUS_ELEMENT).setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), value: val });

    const setNeighborPrevCategory = () => {
        setFocusedObject(getNeighborPrev(focusValue(), categories()));
    };

    const setNeighborNextCategory = () => {
        setFocusedObject(getNeighborNext(focusValue(), categories()));
    };

    const setNeighborPrevValue = () => {
        setFocusedObject(getNeighborPrev(focusValue(), elements()));
    };

    const setNeighborNextValue = () => {
        setFocusedObject(getNeighborNext(focusValue(), elements()));
    };

    return {
        getColNames: () => colNames,
        getCategories: categories,
        getElements: elements,

        getValue: attribute.getObs(VALUE).getValue,
        setValue: (val) => attribute.getObs(VALUE).setValue({ ...attribute.getObs(VALUE).getValue(), ...val }),
        getValueList: attribute.getObs(LIST_ELEMENTS).getValue,
        setValueList: attribute.getObs(LIST_ELEMENTS).setValue,

        getFocusObject: attribute.getObs(FOCUS_ELEMENT).getValue,
        setFocusObject: (val) =>
            attribute.getObs(FOCUS_ELEMENT).setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), ...val }),
        setFocusToPrev: (val) => {
            if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 0) {
                setNeighborPrevCategory(val);
            }
            if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 1) {
                setNeighborPrevValue(val);
            }
        },
        setFocusToNext: (val) => {
            if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 0) {
                setNeighborNextCategory(val);
            }
            if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 1) {
                setNeighborNextValue(val);
            }
        },

        getDebounceText: attribute.getObs(DEBOUNCE_TEXT).getValue,
        setDebounceText: attribute.getObs(DEBOUNCE_TEXT).setValue,
        getChoiceboxOpen: attribute.getObs(CHOICEBOX_OPEN).getValue,
        setChoiceboxOpen: attribute.getObs(CHOICEBOX_OPEN).setValue,

        onValueChanged: attribute.getObs(VALUE).onChange,
        onValueListChanged: attribute.getObs(LIST_ELEMENTS).onChange,
        onFocusObjectChanged: attribute.getObs(FOCUS_ELEMENT).onChange,
        onDebounceTextChanged: attribute.getObs(DEBOUNCE_TEXT).onChange,
        onChoiceboxOpenChanged: attribute.getObs(CHOICEBOX_OPEN).onChange,

        triggerDebounceInput: (key) => {
            attribute.getObs(DEBOUNCE_TEXT).setValue(decounceController.getValue() + key);
            decounceController.setValue(decounceController.getValue() + key);
            debounceInput.querySelector("input").dispatchEvent(new Event("input"));
        },
    };
};

/** @private */
const getNeighborPrev = (currentElem, list) => {
    return getNeighbor(currentElem, list, (x) => x - 1);
};

const getNeighborNext = (currentElem, list) => {
    return getNeighbor(currentElem, list, (x) => x + 1);
};

const getNeighbor = (currentElem, list, operation) => {
    let currentIndex = list.findIndex((e) => e === currentElem);
    return list[operation(currentIndex)] ?? currentElem;
};

/*
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

/*
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
 * /
const ChoiceInputController = (args) => {
    COUMN_NAMES = args.colNames;
    return ChoiceAttributeInputController(ChoiceInputModel({ ...args }));
};

*/
