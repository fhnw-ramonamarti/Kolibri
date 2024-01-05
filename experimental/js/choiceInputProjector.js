// noinspection JSValidateJSDoc

import {SimpleInputController} from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import {InputProjector} from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import {TEXT, dom} from "../../docs/src/kolibri/util/dom.js";

export {projectChoiceInput};

/**
 // todo future usage
 * @private
 * Internal mutable singleton state to produce unique id values for the label-input pairs.
 * @type { Number }
 */
let counter = 0;

/**
 * @template _C_ - type of the category property
 * @template _E_ - type of the element property
 * @param { ChoiceDetailAttributeController<_E_> } detailController
 * @param { ChoiceMasterAttributeController<_C_> } masterController
 * @param { !String } formCssClassName
 * @return Array<HTMLElement> | null
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

    // input for detail view
    const inputController = SimpleInputController({
        value: detailController.getValue(),
        label: detailController.getLabel(),
        name: detailController.getName(),
        type: TEXT,
    });
    const elements = InputProjector.projectChangeInput(inputController, formCssClassName);

    /** @type {HTMLLabelElement} */ const labelElement = elements[0];
    /** @type {HTMLSpanElement}  */ const spanElement = /** @type {HTMLSpanElement}  */ elements[1];
    /** @type {HTMLInputElement} */ const inputElement = spanElement.firstElementChild;

    // todo naming
    inputElement.classList.add("input-" + formCssClassName);
    inputElement.classList.add(formCssClassName);
    inputElement.setAttribute("id", "input-" + id);

    // ------------ CREATE CONTAINER & DETAIL VIEW START -----------------

    // create container, master & detail view of choice input
    /** @type {HTMLSpanElement}  */ const dropdownElement = dom(`
        <div class="selectionElement"></div>
    `)[0];

    // create detail view of choice input
    const elementClassName =
        masterController.getColNames()[1].slice(0, 1).toUpperCase() +
        masterController.getColNames()[1].slice(1).toLowerCase();
    /** @type {HTMLSpanElement}  */ const dropdownLine = dom(`
        <div class="selected${elementClassName}Line selectionDetailView"></div>
    `)[0];
    /** @type {Array<HTMLSpanElement>}  */ const [svgClear, svgClose, svgOpen] = dom(`
        <span class="icon clear" id="clear">
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
        <div class="lists selectionMasterView" id="master-${id}">
            <ul class="${masterController.getColNames()[0]}List categoryList list" 
                id="${masterController.getColNames()[0]}List"></ul>
            <div class="line" id="line-${id}"></div>
            <ul class="${masterController.getColNames()[1]}List elementList list" 
                id="${masterController.getColNames()[1]}List"></ul>
        </div>
    `)[0];
    dropdownLine.append(spanElement, svgClear, svgClose, svgOpen);
    dropdownElement.append(dropdownLine, dropdownBody);

    // ------------ CREATE CONTAINER & DETAIL VIEW END -------------------

    // ------------ CREATE MASTER VIEW START -----------------------------

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

    const buildCategories = () => {
        buildColumn(
            masterController.getColNames()[0] + "List",
            masterController.getCategories(),
            masterController.getColNames()[0],
            (e) => {
                changeCategory(e.target.innerHTML);
            },
            (e) => {
                masterController.setFocusObject({
                    value: e.target.innerHTML,
                    column: 0,
                });
            }
        );
    };

    const buildElements = () => {
        buildColumn(
            masterController.getColNames()[1] + "List",
            masterController.getElements(),
            masterController.getColNames()[1],
            (e) => {
                changeElement(e.target.innerHTML);
            },
            (e) => {
                masterController.setFocusObject({
                    value: e.target.innerHTML,
                    column: 1,
                });
            }
        );
    };
    buildCategories();
    buildElements();

    // ------------ CREATE MASTER VIEW END -------------------------------

    // ------------ UPDATE MASTER VIEW START -----------------------------

    const displayConcreteField = (list, name, currentValue, className) => {
        const currentIndex = list.findIndex((e) => e === currentValue);
        if (currentIndex >= 0) {
            const currentColValue = dropdownElement.querySelector("#" + name + "-" + currentIndex);
            currentColValue.classList.add(className);
        }
    };

    const displayColumn = (list, name, currentValue, exec = () => {
    }) => {
        for (let i = 0; i < list.length; i++) {
            let element = dropdownElement.querySelector("#" + name + "-" + i);
            element.setAttribute("CLASS", "entry " + name);
            exec(element, i);
        }

        displayConcreteField(list, name, currentValue, "selected");
    };

    const displayCategories = () => {
        displayColumn(
            masterController.getCategories(),
            masterController.getColNames()[0],
            masterController.getValue()[masterController.getColNames()[0]]
        );
    };

    const displayElements = () => {
        displayColumn(
            masterController.getElements(),
            masterController.getColNames()[1],
            masterController.getValue()[masterController.getColNames()[1]],
            (element, i) => {
                if (
                    !masterController
                        .getFilteredElements()
                        .includes(masterController.getElementList()[i][masterController.getColNames()[1]])
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
                masterController.getColNames()[0],
                masterController.getFocusObject().value,
                "focused"
            );
        }
        if (masterController.getFocusObject().column === 1) {
            displayConcreteField(
                masterController.getElements(),
                masterController.getColNames()[1],
                masterController.getFocusObject().value,
                "focused"
            );
        }
    };

    const display = () => {
        displayCategories();
        displayElements();
        displayCurrentPosition();
    };

    const scrollColumn = (column = 1) => {
        const currentElementElement =
            dropdownElement.querySelector(`.${masterController.getColNames()[column]}.focused`) ??
            dropdownElement.querySelector(`.${masterController.getColNames()[column]}.selected`) ??
            dropdownElement.querySelector(`.${masterController.getColNames()[column]}`);
        if (currentElementElement) {
            const elementListContainer = dropdownElement.querySelector(`#${masterController.getColNames()[column]}List`);
            const height = elementListContainer.offsetTop + elementListContainer.offsetHeight / 2 - currentElementElement.offsetHeight / 2;
            elementListContainer.scrollTo({top: currentElementElement.offsetTop - height});
        }
    };

    const toggleSelect = () => {
        const className = "open";
        const classNameIcon = "show";

        const elementField = inputElement.classList;
        const iconOpen = svgOpen.classList;
        const iconClose = svgClose.classList;

        if (masterController.getChoiceBoxOpen()) {
            elementField.add(className);
            dropdownBody.classList.add(className);

            iconOpen.add(classNameIcon);
            iconClose.remove(classNameIcon);

            // todo in style
            const categoryListContainer = dropdownElement.querySelector(`#${masterController.getColNames()[0]}List`);
            dropdownBody.style.height =
                categoryListContainer.childElementCount * (categoryListContainer.firstChild.offsetHeight + 1) + 8 + "px";

            displayCurrentPosition();
            scrollColumn();
        } else {
            elementField.remove(className);
            dropdownBody.classList.remove(className);

            iconOpen.remove(classNameIcon);
            iconClose.add(classNameIcon);
        }
    };

    const updateClearIcon = () => {
        if (detailController.getValue() === "") {
            svgClear.classList.remove("show");
        } else {
            svgClear.classList.add("show");
        }
    };

    // ------------ UPDATE MASTER VIEW END -------------------------------

    // ------------ UPDATE FIELDS START ----------------------------------

    const changeSelection = (newVal) => {
        const colNumber = masterController.getFocusObject().column;
        const colName = masterController.getColNames()[colNumber];
        masterController.setValue({
            [colName]: newVal,
        });
        masterController.setFocusObject({
            value: newVal,
        });
    };

    const changeCategory = (newVal) => {
        masterController.setFocusObject({column: 0});
        changeSelection(newVal);
        scrollColumn();
    };

    const changeElement = (newVal) => {
        masterController.setFocusObject({column: 1});
        changeSelection(newVal);
        updateClearIcon();
    };

    const resetValue = () => {
        const colName = masterController.getColNames()[1];
        masterController.setValue({[colName]: ""});
        updateClearIcon();
    };

    // ------------ UPDATE FIELDS END ------------------------------------

    // ------------ BIND DETAIL CONTROLLER ACTIONS START -----------------

    detailController.onValueChanged((val) => {
        inputElement.value = /** @type String */ val;
    });
    detailController.onPlaceholderChanged((val) => inputElement.setAttribute("placeholder", val ? val : ""));

    // todo future change if editable select
    detailController.onEditableChanged((_) => inputElement.setAttribute("readonly", "on"));

    // ------------ BIND DETAIL CONTROLLER  ACTIONS END ------------------

    // ------------ BIND MASTER CONTROLLER ACTIONS START -----------------

    masterController.onElementListChanged((_) => {
        display();
    });
    masterController.onValueChanged((val) => {
        if (val[masterController.getColNames()[1]] != null) {
            detailController.setValue(val[masterController.getColNames()[1]]);
        }
        display();
    });
    masterController.onFocusObjectChanged((_) => {
        display();
    });
    masterController.onDebounceTextChanged((_) => {
        masterController.setFocusObject({column: masterController.getColNames().length - 1});
        display();
    });
    masterController.onChoiceBoxOpenChanged((val) => {
        masterController.setChoiceBoxOpen(val);
        toggleSelect();
    });

    // ------------ BIND MASTER CONTROLLER  ACTIONS END ------------------

    // ------------ BIND HTML ELEMENT ACTIONS START ----------------------

    dropdownBody.onclick = () => {
        inputElement.focus();
        masterController.setChoiceBoxOpen(true);
    };

    dropdownLine.onclick = () => {
        inputElement.focus();
    };
    svgClear.onclick = () => {
        resetValue();
    };
    svgOpen.onclick = () => {
        masterController.setChoiceBoxOpen(false);
    };
    svgClose.onclick = () => {
        masterController.setChoiceBoxOpen(true);
    };
    inputElement.onblur = () => {
        // masterController.setChoiceBoxOpen(false); // todo DEBUG
    };
    inputElement.onclick = () => {
        masterController.setChoiceBoxOpen(!masterController.getChoiceBoxOpen());
    };
    // todo key board bugs long press
    inputElement.onkeydown = (e) => {
        switch (e.code ?? e.key ?? e.keyCode) {
            case "ArrowLeft":
            case 37:
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                masterController.setFocusObject({
                    column: masterController.getFocusObject().column - 1,
                    value: masterController.getValue()[masterController.getColNames()[0]],
                });
                break;
            case "ArrowUp":
            case 38:
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                masterController.setFocusToPrev();
                if (masterController.getFocusObject().column === 0) {
                    changeCategory(masterController.getFocusObject().value);
                }
                scrollColumn();
                break;
            case "ArrowRight":
            case 39:
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                let defaultValue = null;
                if (
                    masterController
                        .getFilteredElements()
                        .includes(masterController.getValue()[masterController.getColNames()[1]])
                ) {
                    defaultValue = masterController.getValue()[masterController.getColNames()[1]];
                } else {
                    defaultValue = masterController.getFilteredElements()[0];
                }
                masterController.setFocusObject({
                    column: masterController.getFocusObject().column + 1,
                    value: defaultValue,
                });
                scrollColumn();
                break;
            case "ArrowDown":
            case 40:
                if (!dropdownBody.classList.contains("open")) {
                    masterController.setChoiceBoxOpen(true);
                    break;
                }
                masterController.setFocusToNext();
                if (masterController.getFocusObject().column === 0) {
                    changeCategory(masterController.getFocusObject().value);
                }
                scrollColumn();
                break;
            case "Enter":
            case 13:
            case " ":
            case 32:
                if (!dropdownBody.classList.contains("open")) {
                    masterController.setChoiceBoxOpen(true);
                    break;
                }
                if (masterController.getFocusObject().column === 0) {
                    let defaultValue = null;
                    if (
                        masterController
                            .getFilteredElements()
                            .includes(masterController.getValue()[masterController.getColNames()[1]])
                    ) {
                        defaultValue = masterController.getValue()[masterController.getColNames()[1]];
                    } else {
                        defaultValue = masterController.getFilteredElements()[0];
                    }
                    masterController.setFocusObject({
                        column: masterController.getFocusObject().column + 1,
                        value: defaultValue,
                    });
                }
                if (masterController.getFocusObject().column === 1) {
                    changeElement(masterController.getFocusObject().value);
                }
                break;
            case "Escape":
            case 27:
                masterController.setChoiceBoxOpen(false);
                break;
            case "Backspace":
            case 8:
                resetValue();
                break;
            case "Tab":
            case 9:
                masterController.setChoiceBoxOpen(false);
                break;
            default:
                // e.preventDefault();
                if (e.key.length === 1) {
                    masterController.triggerDebounceInput(e.key);
                    if (masterController.getChoiceBoxOpen()) {
                        scrollColumn();
                    } else {
                        updateClearIcon();
                    }
                }
                break;
        }
    };

    // ------------ BIND HTML ELEMENT ACTIONS END ------------------------

    return [labelElement, dropdownElement];
};
