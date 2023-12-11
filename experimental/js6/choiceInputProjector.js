import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { InputProjector } from "../../docs/src/kolibri/projector/simpleForm/simpleInputProjector.js";
import { TEXT, dom } from "../../docs/src/kolibri/util/dom.js";

import { ALL } from "./choiceInputController.js";

export { projectChoiceInput };

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
    const valueClassName =
        masterController.getColNames()[1].substr(0, 1).toUpperCase() +
        masterController.getColNames()[1].substr(1).toLowerCase();
    /** @type {HTMLSpanElement}  */ const dropdownLine = dom(`
        <div class="selected${valueClassName}Line selectionDetailView"></div>
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
        <div class="lists selectionMasterView" id="master-${id}">
            <ul class="${masterController.getColNames()[0]}List categoryList list" 
                id="${masterController.getColNames()[0]}List"></ul>
            <div class="line" id="line-${id}"></div>
            <ul class="${masterController.getColNames()[1]}List valueList list" 
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

    const buildValues = () => {
        buildColumn(
            masterController.getColNames()[1] + "List",
            masterController.getElements(),
            masterController.getColNames()[1],
            (e) => {
                changeValue(e.target.innerHTML);
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
    buildValues();

    // ------------ CREATE MASTER VIEW END -------------------------------

    // ------------ UPDATE MASTER VIEW START -----------------------------

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

    const displayCategories = () => {
        displayColumn(
            masterController.getCategories(),
            masterController.getColNames()[0],
            masterController.getValue()[masterController.getColNames()[0]]
        );
    };

    const displayValues = () => {
        displayColumn(
            masterController.getElements(),
            masterController.getColNames()[1],
            masterController.getValue()[masterController.getColNames()[1]],
            (element, i) => {
                if (
                    !masterController
                        .getFilteredElements()
                        .includes(masterController.getValueList()[i][masterController.getColNames()[1]])
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
        displayValues();
        displayCurrentPosition();
    };

    const scrollColumn = (column = 1) => {
        const currentValueElement =
            dropdownElement.querySelector(`.${masterController.getColNames()[column]}.focused`) ??
            dropdownElement.querySelector(`.${masterController.getColNames()[column]}.selected`) ??
            dropdownElement.querySelector(`.${masterController.getColNames()[column]}`);
        if (currentValueElement) {
            const valueListContainer = dropdownElement.querySelector(`#${masterController.getColNames()[column]}List`);
            const height = valueListContainer.offsetHeight / 2 - currentValueElement.offsetHeight / 2;
            valueListContainer.scrollTo({ top: currentValueElement.offsetTop - height });
        }
    };

    const toggleSelect = () => {
        const className = "open";
        const classNameIcon = "show";

        const valueField = inputElement.classList;
        const iconOpen = svgOpen.classList;
        const iconClose = svgClose.classList;

        if (masterController.getChoiceboxOpen()) {
            valueField.add(className);
            dropdownBody.classList.add(className);

            iconOpen.add(classNameIcon);
            iconClose.remove(classNameIcon);

            // todo in style
            const categoryListContainer = dropdownElement.querySelector(`#${masterController.getColNames()[0]}List`);
            dropdownBody.style.height =
                categoryListContainer.childElementCount * categoryListContainer.firstChild.offsetHeight + 1 + "px";

            displayCurrentPosition();
            scrollColumn();
        } else {
            valueField.remove(className);
            dropdownBody.classList.remove(className);

            iconOpen.remove(classNameIcon);
            iconClose.add(classNameIcon);
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
        // display();
    };

    const changeCategory = (newVal) => {
        masterController.setFocusObject({ column: 0 });
        changeSelection(newVal);
        scrollColumn();
    };

    const changeValue = (newVal) => {
        masterController.setFocusObject({ column: 1 });
        changeSelection(newVal);
        updateFieldValue();
    };

    const updateFieldValue = () => {
        const colName = masterController.getColNames()[1];
        // masterController.setValue({ [colName]: masterController.getValue()[colName] });
        if (detailController.getValue() === "") {
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

    // ------------ UPDATE FIELDS END ------------------------------------

    // ------------ BIND DETAIL CONTROLLER ACTIONS START -----------------

    detailController.onValueChanged((val) => {
        inputElement.value = val;
    });
    detailController.onPlaceholderChanged((val) => inputElement.setAttribute("placeholder", val ? val : ""));

    // todo future change if editable select
    detailController.onEditableChanged((_) => inputElement.setAttribute("readonly", "on"));

    // ------------ BIND DETAIL CONTROLLER  ACTIONS END ------------------

    // ------------ BIND MASTER CONTROLLER ACTIONS START -----------------

    masterController.onValueListChanged((val) => {
        display();
    });
    masterController.onValueChanged((val) => {
        if (val[masterController.getColNames()[1]] != null) {
            detailController.setValue(val[masterController.getColNames()[1]]);
        }
        display();
    });
    masterController.onFocusObjectChanged((val) => {
        display();
    });
    masterController.onDebounceTextChanged((val) => {
        masterController.setFocusObject({ column: masterController.getColNames().length - 1 });
        display();
    });
    masterController.onChoiceboxOpenChanged((val) => {
        masterController.setChoiceboxOpen(val);
        toggleSelect();
    });

    // ------------ BIND MASTER CONTROLLER  ACTIONS END ------------------

    // ------------ BIND HTML ELEMENT ACTIONS START ----------------------

    dropdownBody.onclick = () => {
        inputElement.focus();
        masterController.setChoiceboxOpen(true);
    };

    dropdownLine.onclick = () => {
        inputElement.focus();
    };
    svgClear.onclick = () => {
        resetValue();
    };
    svgOpen.onclick = () => {
        masterController.setChoiceboxOpen(false);
    };
    svgClose.onclick = () => {
        masterController.setChoiceboxOpen(true);
    };
    inputElement.onblur = () => {
        // masterController.setChoiceboxOpen(false); // todo DEBUG
    };
    inputElement.onclick = () => {
        masterController.setChoiceboxOpen(!masterController.getChoiceboxOpen());
    };
    // todo key board bugs long press
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
                    value: masterController.getValue()[masterController.getColNames()[0]],
                });
                break;
            case 38: // ArrowUp
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                masterController.setFocusToPrev();
                if (masterController.getFocusObject().column === 0) {
                    changeCategory(masterController.getFocusObject().value);
                }
                scrollColumn();
                break;
            case 39: // ArrowRight
                if (!dropdownBody.classList.contains("open")) {
                    break;
                }
                let defaulValue = null;
                if (
                    masterController
                        .getFilteredElements()
                        .includes(masterController.getValue()[masterController.getColNames()[1]])
                ) {
                    defaulValue = masterController.getValue()[masterController.getColNames()[1]];
                } else {
                    defaulValue = masterController.getFilteredElements()[0];
                }
                masterController.setFocusObject({
                    column: masterController.getFocusObject().column + 1,
                    value: defaulValue,
                });
                scrollColumn();
                break;
            case 40: // ArrowDown
                if (!dropdownBody.classList.contains("open")) {
                    masterController.setChoiceboxOpen(true);
                    break;
                }
                masterController.setFocusToNext();
                if (masterController.getFocusObject().column === 0) {
                    changeCategory(masterController.getFocusObject().value);
                }
                scrollColumn();
                break;
            case 13: // Enter
            case 32: // " " - Space
                if (!dropdownBody.classList.contains("open")) {
                    masterController.setChoiceboxOpen(true);
                    break;
                }
                if (masterController.getFocusObject().column === 0) {
                    let defaulValue = null;
                    if (
                        masterController
                            .getFilteredElements()
                            .includes(masterController.getValue()[masterController.getColNames()[1]])
                    ) {
                        defaulValue = masterController.getValue()[masterController.getColNames()[1]];
                    } else {
                        defaulValue = masterController.getFilteredElements()[0];
                    }
                    masterController.setFocusObject({
                        column: masterController.getFocusObject().column + 1,
                        value: defaulValue,
                    });
                }
                if (masterController.getFocusObject().column === 1) {
                    changeValue(masterController.getFocusObject().value);
                }
                break;
            case 27: // Escape
                masterController.setChoiceboxOpen(false);
                break;
            case 8: // BackSpace
                resetValue();
                break;
            case 9: // Tab
                masterController.setChoiceboxOpen(false);
                break;
            default:
                // e.preventDefault();
                if (e.key.length === 1) {
                    masterController.triggerDebounceInput(e.key);
                    if (masterController.getChoiceboxOpen()) {
                        scrollColumn();
                    } else {
                        updateFieldValue();
                    }
                }
                break;
        }
    };

    // ------------ BIND HTML ELEMEMT ACTIONS END ------------------------

    return [labelElement, dropdownElement];
};
