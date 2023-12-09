import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { dom } from "../../docs/src/kolibri/util/dom.js";

import { ALL, COUMN_NAMES } from "./choiceInputController.js";

export { projectChoiceInput };
// export { scrollCountry };

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
 * const [labelElement, selectionElement] = projectChoiceInput(800)(formHolder)(controller);
 */
const projectChoiceInput = (timeout) => (inputController, formCssClassName) => {
    if (!inputController) {
        console.error("no inputController in input projector."); // be defensive
        return;
    }
    const id = formCssClassName + "-id-" + counter++;
    inputController.setTimeout(timeout);

    // input for deatil view
    const elements = InputProjector.projectChangeInput(inputController, formCssClassName);

    /** @type {HTMLLabelElement} */ const labelElement = elements[0];
    /** @type {HTMLSpanElement}  */ const spanElement  = elements[1];
    /** @type {HTMLInputElement} */ const inputElement = spanElement.firstElementChild;

    //todo variable
    inputElement.classList.add("selectedCountry");
    const continentList = [ALL, ...[...new Set(inputController.getListObjects().map((e) => e[COUMN_NAMES[0]]))].sort()];

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                <path d="M 5 5  L 15 15  M 5 15  L 15 5" stroke="black" stroke-width="2" stroke-linecap="round" />
            </svg>
        </div>
        <div class="icon close show">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M 5 9 L 12 16 L 19 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
        <div class="icon open">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M 5 16 L 12 9 L 19 16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    `);
    dropdownLine.append(spanElement, svgClear, svgClose, svgOpen);
    dropdownElement.append(dropdownLine, dropdownBody);

    const displayConcreteField = (list, name, currentValue, className) => {
        const currentIndex = list.findIndex((e) => e === currentValue);
        if (currentIndex >= 0) {
            const currentColValue = dropdownElement.querySelector("#" + name + "-" + currentIndex);
            currentColValue.classList.add(className);
        }
    };

    const displayColumn = (list, name, currentValue, exec = () => {}) => {
        for (let i = 0; i < list.length; i++) {
            let element = dropdownElement.querySelector("#" + name + "-" + i);
            element.setAttribute("CLASS", "entry " + name);
            exec(element, i);
        }
        displayConcreteField(list, name, currentValue, "selected");
    };

    const displayContinents = (list = [ALL]) => {
        displayColumn(list, "continent", inputController.getSelectedObject()[COUMN_NAMES[0]]);
    };

    const displayCountries = () => {
        displayColumn(
            inputController.getListObjects().map((e) => e[COUMN_NAMES[1]]),
            "country",
            inputController.getSelectedObject()[COUMN_NAMES[1]],
            (element, i) => {
                if (
                    inputController.getListObjects()[i][COUMN_NAMES[0]] !==
                        inputController.getSelectedObject()[COUMN_NAMES[0]] &&
                    ALL !== inputController.getSelectedObject()[COUMN_NAMES[0]]
                ) {
                    element.classList.add("hidden");
                }
            }
        );
    };

    const displayCurrentPosition = () => {
        if (inputController.getFocusedObject().column === 0) {
            displayConcreteField(continentList, "continent", inputController.getFocusedObject().value, "focused");
        }
        if (inputController.getFocusedObject().column === 1) {
            displayConcreteField(
                inputController.getListObjects().map((e) => e[COUMN_NAMES[1]]),
                "country",
                inputController.getFocusedObject().value,
                "focused"
            );
        }
    };

    const scrollCountry = () => {
        const currentCountry =
            dropdownElement.querySelector(".country.focused") ??
            dropdownElement.querySelector(".country.selected") ??
            dropdownElement.querySelector(".country");
        if (currentCountry) {
            const countriesContainer = dropdownElement.querySelector("#countries");
            const height = countriesContainer.offsetHeight / 2 - currentCountry.offsetHeight / 2;
            countriesContainer.scrollTo({ top: currentCountry.offsetTop - height });
        }
    };

    const display = () => {
        displayContinents(continentList);
        displayCountries();
        displayCurrentPosition();
    };

    const buildColumn = (containerId, list, name, onClick, onHover) => {
        const columnContainer = dropdownElement.querySelector("#" + containerId);
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

    const buildContinents = (list = ["All"]) => {
        buildColumn(
            "continents",
            list,
            "continent",
            (e) => {
                const colName = COUMN_NAMES[0];
                inputController.setSelectedObject({
                    ...inputController.getSelectedObject(),
                    [colName]: e.target.innerHTML,
                });
                changeContinent();
            },
            (e) => {
                inputController.setFocusedObject({
                    ...inputController.getFocusedObject(),
                    value: e.target.innerHTML,
                    column: 0,
                });
            }
        );
    };

    const buildCountries = () => {
        buildColumn(
            "countries",
            inputController.getListObjects().map((e) => e[COUMN_NAMES[1]]),
            "country",
            (e) => {
                changeFocus(e.target.innerHTML);
                changeCountry();
            },
            (e) => {
                inputController.setFocusedObject({
                    ...inputController.getFocusedObject(),
                    value: e.target.innerHTML,
                    column: 1,
                });
            }
        );
    };

    const toggleSelect = (isOpen) => {
        const className     = "open";
        const classNameIcon = "show";

        const countryField = inputElement.classList;
        const iconOpen     = svgOpen.classList;
        const iconClose    = svgClose.classList;

        if (isOpen) {
            countryField.add(className);
            dropdownBody.classList.add(className);

            iconOpen.add(classNameIcon);
            iconClose.remove(classNameIcon);

            // todo in style
            const continentsContainer = dropdownElement.querySelector("#continents");
            dropdownBody.style.height =
                continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";

            displayCurrentPosition();
        } else {
            countryField.remove(className);
            dropdownBody.classList.remove(className);

            iconOpen.remove(classNameIcon);
            iconClose.add(classNameIcon);
        }
    };

    buildContinents(continentList);
    buildCountries();

    const filteredCountries = () =>
        inputController
            .getListObjects()
            .filter((e) => [e[COUMN_NAMES[0]], ALL].includes(inputController.getSelectedObject()[COUMN_NAMES[0]]))
            .map((e) => e[COUMN_NAMES[1]]);

    // todo future change if editable select
    inputController.onEditableChanged((_) => inputElement.setAttribute("readonly", "on"));
    inputController.onPlaceholderChanged((val) => inputElement.setAttribute("placeholder", val ? val : ""));

    inputController.onListObjectsChanged((val) => {
        inputController.setListObjects(val);
        display();
    });
    inputController.onSelectedObjectChanged((val) => {
        inputController.setSelectedObject(val);
        display();
    });
    inputController.onFocusedObjectChanged((val) => {
        if (val.column < 0) {
            inputController.setFocusedObject({ ...inputController.getFocusedObject(), column: 0 });
            return;
        }
        if (val.column < 0 || val.column >= COUMN_NAMES.length) {
            inputController.setFocusedObject({ ...inputController.getFocusedObject(), column: COUMN_NAMES.length - 1 });
            return;
        }
        inputController.setFocusedObject(val);
        if (!inputController.getFocusedObject().value) {
            inputController.setFocusedObject({
                ...inputController.getFocusedObject(),
                value: filteredCountries()[0],
            });
        }
        if (inputController.getFocusedObject().column == null) {
            inputController.setFocusedObject({
                ...inputController.getFocusedObject(),
                column: Math.min(Object.keys(inputController.getSelectedObject()).length, COUMN_NAMES.length - 1),
            });
        }
        display();
    });
    inputController.onDebounceTextChanged((val) => {
        inputController.setDebounceText(val);
    });
    inputController.onChoiceboxOpenChanged((val) => {
        inputController.setChoiceboxOpen(val);
    });
    inputController.onValueChanged((val) => {
        inputController.setValue(val);
        inputElement.value = val;
        display();
    });

    const changeFocus = (e) => {
        inputController.setFocusedObject({ ...inputController.getFocusedObject(), value: e });
        scrollCountry();
        display();
    };

    const changeContinent = () => {
        inputController.setFocusedObject({ ...inputController.getFocusedObject(), column: 0 });
        const colName = COUMN_NAMES[0];
        inputController.setSelectedObject({
            ...inputController.getSelectedObject(),
            [colName]: inputController.getFocusedObject().value,
        });
        changeFocus(inputController.getSelectedObject()[COUMN_NAMES[0]]);
        scrollCountry();
    };

    const changeCountry = () => {
        const colName = COUMN_NAMES[1];
        inputController.setSelectedObject({
            ...inputController.getSelectedObject(),
            [colName]: inputController.getFocusedObject().value,
        });
        inputController.setFocusedObject({ ...inputController.getFocusedObject(), column: 1 });
        changeFocus(inputController.getSelectedObject()[COUMN_NAMES[1]]);
        updateFieldValue();
    };

    const updateFieldValue = () => {
        inputElement.value = inputController.getSelectedObject()[COUMN_NAMES[1]];
        if (inputElement.value === "") {
            svgClear.classList.remove("show");
        } else {
            svgClear.classList.add("show");
        }
    };

    const resetValue = () => {
        const colName = COUMN_NAMES[1];
        inputController.setSelectedObject({ ...inputController.getSelectedObject(), [colName]: "" });
        updateFieldValue();
    };

    const getNeighborPrevContinent = (currentElem = inputController.getFocusedObject().value) => {
        return getNeighborPrev(currentElem, continentList);
    };

    const getNeighborNextContinent = (currentElem = inputController.getFocusedObject().value) => {
        return getNeighborNext(currentElem, continentList);
    };

    const getNeighborPrevCountry = (currentElem = inputController.getFocusedObject().value) => {
        return getNeighborPrev(currentElem, filteredCountries());
    };

    const getNeighborNextCountry = (currentElem = inputController.getFocusedObject().value) => {
        return getNeighborNext(currentElem, filteredCountries());
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

    // add actions to elements
    dropdownLine.onclick = () => {
        inputElement.focus();
    };
    dropdownBody.onclick = () => {
        inputElement.focus();
    };
    inputElement.onblur = () => {
        inputController.setChoiceboxOpen(false);
        // toggleSelect(inputController.getChoiceboxOpen()); // todo DEBUG
    };
    inputElement.onclick = () => {
        inputController.setChoiceboxOpen(!inputController.getChoiceboxOpen());
        toggleSelect(inputController.getChoiceboxOpen());
    };
    inputElement.onkeydown = (e) => {
        console.debug(e.key + " - " + e.keyCode); // todo DEBUG
        // todo keycode depricated
        switch (e.keyCode) {
            case 37: // ArrowLeft
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                inputController.setFocusedObject({
                    ...inputController.getFocusedObject(),
                    column: inputController.getFocusedObject().column - 1,
                });
                changeFocus(inputController.getSelectedObject()[COUMN_NAMES[0]]);
                break;
            case 38: // ArrowUp
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                if (inputController.getFocusedObject().column === 0) {
                    changeFocus(getNeighborPrevContinent());
                    inputController.setSelectedObject({
                        ...inputController.getSelectedObject(),
                        [COUMN_NAMES[0]]: getNeighborPrevContinent(),
                    });
                    changeContinent();
                }
                if (inputController.getFocusedObject().column === 1) {
                    changeFocus(getNeighborPrevCountry());
                }
                scrollCountry();
                break;
            case 39: // ArrowRight
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                if (filteredCountries().includes(inputController.getSelectedObject()[COUMN_NAMES[1]])) {
                    inputController.setFocusedObject({
                        ...inputController.getFocusedObject(),
                        value: inputController.getSelectedObject()[COUMN_NAMES[1]],
                    });
                } else {
                    inputController.setFocusedObject({
                        ...inputController.getFocusedObject(),
                        value: filteredCountries()[0],
                    });
                }
                inputController.setFocusedObject({
                    ...inputController.getFocusedObject(),
                    column: inputController.getFocusedObject().column + 1,
                });
                changeFocus(inputController.getFocusedObject().value);
                scrollCountry();
                break;
            case 40: // ArrowDown
                if (!dropdownBody.classList.contains("open")) {
                    inputController.setChoiceboxOpen(true);
                    toggleSelect(inputController.getChoiceboxOpen());
                    break;
                }
                if (inputController.getFocusedObject().column === 0) {
                    changeFocus(getNeighborNextContinent());
                    inputController.setSelectedObject({
                        ...inputController.getSelectedObject(),
                        [COUMN_NAMES[0]]: getNeighborNextContinent(),
                    });
                    changeContinent();
                }
                if (inputController.getFocusedObject().column === 1) {
                    changeFocus(getNeighborNextCountry());
                }
                break;
            case 13: // Enter
            case 32: // " " - Space
                if (!dropdownBody.classList.contains("open")) {
                    inputController.setChoiceboxOpen(true);
                    toggleSelect(inputController.getChoiceboxOpen());
                    break;
                }
                if (inputController.getFocusedObject().column === 0) {
                    if (filteredCountries().includes(inputController.getSelectedObject()[COUMN_NAMES[1]])) {
                        inputController.setFocusedObject({
                            ...inputController.getFocusedObject(),
                            value: inputController.getSelectedObject()[COUMN_NAMES[1]],
                        });
                    } else {
                        inputController.setFocusedObject({
                            ...inputController.getFocusedObject(),
                            value: filteredCountries()[0],
                        });
                    }
                    changeFocus(inputController.getFocusedObject().value);
                }
                if (inputController.getFocusedObject().column === 1) {
                    changeCountry();
                }
                inputController.setFocusedObject({
                    ...inputController.getFocusedObject(),
                    column: inputController.getFocusedObject().column + 1,
                });
                break;
            case 27: // Escape
                inputController.setChoiceboxOpen(false);
                toggleSelect(inputController.getChoiceboxOpen());
                break;
            case 8: // BackSpace
                resetValue();
                break;
            case 9: // Tab
                inputController.setChoiceboxOpen(false);
                toggleSelect(inputController.getChoiceboxOpen());
                break;
            default:
                // e.preventDefault();
                if (e.key.length === 1) {
                    inputController.setFocusedObject({ ...inputController.getFocusedObject(), column: 1 });
                    inputController.triggerDebounceInput(e.key);
                    updateFieldValue();
                    scrollCountry();
                }
                break;
        }
    };
    svgClear.onclick = () => {
        resetValue();
    };
    svgOpen.onclick = () => {
        inputController.setChoiceboxOpen(false);
        toggleSelect(inputController.getChoiceboxOpen());
    };
    svgClose.onclick = () => {
        inputController.setChoiceboxOpen(true);
        toggleSelect(inputController.getChoiceboxOpen());
    };

    return [labelElement, dropdownElement];
};
