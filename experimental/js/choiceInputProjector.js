import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { dom, TEXT } from "../../docs/src/kolibri/util/dom.js";
import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import {
    model,
    changeContinent,
    changeCountry,
    changeFocus,
    activeCountryList,
    continentList,
    controller,
    input,
} from "./choiceInputModel.js";

export { projectChoiceInput, display, scrollCountry,addActions };

let counter = 0;

const projectChoiceInput = (timeout) => (inputController, formCssClassName) => {
    if (!inputController) {
        console.error("no inputController in input projector."); // be defensive
        return;
    }
    const id = formCssClassName + "-id-" + counter++;
    // debounce
    const controller = SimpleInputController({
        value: "",
        name: "debounce",
        type: "text",
    });

    const debounceElements = InputProjector.projectDebounceInput(timeout)(controller, "debounce-" + formCssClassName);
    const elements = InputProjector.projectChangeInput(inputController, formCssClassName);

    /** @type {HTMLLabelElement} */ const labelElement = elements[0];
    /** @type {HTMLSpanElement}  */ const spanElement = elements[1];
    /** @type {HTMLInputElement} */ const inputElement = spanElement.firstElementChild;

    //todo variable
    inputElement.classList.add("selectedCountry");
    inputElement.setAttribute("placeholder", "Choose country");

    const dropdownLine = dom(`
        <div class="selectedCountryLine"></div>
    `)[0];
    // todo svg
    dropdownLine.append(
        ...elements,
        ...dom(`
            <div class="clear" id="clear">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5.00002L15.6452 15.6452M5 15.6452L15.6452 5" stroke="#A0A3BD" stroke-width="1.66667"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="icon close show">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 9.03658L11.9632 15.9998L18.9263 9.03658" stroke="#A0A3BD" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="icon open">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 16L11.9632 8.96317L18.9263 16" stroke="#A0A3BD" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
        `)
    );
    const dropdownBody = dom(`
        <div class="lists" id="lists-${id}">
            <ul class="continentList list" id="continents"></ul>
            <div class="line" id="line-${id}"></div>
            <ul class="countryList list" id="countries"></ul>
        </div>
    `)[0];
    spanElement.appendChild(dropdownBody);
    return [dropdownLine];
};

// const formHolder = document.querySelector(".countrySelectionView");
// if (null != formHolder) {
//     // there is no such element when called via test case
//     const formStructure = { value: "", name: "country", type: TEXT };
//     const controller = SimpleInputController(formStructure);
//     formHolder.append(...projectChoiceInput(800)(controller, "selectedCountry"));
// }

const OPEN = 0,
    CLOSE = 1,
    TOGGLE = 2;

// ------Debounce-start---------------------------------------------

const defaultKeyAction = (key) => {
    // todo filter keys pattern
    model.setCurrentColumn(1);
    controller.setValue(controller.getValue() + key);
    // input.querySelector("input").value += key;
    input.querySelector("input").dispatchEvent(new Event("input"));
};

// ------Debounce-end-----------------------------------------------

const displayConcreteField = (list, name, currentValue, className) => {
    const currentIndex = list.findIndex((e) => e === currentValue);
    if (currentIndex >= 0) {
        const currentColValue = document.getElementById(name + "-" + currentIndex);
        currentColValue.classList.add(className);
    }
};

const displayColumn = (list, name, currentValue) => {
    for (let i = 0; i < list.length; i++) {
        let element = document.getElementById(name + "-" + i);
        element.setAttribute("CLASS", "entry " + name);
    }
    displayConcreteField(list, name, currentValue, "selected");
};

const displayContinents = () => {
    displayColumn(continentList, "continent", model.getContinent());
};

const displayCountries = () => {
    if (model.getUpdateNeeded()) {
        buildCountries();
        model.toggleUpdateNeeded(false);
    }
    displayColumn(activeCountryList(), "country", model.getCountry());
};

const displayCurrentPosition = () => {
    if (model.getCurrentColumn() === 0) {
        displayConcreteField(continentList, "continent", model.getCurrentFocus(), "focused");
    }
    if (model.getCurrentColumn() === 1) {
        displayConcreteField(activeCountryList(), "country", model.getCurrentFocus(), "focused");
    }
};

const display = () => {
    displayContinents();
    displayCountries();
    displayCurrentPosition();
};

const buildColumn = (containerId, list, name, onClick, onHover) => {
    const columnContainer = document.querySelector("#" + containerId);
    columnContainer.innerHTML = "";
    for (let i = 0; i < list.length; i++) {
        let element = document.createElement("LI");
        element.setAttribute("ID", name + "-" + i);
        element.setAttribute("CLASS", "entry " + name);
        element.onclick = (e) => {
            onClick(e);
        };
        element.onmouseover = (e) => {
            onHover(e);
        };
        element.innerHTML = list[i];
        columnContainer.appendChild(element);
    }
};

const buildContinents = () => {
    buildColumn(
        "continents",
        continentList,
        "continent",
        (e) => {
            model.setContinent(e.target.innerHTML);
            changeContinent();
        },
        (e) => {
            model.setCurrentColumn(0);
            changeFocus(e.target.innerHTML);
        }
    );
};

const buildCountries = () => {
    buildColumn(
        "countries",
        activeCountryList(),
        "country",
        (e) => {
            changeFocus(e.target.innerHTML);
            changeCountry();
        },
        (e) => {
            model.setCurrentColumn(1);
            changeFocus(e.target.innerHTML);
        }
    );
};

const toggleSelect = (state = TOGGLE) => {
    const countryField = document.querySelector(".countrySelectionView .selectedCountry").classList;
    const listsContainer = document.querySelector(".lists");
    const iconOpen = document.querySelector(".icon.open").classList;
    const iconClose = document.querySelector(".icon.close").classList;

    if (state === OPEN) {
        countryField.add("open");
        listsContainer.classList.add("open");

        iconOpen.add("show");
        iconClose.remove("show");

        // todo in style
        const continentsContainer = document.querySelector("#continents");
        listsContainer.style.height =
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";

        displayCurrentPosition();
        return;
    }
    if (state === CLOSE) {
        countryField.remove("open");
        listsContainer.classList.remove("open");

        iconOpen.remove("show");
        iconClose.add("show");
        return;
    }
    if (state === TOGGLE) {
        countryField.toggle("open");
        listsContainer.classList.toggle("open");

        iconOpen.toggle("show");
        iconClose.toggle("show");

        // todo in style
        const continentsContainer = document.querySelector("#continents");
        listsContainer.style.height =
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";

        displayCurrentPosition();
    }
};

const scrollCountry = () => {
    const currentCountry =
        document.querySelector(".country.focused") ??
        document.querySelector(".country.selected") ??
        document.querySelector(".country");
    if (currentCountry) {
        const countriesContainer = document.querySelector("#countries");
        const height = countriesContainer.offsetHeight / 2 - currentCountry.offsetHeight / 2;
        countriesContainer.scrollTo({ top: currentCountry.offsetTop - height });
    }
};

// todo toggel not working
const addActions = () => {
    document.querySelector("body").onload = () => {
        buildContinents();
        display();
    };

    document.querySelector(".countrySelectionView").onclick = () => {
        document.querySelector(".selectedCountryLine input").focus();
    };

    document.querySelector(".selectedCountryLine input").onblur = () => {
        // toggleSelect(CLOSE); // todo
    };

    document.querySelector(".selectedCountryLine input").onclick = () => toggleSelect();

    // document.querySelector(".selectedCountryLine .open").onclick = () => toggleSelect(OPEN);

    // document.querySelector(".selectedCountryLine .close").onclick = () => toggleSelect(CLOSE);

    document.getElementById("clear").onclick = () => {
        resetValue();
        toggleSelect();
    };

    // -----actions-----------------------------------------------------------
    document.querySelector(".countrySelectionView .selectedCountry").onkeydown = (e) => {
        console.debug(e.key + " - " + e.keyCode); // todo DEBUG

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
                    toggleSelect(OPEN);
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
                    toggleSelect(OPEN);
                    break;
                }
                if (model.getCurrentColumn() === 0) {
                    if (activeCountryList().includes(model.getCountry())) {
                        model.setCurrentFocus(model.getCountry());
                    } else {
                        model.setFocusCountryFirst();
                    }
                    changeFocus(model.getCurrentFocus());
                }
                if (model.getCurrentColumn() === 1) {
                    changeCountry();
                }
                model.incCurrentColumn();
                display();
                break;
            case 27: // Escape
                toggleSelect(CLOSE);
                break;
            case 8: // BackSpace
                resetValue();
                break;
            case 9: // Tab
                toggleSelect(CLOSE);
                break;
            default:
                e.preventDefault();
                if (e.key.length === 1) {
                    defaultKeyAction(e.key);
                }
                break;
        }
    };
};
/** */
