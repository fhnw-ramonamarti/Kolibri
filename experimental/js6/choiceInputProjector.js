import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { TEXT, dom } from "../../docs/src/kolibri/util/dom.js";

import { ALL } from "./choiceInputController.js";

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
 * @type { <_T_> ChoiceInputProjectionType<_T_> }
 * @example
 * const [labelElement, selectionElement] = projectChoiceInput(detailController, masterController, "countrySelection");
 */
const projectChoiceInput = (detailController, masterController, formCssClassName) => {
    if (!detailController) {
        console.error("no detailController in input projector."); // be defensive
        return;
    }
    if (!masterController) {
        console.error("no masterController in input projector."); // be defensive
        return;
    }
    const id = formCssClassName + "-id-" + counter++;

    // input for deatil view
    const inputController = SimpleInputController({
        value: detailController.getValue(),
        label: detailController.getLabel(),
        name: detailController.getName(),
        type: TEXT,
    });
    const elements = InputProjector.projectChangeInput(inputController, formCssClassName);

    /** @type {HTMLLabelElement} */ const labelElement = elements[0];
    /** @type {HTMLSpanElement}  */ const spanElement = elements[1];
    /** @type {HTMLInputElement} */ const inputElement = spanElement.firstElementChild;

    inputElement.classList.add("input-" + formCssClassName);
    inputElement.setAttribute("id", "input-" + id);

    // create container, master & detail view of elements
    /** @type {HTMLSpanElement}  */ const dropdownElement = dom(`
        <div class="countrySelectionElement"></div>
    `)[0];
    /** @type {HTMLSpanElement}  */ const dropdownLine = dom(`
        <div class="selectedCountryLine"></div>
    `)[0];
    /** @type {List<HTMLSpanElement>}  */ const [svgClear, svgClose, svgOpen] = dom(`
        <span class="clear" id="clear">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                <path d="M 5 5  L 15 15  M 5 15  L 15 5" stroke="black" stroke-width="2" stroke-linecap="round" />
            </svg>
        </span>
        <span class="icon close show">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M 5 9  L 12 16  L 19 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </span>
        <span class="icon open">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M 5 16  L 12 9  L 19 16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </span>
    `);
    /** @type {HTMLSpanElement}  */ const dropdownBody = dom(`
        <div class="lists" id="lists-${id}">
            <ul class="continentList list" id="continents"></ul>
            <div class="line" id="line-${id}"></div>
            <ul class="countryList list" id="countries"></ul>
        </div>
    `)[0];
    dropdownLine.append(spanElement, svgClear, svgClose, svgOpen);
    dropdownElement.append(dropdownLine, dropdownBody);

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

    const buildContinents = () => {
        buildColumn(
            "continents",
            masterController.getCategories(),
            "continent",
            (e) => {
                const colName = masterController.getColNames()[0];
                masterController.setValue({
                    [colName]: e.target.innerHTML,
                });
                changeContinent();
            },
            (e) => {
                masterController.setFocusObject({
                    value: e.target.innerHTML,
                    column: 0,
                });
            }
        );
    };

    const buildCountries = () => {
        buildColumn(
            "countries",
            masterController.getElements(),
            "country",
            (e) => {
                changeFocus(e.target.innerHTML);
                changeCountry();
            },
            (e) => {
                masterController.setFocusObject({
                    value: e.target.innerHTML,
                    column: 1,
                });
            }
        );
    };
    buildContinents();
    buildCountries();

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

    const displayContinents = () => {
        displayColumn(
            masterController.getCategories(),
            "continent",
            masterController.getValue()[masterController.getColNames()[0]]
        );
    };

    const displayCountries = () => {
        displayColumn(
            masterController.getElements(),
            "country",
            masterController.getValue()[masterController.getColNames()[1]],
            (element, i) => {
                if (
                    masterController.getValueList()[i][masterController.getColNames()[0]] !==
                        masterController.getValue()[masterController.getColNames()[0]] &&
                    ALL !== masterController.getValue()[masterController.getColNames()[0]]
                ) {
                    element.classList.add("hidden");
                }
            }
        );
    };

    const displayCurrentPosition = () => {
        if (masterController.getFocusObject().column === 0) {
            displayConcreteField(
                masterController.getCategories(),
                "continent",
                masterController.getFocusObject().value,
                "focused"
            );
        }
        if (masterController.getFocusObject().column === 1) {
            displayConcreteField(
                masterController.getValueList().map((e) => e[masterController.getColNames()[1]]),
                "country",
                masterController.getFocusObject().value,
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
        displayContinents();
        displayCountries();
        displayCurrentPosition();
    };

    const toggleSelect = (isOpen) => {
        const className = "open";
        const classNameIcon = "show";

        const countryField = inputElement.classList;
        const iconOpen = svgOpen.classList;
        const iconClose = svgClose.classList;

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

    // todo move to top
    const filteredCountries = () =>
        masterController
            .getValueList()
            .filter((e) =>
                [e[masterController.getColNames()[0]], ALL].includes(
                    masterController.getValue()[masterController.getColNames()[0]]
                )
            )
            .map((e) => e[masterController.getColNames()[1]]);

    // todo future change if editable select
    detailController.onEditableChanged((_) => inputElement.setAttribute("readonly", "on"));
    detailController.onPlaceholderChanged((val) => inputElement.setAttribute("placeholder", val ? val : ""));

    masterController.onValueListChanged((val) => {
        display();
    });
    masterController.onValueChanged((val) => {
        display();
    });
    masterController.onFocusObjectChanged((val) => {
        if (val.column < 0) {
            masterController.setFocusObject({ column: 0 });
            return;
        }
        if (val.column >= masterController.getColNames().length) {
            masterController.setFocusObject({ column: masterController.getColNames().length - 1 });
            return;
        }
        if (!masterController.getFocusObject().value) {
            masterController.setFocusObject({
                value: filteredCountries()[0],
            });
        }
        if (masterController.getFocusObject().column == null) {
            masterController.setFocusObject({
                column: Math.min(
                    Object.keys(masterController.getValue()).length,
                    masterController.getColNames().length - 1
                ),
            });
        }
        display();
    });
    masterController.onDebounceTextChanged((val) => {
        masterController.setDebounceText(val);
    });
    masterController.onChoiceboxOpenChanged((val) => {
        masterController.setChoiceboxOpen(val);
    });
    detailController.onValueChanged((val) => {
        detailController.setValue(val);
        inputElement.value = val;
        display();
    });

    const changeFocus = (e) => {
        masterController.setFocusObject({ value: e });
        scrollCountry();
        display();
    };

    const changeContinent = () => {
        masterController.setFocusObject({ column: 0 });
        const colName = masterController.getColNames()[0];
        masterController.setValue({
            [colName]: masterController.getFocusObject().value,
        });
        changeFocus(masterController.getValue()[masterController.getColNames()[0]]);
        scrollCountry();
    };

    const changeCountry = () => {
        const colName = masterController.getColNames()[1];
        masterController.setValue({
            [colName]: masterController.getFocusObject().value,
        });
        masterController.setFocusObject({ column: 1 });
        changeFocus(masterController.getValue()[masterController.getColNames()[1]]);
        updateFieldValue();
    };

    const updateFieldValue = () => {
        inputElement.value = masterController.getValue()[masterController.getColNames()[1]];
        if (inputElement.value === "") {
            svgClear.classList.remove("show");
        } else {
            svgClear.classList.add("show");
        }
    };

    const resetValue = () => {
        const colName = masterController.getColNames()[1];
        masterController.setValue({ [colName]: "" });
        updateFieldValue();
    };

    // add actions to elements
    dropdownLine.onclick = () => {
        inputElement.focus();
    };
    dropdownBody.onclick = () => {
        inputElement.focus();
    };
    inputElement.onblur = () => {
        masterController.setChoiceboxOpen(false);
        // toggleSelect(masterController.getChoiceboxOpen()); // todo DEBUG
    };
    inputElement.onclick = () => {
        masterController.setChoiceboxOpen(!masterController.getChoiceboxOpen());
        toggleSelect(masterController.getChoiceboxOpen());
    };
    inputElement.onkeydown = (e) => {
        console.debug(e.key + " - " + e.keyCode); // todo DEBUG
        // todo keycode depricated
        switch (e.keyCode) {
            case 37: // ArrowLeft
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                masterController.setFocusObject({
                    column: masterController.getFocusObject().column - 1,
                });
                changeFocus(masterController.getValue()[masterController.getColNames()[0]]);
                break;
            case 38: // ArrowUp
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                masterController.setFocusToPrev();
                if (masterController.getFocusObject().column === 0) {
                    masterController.setValue({
                        [masterController.getColNames()[0]]:
                            masterController.getFocusObject()[masterController.getColNames()[0]],
                    });
                    changeContinent();
                }
                scrollCountry();
                break;
            case 39: // ArrowRight
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                if (filteredCountries().includes(masterController.getValue()[masterController.getColNames()[1]])) {
                    masterController.setFocusObject({
                        value: masterController.getValue()[masterController.getColNames()[1]],
                    });
                } else {
                    masterController.setFocusObject({
                        value: filteredCountries()[0],
                    });
                }
                masterController.setFocusObject({
                    column: masterController.getFocusObject().column + 1,
                });
                changeFocus(masterController.getFocusObject().value);
                scrollCountry();
                break;
            case 40: // ArrowDown
                if (!dropdownBody.classList.contains("open")) {
                    masterController.setChoiceboxOpen(true);
                    toggleSelect(masterController.getChoiceboxOpen());
                    break;
                }
                masterController.setFocusToNext();
                if (masterController.getFocusObject().column === 0) {
                    masterController.setValue({
                        [masterController.getColNames()[0]]:
                        masterController.getFocusObject()[masterController.getColNames()[0]],
                    });
                    changeContinent();
                }
                scrollCountry();
                break;
            case 13: // Enter
            case 32: // " " - Space
                if (!dropdownBody.classList.contains("open")) {
                    masterController.setChoiceboxOpen(true);
                    toggleSelect(masterController.getChoiceboxOpen());
                    break;
                }
                if (masterController.getFocusObject().column === 0) {
                    if (filteredCountries().includes(masterController.getValue()[masterController.getColNames()[1]])) {
                        masterController.setFocusObject({
                            value: masterController.getValue()[masterController.getColNames()[1]],
                        });
                    } else {
                        masterController.setFocusObject({
                            value: filteredCountries()[0],
                        });
                    }
                    changeFocus(masterController.getFocusObject().value);
                }
                if (masterController.getFocusObject().column === 1) {
                    changeCountry();
                }
                masterController.setFocusObject({
                    column: masterController.getFocusObject().column + 1,
                });
                break;
            case 27: // Escape
                masterController.setChoiceboxOpen(false);
                toggleSelect(masterController.getChoiceboxOpen());
                break;
            case 8: // BackSpace
                resetValue();
                break;
            case 9: // Tab
                masterController.setChoiceboxOpen(false);
                toggleSelect(masterController.getChoiceboxOpen());
                break;
            default:
                // e.preventDefault();
                if (e.key.length === 1) {
                    masterController.setFocusObject({ column: 1 });
                    masterController.triggerDebounceInput(e.key);
                    detailController.setValue(masterController.getValue()[masterController.getColNames()[1]]);
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
        masterController.setChoiceboxOpen(false);
        toggleSelect(masterController.getChoiceboxOpen());
    };
    svgClose.onclick = () => {
        masterController.setChoiceboxOpen(true);
        toggleSelect(masterController.getChoiceboxOpen());
    };

    return [labelElement, dropdownElement];
};
