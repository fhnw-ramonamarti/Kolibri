// noinspection JSValidateJSDoc

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

export {
    ChoiceDetailController,
    ChoiceMasterController,
    ChoiceDetailAttributeController,
    ChoiceMasterAttributeController,
    ALL,
};

/** Constants */
const ALL = "All";

/**
 * The ChoiceDetailController gives access to a {@link ChoiceDetailModel} but in a limited fashion.
 * It does not expose the underlying {@link Attribute} but only those functions that a user of this
 * controller needs to see.
 * While controllers might contain business logic, this basic controller does not contain any.
 * @constructor
 * @template _T_
 * @param  { ChoiceDetailAttributes<_T_> } args
 * @return { ChoiceDetailAttributeController<_T_> }
 * @example
 *     const controller = ChoiceDetailController({
 *         value: "",
 *         placeholder: "Choose a country",
 *         label: "Country",
 *         name: "country"
 *     });
 */
const ChoiceDetailController = (args) => ChoiceDetailAttributeController(ChoiceDetailModel({ ...args }));

/**
 * The ChoiceMasterController gives access to a {@link ChoiceMasterModel} but in a limited fashion.
 * It does not expose the underlying {@link ChoiceAttribute} but only those functions that a user of this
 * controller needs to see.
 * While controllers might contain business logic, this basic controller does not contain any.
 * @constructor
 * @template _T_
 * @param  { !String } categoryColumn           - name of the object property of the category value
 * @param  { !String } elementColumn            - name of the object property of the element value
 * @param  { ?Number } timeout                  - timeout for the debounce of the search function
 * @return { (args: ChoiceMasterAttributes<_T_>) => ChoiceMasterAttributeController<_T_> }
 * @example
 *     const controller = ChoiceMasterController({
 *         elementList: [{country: "Switzerland", continent: "Europe"},
 *                      {country: "United States", continent:"North America"},
 *                      {country: "Germany", continent: "Europe"}],
 *         sectionElement: { continent: "All" },
 *         focusObject: {column: 1, value: "Switzerland"}
 *     });
 */
const ChoiceMasterController =
    (categoryColumn, elementColumn, timeout = 800) =>
    (args) =>
        ChoiceMasterAttributeController(categoryColumn, elementColumn, timeout)(ChoiceMasterModel({ ...args }));

/**
 * @typedef { object } ChoiceDetailAttributeController
 * @template _T_
 * @property { ()  => _T_ }                 getValue
 * @property { (_T_) => void }              setValue
 * @property { ()  => String }              getName
 * @property { ()  => String }              getLabel
 * @property { ()  => String }              getPlaceholder
 * @property { (valid: !Boolean) => void }  setValid
 * @property { (converter: Converter<_T_>)        => void } setConverter
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onValueChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onValidChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onLabelChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onNameChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onPlaceholderChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onEditableChanged
 */
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

/**
 * @typedef { object } ChoiceMasterAttributeController
 * @template { object } _T_ - object with category and element entry
 * @template _C_            - type of the category property
 * @template _E_            - type of the element property
 * @property { ()  => Array<String> }                getColNames
 * @property { ()  => Array<_C_> }                   getCategories
 * @property { ()  => Array<_E_>}                    getElements
 * @property { ()  => Array<_E_> }                   getFilteredElements
 * @property { ()  => _T_ }                          getValue
 * @property { (val: _T_) => void }                  setValue
 * @property { ()  => Array<_T_> }                   getElementList
 * @property { (val: Array<_T_>) => void }           setElementList
 * @property { ()  => FocusObject }                  getFocusObject
 * @property { (val: FocusObject | Object) => void } setFocusObject
 * @property { ()  => void }                         setFocusToPrev
 * @property { ()  => void }                         setFocusToNext
 * @property { ()  => String }                       getDebounceText
 * @property { (val: String)  => void }              setDebounceText
 * @property { ()  => Boolean }                      getChoiceBoxOpen
 * @property { (val: Boolean) => void }              setChoiceBoxOpen
 * @property { (key: String) => void }               triggerDebounceInput
 * @property { (cb: ValueChangeCallback<_T_>)         => void } onValueChanged
 * @property { (cb: ValueChangeCallback<Array<_T_>>)  => void } onElementListChanged
 * @property { (cb: ValueChangeCallback<FocusObject>) => void } onFocusObjectChanged
 * @property { (cb: ValueChangeCallback<String>)      => void } onDebounceTextChanged
 * @property { (cb: ValueChangeCallback<Boolean>)     => void } onChoiceBoxOpenChanged
 */
const ChoiceMasterAttributeController = (categoryColumn, elementColumn, timeout) => (attribute) => {
    // prepare for ip6 to generalize from country example
    const colNames = [categoryColumn, elementColumn];

    // prepare lists of categires and elements
    const categories = () => [
        // all at the beginning
        ALL,
        ...[
            // distinct categories
            ...new Set(
                attribute
                    .getObs(LIST_ELEMENTS)
                    .getValue()
                    .map((e) => e[categoryColumn])
            ),
        ].sort(),
    ];

    const elements = () =>
        attribute
            .getObs(LIST_ELEMENTS)
            .getValue()
            .map((e) => e[elementColumn]);

    const filteredElements = () =>
        attribute
            .getObs(LIST_ELEMENTS)
            .getValue()
            // filter on category if it is not ALL
            .filter((e) => [e[categoryColumn], ALL].includes(attribute.getObs(VALUE).getValue()[categoryColumn]))
            .map((e) => e[elementColumn]);

    // ------ debounce - start ---------------------------------------------

    // create simple text input for debouncing
    const debounceController = SimpleInputController({
        value: attribute.getObs(DEBOUNCE_TEXT).getValue(),
        type: "text",
    });

    // extract input tag from projector
    // field never added to view
    const debounceInput = InputProjector.projectDebounceInput(timeout)(
        debounceController,
        elementColumn + "Field-debounce"
    )[1].querySelector("input");

    // use value change callback to update dependant observables
    debounceController.onValueChanged((text) => {
        if (text === "") {
            // nothing happens
            return;
        }
        // only update values if sth is typed

        // filter only needed if master view is opened
        const filter = (e) => {
            if (attribute.getObs(CHOICEBOX_OPEN).getValue()) {
                return [e[categoryColumn], ALL].includes(attribute.getObs(VALUE).getValue()[categoryColumn]);
            }
            return true;
        };

        // get fitting element to debounce text
        const firstFittingElement = attribute
            .getObs(LIST_ELEMENTS)
            .getValue()
            .filter((e) => filter(e))
            .map((e) => e[elementColumn])
            .find((e) => e.toLowerCase().startsWith(attribute.getObs(DEBOUNCE_TEXT).getValue().toLowerCase()));

        if (firstFittingElement == null) {
            // finished if no element found
            debounceInput.value = "";
            return;
        }

        // update focus element
        attribute
            .getObs(FOCUS_ELEMENT)
            .setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), value: firstFittingElement });

        if (attribute.getObs(CHOICEBOX_OPEN).getValue()) {
            // finished if master view visible
            debounceInput.value = "";
            return;
        }

        // update selection
        attribute.getObs(VALUE).setValue({
            ...attribute.getObs(VALUE).getValue(),
            [elementColumn]: firstFittingElement,
        });

        debounceInput.value = "";
    });

    // ------ debounce - end -----------------------------------------------

    // helper functions handling the focus object
    const focusValue = () => attribute.getObs(FOCUS_ELEMENT).getValue().value;
    const setFocusedObjectValue = (val) =>
        attribute.getObs(FOCUS_ELEMENT).setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), value: val });

    const setNeighborPrevCategory = () => {
        setFocusedObjectValue(getNeighborPrev(focusValue(), categories()));
    };

    const setNeighborNextCategory = () => {
        setFocusedObjectValue(getNeighborNext(focusValue(), categories()));
    };

    const setNeighborPrevValue = () => {
        setFocusedObjectValue(getNeighborPrev(focusValue(), filteredElements()));
    };

    const setNeighborNextValue = () => {
        setFocusedObjectValue(getNeighborNext(focusValue(), filteredElements()));
    };

    // extracted return functions handling the focus object
    const setFocusedObject = (val) => {
        // set defaults if no column given
        if (val.column == null && attribute.getObs(FOCUS_ELEMENT).getValue().column == null) {
            val.column = colNames.length - 1;
        }

        // handle edge cases with defaults
        if (val.column < 0) {
            val.column = 0;
        }
        if (val.column >= colNames.length) {
            val.column = colNames.length - 1;
        }

        // set defaults if no value given
        if (val.value == null && attribute.getObs(FOCUS_ELEMENT).getValue().value == null) {
            val.value = attribute.getObs(VALUE).getValue()[colNames[val.column]] ?? filteredElements()[0];
        }

        attribute.getObs(FOCUS_ELEMENT).setValue({ ...attribute.getObs(FOCUS_ELEMENT).getValue(), ...val });
    };

    const setFocusToPrev = () => {
        if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 0) {
            setNeighborPrevCategory();
        }
        if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 1) {
            setNeighborPrevValue();
        }
    };

    const setFocusToNext = () => {
        if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 0) {
            setNeighborNextCategory();
        }
        if (attribute.getObs(FOCUS_ELEMENT).getValue().column === 1) {
            setNeighborNextValue();
        }
    };

    return {
        getColNames: () => colNames,
        getCategories: categories,
        getElements: elements,
        getFilteredElements: filteredElements,

        getValue: attribute.getObs(VALUE).getValue,
        setValue: (val) => attribute.getObs(VALUE).setValue({ ...attribute.getObs(VALUE).getValue(), ...val }),
        getElementList: attribute.getObs(LIST_ELEMENTS).getValue,
        setElementList: attribute.getObs(LIST_ELEMENTS).setValue,

        getFocusObject: attribute.getObs(FOCUS_ELEMENT).getValue,
        setFocusObject: setFocusedObject,
        setFocusToPrev: setFocusToPrev,
        setFocusToNext: setFocusToNext,

        getDebounceText: attribute.getObs(DEBOUNCE_TEXT).getValue,
        setDebounceText: attribute.getObs(DEBOUNCE_TEXT).setValue,
        getChoiceBoxOpen: attribute.getObs(CHOICEBOX_OPEN).getValue,
        setChoiceBoxOpen: attribute.getObs(CHOICEBOX_OPEN).setValue,

        onValueChanged: attribute.getObs(VALUE).onChange,
        onElementListChanged: attribute.getObs(LIST_ELEMENTS).onChange,
        onFocusObjectChanged: attribute.getObs(FOCUS_ELEMENT).onChange,
        onDebounceTextChanged: attribute.getObs(DEBOUNCE_TEXT).onChange,
        onChoiceBoxOpenChanged: attribute.getObs(CHOICEBOX_OPEN).onChange,

        triggerDebounceInput: (key) => {
            attribute.getObs(DEBOUNCE_TEXT).setValue(debounceController.getValue() + key);
            debounceController.setValue(debounceController.getValue() + key);
            debounceInput.dispatchEvent(new Event("input"));
        },
    };
};

/**
 * Get the previous element in a list starting at the current element
 * @private
 * @template _T_
 * @type { (currentElem:_T_, list:Array<_T_>) => _T_ }
 */
const getNeighborPrev = (currentElem, list) => {
    return getNeighbor(currentElem, list, (x) => x - 1);
};

/**
 * Get the next element in a list starting at the current element
 * @private
 * @template _T_
 * @type { (currentElem:_T_, list:Array<_T_>) => _T_ }
 */
const getNeighborNext = (currentElem, list) => {
    return getNeighbor(currentElem, list, (x) => x + 1);
};

/**
 * Get an element in a list executing the operation on the index starting at the current element
 * @private
 * @template _T_
 * @type { (currentElem:_T_, list:Array<_T_>, operation:ValueChangeCallbackWithReturn<Number>) => _T_ }
 */
const getNeighbor = (currentElem, list, operation) => {
    let currentIndex = list.findIndex((e) => e === currentElem);
    return list[operation(currentIndex)] ?? currentElem;
};

/**
 * @typedef { <_T_> (oldValue:_T_) => Number } ValueChangeCallbackWithReturn<_T_>
 * This is a specialized {@link ConsumerType} with a returning type Number.
 * The oldValue contains the value before the callback ist executed.
 */
