import { countryList } from "../countries.js";
import { display, scrollCountry } from "./choiceInputProjector.js";
import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
// import { dom, TEXT } from "../../docs/src/kolibri/util/dom.js";

export { controller,input,model, changeContinent, changeCountry, changeFocus, activeCountryList, continentList };

const continentList = ["All", ...[...new Set(countryList.map((e) => e.continent))].sort()];

const activeCountryList = () =>
    countryList.filter((e) => [e.continent, "All"].includes(model.getContinent())).map((e) => e.name);

const NUMB_COLUMN = 2;

const DEFAULT_CONTINENT = "All",
    DEFAULT_COUNTRY = countryList[0].name;

const ChoiceInputModel = ({
    continent1 = DEFAULT_CONTINENT,
    country1 = "",
    currentColumn1 = 1,
    currentFocus1 = DEFAULT_COUNTRY,
}) => {
    let continent = continent1;
    let country = country1;
    let currentColumn = currentColumn1;
    let currentFocus = currentFocus1;
    let updateNeeded = true;
    let debounceText = "";

    return {
        getContinent: () => continent,
        setContinent: (newVal) => (continent = newVal),
        setContinentToPrev: () => (continent = getNeighborPrevContinent(continent)),
        setContinentToNext: () => (continent = getNeighborNextContinent(continent)),

        getCountry: () => country,
        setCountry: (newVal) => (country = newVal),

        getCurrentColumn: () => currentColumn,
        setCurrentColumn: (newVal) => (currentColumn = newVal),
        decCurrentColumn: () => {
            if (currentColumn > 0) currentColumn--;
        },
        incCurrentColumn: () => {
            if (currentColumn < NUMB_COLUMN - 1) currentColumn++;
        },

        getCurrentFocus: () => currentFocus,
        setCurrentFocus: (newVal) => (currentFocus = newVal),
        setFocusCountryToPrev: () => (currentFocus = getNeighborPrevCountry(currentFocus)),
        setFocusCountryToNext: () => (currentFocus = getNeighborNextCountry(currentFocus)),
        setFocusCountryFirst: () => (currentFocus = activeCountryList()[0]),

        toggleUpdateNeeded: (newVal) => (updateNeeded = newVal),
        getUpdateNeeded: () => updateNeeded,

        getDebouncingText: () => debounceText,
        setDebouncingText: (newVal) => (debounceText = newVal),
    };
};

const model = ChoiceInputModel({});

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
