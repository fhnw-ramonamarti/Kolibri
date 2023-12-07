import { display, scrollCountry } from "./choiceInputProjector.js";
import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { model, activeCountryList, continentList } from "./choiceInputModel.js";
import {
    toggleSelect} from "./choiceInputProjector.js";

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
};

const ChoiceInputController = (model) => ({});

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
    toggleSelect();
    display();
};
