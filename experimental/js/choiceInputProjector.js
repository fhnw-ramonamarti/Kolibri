import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { dom, TEXT } from "../../docs/src/kolibri/util/dom.js";
import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { model, activeCountryList, continentList } from "./choiceInputModel.js";
import {
    changeContinent,
    changeCountry,
    changeFocus,
    resetValue,
    controller,
    input,
    handleEvent,
} from "./choiceInputController.js";

export { projectChoiceInput, display, scrollCountry, toggleSelect };

/**
// todo future usage
 * @private
 * Internal mutable singleton state to produce unique id values for the label-input pairs.
 * @type { Number }
 */
let counter = 0;

/**
 * @template _T_
 * @type { <_T_> (timeout: Number) => InputProjectionType<_T_> }
 * @example
 * const [labelElement, spanElement] = projectChoiceInput(800)(formHolder)(controller);
 */
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
        type: TEXT,
    });
    // debounce element not in ui
    InputProjector.projectDebounceInput(timeout)(controller, "debounce-" + formCssClassName);

    // input for deatil view
    const elements = InputProjector.projectChangeInput(inputController, formCssClassName);
    
    /** @type {HTMLLabelElement} */ const labelElement = elements[0];
    /** @type {HTMLSpanElement}  */ const spanElement = elements[1];
    /** @type {HTMLInputElement} */ const inputElement = spanElement.firstElementChild;
    
    //todo variable
    inputElement.classList.add("selectedCountry");
    inputElement.setAttribute("placeholder", "Choose country");

    // todo future change if editable select
    inputController.onEditableChanged((_) => inputElement.setAttribute("readonly", "on"));

    inputController.onListObjectsChanged((val)=>{});
    inputController.onSelectedObjectChanged((val)=>{});
    inputController.onFocusedValueChanged((val)=>{});
    inputController.onValueChanged((val)=>{
        // display();
    });

    // create container elemenets & master view of elements
    const dropdownLine = dom(`
        <div class="selectedCountryLine"></div>
    `)[0];
    const dropdownElement = dom(`
        <div class="countrySelectionElement"></div>
    `)[0];
    const dropdownBody = dom(`
        <div class="lists" id="lists-${id}">
            <ul class="continentList list" id="continents"></ul>
            <div class="line" id="line-${id}"></div>
            <ul class="countryList list" id="countries"></ul>
        </div>
    `)[0];
    const [svgClear, svgClose, svgOpen] = dom(`
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
    `);
    dropdownLine.append(spanElement, svgClear, svgClose, svgOpen);

    dropdownElement.append(dropdownLine, dropdownBody);

    // add actions to elements
    dropdownLine.onclick = () => {
        inputElement.focus();
    };
    dropdownBody.onclick = () => {
        inputElement.focus();
    };
    inputElement.onblur = () => {
        model.setListOpened(false);
        // toggleSelect(); // todo DEBUG
    };
    inputElement.onclick = () => {
        model.toggleListOpened();
        toggleSelect();
    };
    inputElement.onkeydown = (e) => {
        console.debug(e.key + " - " + e.keyCode); // todo DEBUG

        handleEvent(e, defaultKeyAction);
    };
    svgClear.onclick = () => {
        resetValue();
    };
    svgOpen.onclick = () => {
        model.setListOpened(true);
        toggleSelect();
    };
    svgClose.onclick = () => {
        model.setListOpened(false);
        toggleSelect();
    };

    return [labelElement, dropdownElement];
};

// ------Debounce-start---------------------------------------------

const defaultKeyAction = (key) => {
    model.setCurrentColumn(1);
    controller.setValue(controller.getValue() + key);
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

const toggleSelect = () => {
    const className = "open";
    const classNameIcon = "show";

    const countryField = document.querySelector(".countrySelectionView .selectedCountry").classList;
    const listsContainer = document.querySelector(".lists");
    const iconOpen = document.querySelector(".icon.open").classList;
    const iconClose = document.querySelector(".icon.close").classList;

    if (model.getListOpened()) {
        countryField.add(className);
        listsContainer.classList.add(className);

        iconOpen.add(classNameIcon);
        iconClose.remove(classNameIcon);

        // todo in style
        const continentsContainer = document.querySelector("#continents");
        listsContainer.style.height =
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";

        displayCurrentPosition();
    } else {
        countryField.remove(className);
        listsContainer.classList.remove(className);

        iconOpen.remove(classNameIcon);
        iconClose.add(classNameIcon);
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

document.querySelector("body").onload = () => {
    buildContinents();
    display();
};
