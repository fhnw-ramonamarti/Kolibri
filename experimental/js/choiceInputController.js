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
} from "../../docs/src/kolibri/presentationModel.js";

import { display, scrollCountry, toggleSelect } from "./choiceInputProjector.js";
import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { ChoiceInputModel2, ChoiceAttribute, model, activeCountryList, continentList } from "./choiceInputModel.js";

export {
    ChoiceInputController,
    controller,
    input,
    changeContinent,
    changeCountry,
    changeFocus,
    resetValue,
    getNeighborPrevContinent,
    getNeighborNextContinent,
    getNeighborPrevCountry,
    getNeighborNextCountry,
    handleEvent,
};

/**
 * @typedef { object } ChoiceInputControllerType
 * @template _T_
 * @property { ()  => _T_ }                 getValue
 * @property { (_T_) => void }              setValue
 * @property { ()  => String}               getType
 * @property { (valid: !Boolean) => void }  setValid
 * @property { (converter: Converter<_T_>)        => void } setConverter
 * @property { (cb: ValueChangeCallback<String>)  => void } onLabelChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onValidChanged
 * @property { (cb: ValueChangeCallback<List<Map<String,_T_>>>) => void } onListObjectsChanged
 * @property { (cb: ValueChangeCallback<Map<String,_T_>>)       => void } onSelectedObjectChanged
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onFocusedValueChanged
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onValueChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onNameChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onPlaceholderChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onEditableChanged
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
            focusedValue :  "Switzerland",
            filledValue :   "",
            placeholder:    "Choose Country",
            label:          "Country",
            name:           "country",
     });
 */
const ChoiceInputController = (args) => ChoiceAttributeInputController(ChoiceInputModel2({ ...args }));

const ChoiceAttributeInputController = (attribute) => ({
    setListObjects: attribute.getObs(LIST_ELEMENTS).getValue,
    getListObjects: attribute.getObs(LIST_ELEMENTS).setValue,
    setSelectedObject: attribute.getObs(SELECTION_ELEMENTS).getValue,
    getSelectedObject: attribute.getObs(SELECTION_ELEMENTS).setValue,
    setFocusedValue: attribute.getObs(FOCUS_ELEMENT).getValue,
    getFocusedValue: attribute.getObs(FOCUS_ELEMENT).setValue,
    setValue: attribute.setConvertedValue,
    getValue: attribute.getObs(VALUE).getValue,
    setValid: attribute.getObs(VALID).setValue,
    getType: attribute.getObs(TYPE).getValue,
    onListObjectsChanged: attribute.getObs(LIST_ELEMENTS).onChange,
    onSelectedObjectChanged: attribute.getObs(SELECTION_ELEMENTS).onChange,
    onFocusedValueChanged: attribute.getObs(FOCUS_ELEMENT).onChange,
    onValueChanged: attribute.getObs(VALUE).onChange,
    onValidChanged: attribute.getObs(VALID).onChange,
    onLabelChanged: attribute.getObs(LABEL).onChange,
    onNameChanged: attribute.getObs(NAME).onChange,
    onPlaceholderChanged: attribute.getObs(PLACEHOLDER).onChange,
    onEditableChanged: attribute.getObs(EDITABLE).onChange,
    setConverter: attribute.setConverter,
});

// ------Debounce-start---------------------------------------------

const controller = SimpleInputController({
    value: "",
    name: "debounce",
    type: "text",
});

const [_, input] = InputProjector.projectDebounceInput(800)(controller, "countryField");

controller.onValueChanged((text) => {
    if (text !== "") {
        model.setDebouncingText(text);
        let firstFittingCountry = activeCountryList().find((e) =>
            e.toLowerCase().startsWith(model.getDebouncingText().toLowerCase())
        );
        console.debug("Debounce: " + text + " - " + firstFittingCountry); // todo DEBUG
        if (firstFittingCountry) {
            model.setCurrentFocus(firstFittingCountry);
            if (!document.querySelector(".lists.open")) {
                model.setCountry(firstFittingCountry);
                changeCountry();
            }
            display();
            scrollCountry();
        }
    }
    input.querySelector("input").value = "";
});

// ------Debounce-end-----------------------------------------------

const getNeighborPrevContinent = (currentElem) => {
    return getNeighborPrev(currentElem, continentList);
};

const getNeighborNextContinent = (currentElem) => {
    return getNeighborNext(currentElem, continentList);
};

const getNeighborPrevCountry = (currentElem) => {
    return getNeighborPrev(currentElem, activeCountryList());
};

const getNeighborNextCountry = (currentElem) => {
    return getNeighborNext(currentElem, activeCountryList());
};

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

// ui depend ----------------------------------------------------------------

const changeContinent = () => {
    model.toggleUpdateNeeded(true);
    model.setCurrentColumn(0);
    changeFocus(model.getContinent());
    scrollCountry();
};

const changeCountry = () => {
    model.setCountry(model.getCurrentFocus());
    model.setCurrentColumn(1);
    updateFieldValue();
    display();
};

const changeFocus = (e) => {
    model.setCurrentFocus(e);
    display();
};

const updateFieldValue = () => {
    const countryField = document.querySelector(".countrySelectionView .selectedCountry");
    countryField.value = model.getCountry();
    if (model.getCountry() === "") {
        document.querySelector(".clear").classList.remove("show");
    } else {
        document.querySelector(".clear").classList.add("show");
    }
};

const resetValue = () => {
    model.setCountry("");
    updateFieldValue();
    display();
};

const handleEvent = (e, defaultKeyAction) => {
    switch (e.keyCode) {
        case 37: // ArrowLeft
            if (!document.querySelector(".lists.open")) {
                break;
            }
            model.decCurrentColumn();
            changeFocus(model.getContinent());
            break;
        case 38: // ArrowUp
            if (!document.querySelector(".lists.open")) {
                break;
            }
            if (model.getCurrentColumn() === 0) {
                model.setContinentToPrev();
                changeContinent();
            }
            if (model.getCurrentColumn() === 1) {
                model.setFocusCountryToPrev();
                changeFocus(model.getCurrentFocus());
            }
            scrollCountry();
            break;
        case 39: // ArrowRight
            if (!document.querySelector(".lists.open")) {
                break;
            }
            if (activeCountryList().includes(model.getCountry())) {
                model.setCurrentFocus(model.getCountry());
            } else {
                model.setFocusCountryFirst();
            }
            model.incCurrentColumn();
            changeFocus(model.getCurrentFocus());
            scrollCountry();
            break;
        case 40: // ArrowDown
            if (!document.querySelector(".lists.open")) {
                model.setListOpened(true);
                toggleSelect();
                break;
            }
            if (model.getCurrentColumn() === 0) {
                model.setContinentToNext();
                changeContinent();
            }
            if (model.getCurrentColumn() === 1) {
                model.setFocusCountryToNext();
                changeFocus(model.getCurrentFocus());
            }
            scrollCountry();
            break;
        case 13: // Enter
        case 32: // " " - Space
            if (!document.querySelector(".lists.open")) {
                model.setListOpened(true);
                toggleSelect();
                break;
            }
            if (model.getCurrentColumn() === 0) {
                if (activeCountryList().includes(model.getCountry())) {
                    model.setCurrentFocus(model.getCountry());
                } else {
                    model.setFocusCountryFirst();
                }
                scrollCountry();
                changeFocus(model.getCurrentFocus());
            }
            if (model.getCurrentColumn() === 1) {
                changeCountry();
            }
            model.incCurrentColumn();
            display();
            break;
        case 27: // Escape
            model.setListOpened(false);
            toggleSelect();
            break;
        case 8: // BackSpace
            resetValue();
            break;
        case 9: // Tab
            model.setListOpened(false);
            toggleSelect();
            break;
        default:
            // e.preventDefault();
            if (e.key.length === 1) {
                defaultKeyAction(e.key);
            }
            break;
    }
};
