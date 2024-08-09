import {elementDataLabel, getHtmlElementByOption} from "./columnOptionsProjector.js";
import {nullOption} from "./optionsModel.js";

export {interactionProjector};

/**
 * Define the interaction keys on the keyboard.
 * The interaction is split between the opened and closed popover state.
 * The opened state:
 * The arrow keys move the cursor position by one element.
 * Space and Enter select the element under the cursor position.
 * Tab and Esc close the popover container of the select.
 * PageUp and PageDown move the cursor position by `pageSize` number of elements in the current column.
 * Home and End move the cursor position to the Start/End of the current column.
 * A single letter or digit moves the cursor position to a specific element.
 * The closed state:
 * The arrow keys up and down move the cursor position by one element on the value column.
 * Home and End move the cursor position to the Start/End of the value column.
 * Space opens the popover container of the select.
 * A single letter or digit moves the cursor position to a specific element.
 * The letters are limitted to the english and german language.
 *
 * @private
 * @param { HTMLDivElement }      rootElement
 * @param { SelectComponentType } selectController
 * @param { Observable<Number> }  currentColumn    - column of the cursor position
 * @param { Number }              pageSize         - number of elements for pageUp/Down - default 10
 * @param { Boolean }             autoClose        - automatically close the popover after value selection
 */

const interactionProjector = (
    rootElement,
    selectController,
    currentColumn,
    pageSize = 10,
    autoClose = true
) => {

    // over all columns to listen for click for focus
    [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        rootElement.querySelector(`[data-column="${col}"]`).addEventListener("mousedown", (_) => {
            currentColumn.setValue(col);
        });
    });

    /**
     * @param { KeyboardEvent } event - event of a keydown event
     */
    const handleKeyDown = (event) => {
        if (selectController.isDisabled()) {
            return; // no events allowed
        }
        if (initCursor(event)) {
            // first key pressed in the component
            if (!["Enter", "Tab", "Escape", "Space", " "].includes(event.key)) {
                return;
            }
        }


        //let currentColumn = 0;
        /*
        selectController.onCursorPositionChanged((newOption) => {
            const columnComponent = selectController.getColumnOptionsComponent(currentColumn);
            if (columnComponent.getOptions().findIndex((option) => option.equals(newOption)) >= 0) {
                columnComponent.setSelectedOption(newOption);
            }
        });

        // over all columns to listen for click -> nach oben
        [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
            rootElement.querySelector(`[data-column="${col}"]`).addEventListener("mousedown", (_) => {
                currentColumn = col;
            });
        }); */

            if (selectController.isOptionsVisible()) {
                // initial no cursor position
                if (
                    nullOption.getId() === selectController.getCursorPosition().getId() &&
                    ![e.code, e.key].includes("Tab")
                ) {
                    const columnOptions = selectController
                        .getColumnOptionsComponent(currentColumn)
                        .getOptions();
                    selectController
                        .getColumnOptionsComponent(currentColumn)
                        .setSelectedOption(columnOptions[0]);
                    return;
                }
                if (selectController.isOptionsVisible()) {
                    // key actions for opened popover
                    switch (e.code || e.key || e.keyCode) {
                        case "ArrowUp":
                        case 38:
                            moveCursorUp();
                            break;
                        case "ArrowDown":
                        case 40:
                            moveCursorDown();
                            break;
                        case "ArrowLeft":
                        case 37:
                            moveCursorLeft();
                            break;
                        case "ArrowRight":
                        case 39:
                            moveCursorRight();
                            break;
                        case "Enter":
                        case 13:
                        case " ":
                        case "Space":
                        case 32:
                            selectCursorPos();
                            break;
                        case "Tab":
                        case 9:
                        case "Escape":
                        case 27:
                            selectController.setOptionsVisibility(false);
                            break;
                        case "Home":
                        case 36:
                            moveCursorToFirstUp();
                            break;
                        case "End":
                        case 35:
                            moveCursorLastDown();
                            break;
                        case "PageUp":
                        case 33:
                            for (let i = 0; i < pageSize; i++) {
                                moveCursorUp();
                            }
                            break;
                        case "PageDown":
                        case 34:
                            for (let i = 0; i < pageSize; i++) {
                                moveCursorDown();
                            }
                            break;
                        case "Backspace":
                        case 8:
                            handleBackspace();
                            break;
                    }
                } else {
                    // key actions for closed popover
                    if (resetCursor(event)) {
                        return; // first key pressed in the closed component
                    }
                    switch (e.code || e.key || e.keyCode) {
                        case " ":
                        case "Space":
                        case 32:
                            selectController.setOptionsVisibility(true);
                            break;
                        case "ArrowUp":
                        case 38:
                            moveCursorUp();
                            break;
                        case "ArrowDown":
                        case 40:
                            moveCursorDown();
                            //selectController.setOptionsVisibility(true);
                            break;
                        case "Home":
                        case 36:
                            moveCursorToFirstUp();
                            break;
                        case "End":
                        case 35:
                            moveCursorLastDown();
                            break;
                        case "Backspace":
                        case 8:
                            handleBackspace();
                            break;
                    }
                }

                handleLetters(event);
            };

            rootElement.addEventListener('keydown', handleKeyDown);

            // prevent scrolling with key while popover opened
            window.addEventListener("keydown", (e) => {
                if (
                    [
                        32,
                        "Space",
                        37,
                        "ArrowLeft",
                        38,
                        "ArrowUp",
                        39,
                        "ArrowRight",
                        40,
                        "ArrowDown",
                    ].indexOf(e.code) > -1 &&
                    null != document.querySelector("[popover]:popover-open")
                ) {
                    e.preventDefault();
                }
            });

            /**
             * @param { KeyboardEvent } event - event of a keydown event
             * @returns { Boolean }           - if the init is fulfilled
             */
            const initCursor = (event) => {
                if (
                    nullOption.getId() === selectController.getCursorPosition().getId() &&
                    ![event.code, event.key].includes("Tab")
                ) {
                    const columnOptions = selectController
                        .getColumnOptionsComponent(currentColumn.getValue())
                        .getOptions();
                    selectController.setCursorPosition(columnOptions[0]);
                    if (!selectController.isOptionsVisible()) {
                        selectController.setSelectedValueOption(columnOptions[0]);
                    }
                    return true;
                }
                return false;
            };

            /**
             * @param { KeyboardEvent } event - event of a keydown event
             * @returns { Boolean }           - if the reset is fullfilled
             */
            const resetCursor = (event) => {
                if (currentColumn.getValue() === 0) {
                    return false;
                }
                currentColumn.setValue(0);
                selectController.setCursorPosition(nullOption);
                initCursor(event);
                return true;
            };


            /**
             * @param { HTMLDivElement } element - html element of a signle option
             * @returns { OptionType }           - option fitting to the html element
             */
            const findOptionByElement = (element) => {
                const optionValue = element.getAttribute("data-value");
                const optionLabel = element.getAttribute("data-label");
                const columnOptions = selectController
                    .getColumnOptionsComponent(currentColumn.getValue())
                    .getOptions();
                return columnOptions.find(
                    (option) =>
                        elementDataLabel(option) === optionLabel &&
                        option.getValue() === optionValue
                );
            };

            /**
             * @returns { OptionType } - first option of the current option or null option if empty
             */
            const findFirstOptionOfColumn = () => {
                const columnElement = rootElement.querySelector(`[data-column="${currentColumn.getValue()}"]`);
                const firstChild = columnElement.firstChild;
                return firstChild ? findOptionByElement(firstChild) : nullOption;
            };

            /**
             * @param { HTMLDivElement } element - html element of a signle option
             * @returns { Boolean }              - element is in the visible in the column
             */
            const isItemVisible = (element) => {
                const {y, height} = element.getBoundingClientRect();
                const {parentY, parentHeight} = [element.parentElement.getBoundingClientRect()].map(
                    (parent) => ({parentY: parent.y, parentHeight: parent.height})
                )[0];
                return parentY <= y && parentY + parentHeight >= y + height;
            }

            const moveCursorToFirstUp = () => {
                const currentModel = selectController.getCursorPosition();
                const currentElement = getHtmlElementByOption(currentModel, rootElement);
                const siblingElement = currentElement?.parentElement.firstChild;
                if (siblingElement) {
                    if (!isItemVisible(siblingElement)) {
                        siblingElement.scrollIntoView(true);
                    }
                    const siblingModel = findOptionByElement(siblingElement);
                    selectController.setCursorPosition(siblingModel);
                    // to update view
                    moveCursorUp();
                    moveCursorDown();
                    if (!selectController.isOptionsVisible()) {
                        selectController.setSelectedValueOption(siblingModel);
                    }
                }
            };

            const moveCursorLastDown = () => {
                const currentModel = selectController.getCursorPosition();
                const currentElement = getHtmlElementByOption(currentModel, rootElement);
                const siblingElement = currentElement?.parentElement.lastChild.previousElementSibling;
                if (siblingElement) {
                    if (!isItemVisible(siblingElement)) {
                        siblingElement.scrollIntoView(false);
                    }
                    const siblingModel = findOptionByElement(siblingElement);
                    selectController.setCursorPosition(siblingModel);
                    // to update view
                    moveCursorUp();
                    moveCursorDown();
                    if (!selectController.isOptionsVisible()) {
                        selectController.setSelectedValueOption(siblingModel);
                    }
                }
            };

            const moveCursorUp = () => {
                const currentModel = selectController.getCursorPosition();
                const currentElement = getHtmlElementByOption(currentModel, rootElement);
                const siblingElement = currentElement?.previousElementSibling;
                if (siblingElement) {
                    if (!isItemVisible(siblingElement)) {
                        siblingElement.scrollIntoView(true);
                    }
                    const siblingModel = findOptionByElement(siblingElement);
                    selectController.setCursorPosition(siblingModel);
                }
            };

            const moveCursorDown = () => {
                const currentModel = selectController.getCursorPosition();
                const currentElement = getHtmlElementByOption(currentModel, rootElement);
                const siblingElement = currentElement?.nextElementSibling;
                if (siblingElement) {
                    if (!isItemVisible(siblingElement)) {
                        siblingElement.scrollIntoView(false);
                    }
                    const siblingModel = findOptionByElement(siblingElement);
                    selectController.setCursorPosition(siblingModel);
                    if (!selectController.isOptionsVisible()) {
                        selectController.setSelectedValueOption(siblingModel);
                    }
                }
            };

        const handleBackspace = () => {
            if (currentColumn.getValue() > 0) {
                moveCursorRight();
            } else {
                selectController.setCursorPosition(nullOption);
                selectController.setOptionsVisibility(false);
            }
        };

            /*const moveCursorLeft = () => {
                const currentModel = selectController.getCursorPosition();
                const currentColumn = currentModel ? currentModel.getColumn() : 0;
                if (currentColumn > 0) {
                    const newOptions = selectController.getCategoryOptions(currentColumn - 1);
                    if (newOptions.length > 0) {
                        selectController.setCursorPosition(newOptions[0]);
                    }
                }
            };*/

            const moveCursorLeft = () => {
                if (currentColumn.getValue() + 1 >= selectController.getNumberOfColumns()) {
                    return;
                }
                currentColumn.setValue(currentColumn.getValue() + 1);

                const selectedOption = selectController
                    .getColumnOptionsComponent(currentColumn.getValue())
                    .getSelectedOption();
                const firstOption = findFirstOptionOfColumn();

                const cursorPosition = selectedOption.getId() === nullOption.getId() ? firstOption : selectedOption;
                const cursorElement = getHtmlElementByOption(cursorPosition, rootElement);
                if (!isItemVisible(cursorElement)) {
                    cursorElement.scrollIntoView(false);
                }
                selectController.setCursorPosition(cursorPosition);
            };

            /*const moveCursorRight = () => {
                const currentModel = selectController.getCursorPosition();
                const currentColumn = currentModel ? currentModel.getColumn() : 0;
                const numberOfColumns = selectController.getNumberOfColumns();
                if (currentColumn < numberOfColumns - 1) {
                    const newOptions = selectController.getCategoryOptions(currentColumn + 1);
                    if (newOptions && newOptions.length > 0) {
                        selectController.setCursorPosition(newOptions[0]);
                    }
                }
            }; //mit column variable arbeitn 1 erhöhen oder tiefen und dann columncomponent holen und schauen ob getselected exisitert als curserpos setzen und wenn keins gefungen wird first child nehmen von column, column als element holen mit col 0 und 1 siehe im UI dann umwandeln zum damit arbeiten
        */

            const moveCursorRight = () => {
                if (currentColumn.getValue() - 1 < 0) {
                    return;
                }
                currentColumn.setValue(currentColumn.getValue() - 1);

                const selectedOption = selectController
                    .getColumnOptionsComponent(currentColumn.getValue())
                    .getSelectedOption();
                const firstOption = findFirstOptionOfColumn();

                const cursorPosition =
                    selectedOption.getId() === nullOption.getId() ? firstOption : selectedOption;
                const cursorElement = getHtmlElementByOption(cursorPosition, rootElement);
                if (!isItemVisible(cursorElement)) {
                    cursorElement.scrollIntoView(false);
                }
                selectController.setCursorPosition(cursorPosition);
            };
            const selectCursorPos = () => {
                const currentPosition = selectController.getCursorPosition();
                const currentOption = selectController.getColumnOptionsComponent(currentColumn.getValue()).getSelectedOption();
                if (0 !== currentColumn.getValue() && currentOption.equals(currentPosition)) {
                    // unselect categories
                    selectController.getColumnOptionsComponent(currentColumn.getValue()).setSelectedOption(nullOption);
                } else {
                    selectController.getColumnOptionsComponent(currentColumn.getValue()).setSelectedOption(currentPosition);
                }
                selectController.setCursorPosition(currentPosition);

                // continue after selection
                if (autoClose) {
                    if (0 === currentColumn.getValue()) {
                        selectController.setOptionsVisibility(false);
                    } else {
                        // wait for ui
                        setTimeout(() => {
                            moveCursorRight();
                        }, 81);
                    }
                }
            };
            /**
             * @param { KeyboardEvent } event - event of an keydown event
             */
            const handleLetters = (event) => {
                switch (event.key || event.keyCode) {
                    case "0":
                        if (moveToLetter("0")) {
                            break;
                        }
                    case "1":
                        if (moveToLetter("1")) {
                            break;
                        }
                    case "2":
                        if (moveToLetter("2")) {
                            break;
                        }
                    case "3":
                        if (moveToLetter("3")) {
                            break;
                        }
                    case "4":
                        if (moveToLetter("4")) {
                            break;
                        }
                    case "5":
                        if (moveToLetter("5")) {
                            break;
                        }
                    case "6":
                        if (moveToLetter("6")) {
                            break;
                        }
                    case "7":
                        if (moveToLetter("7")) {
                            break;
                        }
                    case "8":
                        if (moveToLetter("8")) {
                            break;
                        }
                    case "9":
                        if (moveToLetter("9")) {
                            break;
                        }
                    case "Ä":
                    case "ä":
                    case "à":
                    case "A":
                    case "a":
                        if (moveToLetter("a")) {
                            break;
                        }
                    case "B":
                    case "b":
                        if (moveToLetter("b")) {
                            break;
                        }
                    case "C":
                    case "c":
                        if (moveToLetter("c")) {
                            break;
                        }
                    case "D":
                    case "d":
                        if (moveToLetter("d")) {
                            break;
                        }
                    case "é":
                    case "è":
                    case "E":
                    case "e":
                        if (moveToLetter("e")) {
                            break;
                        }
                    case "F":
                    case "f":
                        if (moveToLetter("f")) {
                            break;
                        }
                    case "G":
                    case "g":
                        if (moveToLetter("g")) {
                            break;
                        }
                    case "H":
                    case "h":
                        if (moveToLetter("h")) {
                            break;
                        }
                    case "I":
                    case "i":
                        if (moveToLetter("i")) {
                            break;
                        }
                    case "J":
                    case "j":
                        if (moveToLetter("j")) {
                            break;
                        }
                    case "K":
                    case "k":
                        if (moveToLetter("k")) {
                            break;
                        }
                    case "L":
                    case "l":
                        if (moveToLetter("l")) {
                            break;
                        }
                    case "M":
                    case "m":
                        if (moveToLetter("m")) {
                            break;
                        }
                    case "N":
                    case "n":
                        if (moveToLetter("n")) {
                            break;
                        }
                    case "Ö":
                    case "ö":
                    case "O":
                    case "o":
                        if (moveToLetter("o")) {
                            break;
                        }
                    case "P":
                    case "p":
                        if (moveToLetter("p")) {
                            break;
                        }
                    case "Q":
                    case "q":
                        if (moveToLetter("q")) {
                            break;
                        }
                    case "R":
                    case "r":
                        if (moveToLetter("r")) {
                            break;
                        }
                    case "S":
                    case "s":
                        if (moveToLetter("s")) {
                            break;
                        }
                    case "T":
                    case "t":
                        if (moveToLetter("t")) {
                            break;
                        }
                    case "Ü":
                    case "ü":
                    case "U":
                    case "u":
                        if (moveToLetter("u")) {
                            break;
                        }
                    case "V":
                    case "v":
                        if (moveToLetter("v")) {
                            break;
                        }
                    case "W":
                    case "w":
                        if (moveToLetter("w")) {
                            break;
                        }
                    case "X":
                    case "x":
                        if (moveToLetter("x")) {
                            break;
                        }
                    case "Y":
                    case "y":
                        if (moveToLetter("y")) {
                            break;
                        }
                    case "Z":
                    case "z":
                        if (moveToLetter("z")) {
                            break;
                        }
                }
            };

            /**
             * Move to first option starting with letter or digit given.
             * Do nothing if if no option is found
             *
             * @param { String } letter - signle char (letter or digit)
             * @returns { Boolean }     - true if option found
             */
            const moveToLetter = (letter) => {
                letter = letter.toLowerCase();
                const columnChildren =
                    [
                        ...rootElement.querySelector(`[data-column="${currentColumn.getValue()}"]`)
                            ?.children,
                    ] ?? [];
                const letterChild = columnChildren.filter((option) =>
                    option.innerHTML
                        .replaceAll(/<[^>]*>/g, "")
                        .toLowerCase()
                        .trim()
                        .startsWith(letter)
                )[0];
                if (letterChild) {
                    if (!isItemVisible(letterChild)) {
                        letterChild.scrollIntoView(true);
                    }
                    const letterModel = findOptionByElement(letterChild);
                    selectController.setCursorPosition(letterModel);

                    // to update view
                    moveCursorUp();
                    if (letterChild.previousElementSibling) {
                        moveCursorDown();
                    }

                    return true;
                }
                return false;
            };
    };
};

        /**
         * Decorates {@link interactionProjector} without selection change on cursor position change.
         * The same key bindings are defined as in {@link interactionProjector}.
         *
         * @param { HTMLDivElement }      rootElement
         * @param { SelectComponentType } selectController
         * @param { Number }              pageSize         - number of elements for pageUp/Down - default 10
         * @example
         const selectController = SelectController({});
         const selectView       = projectSelectViews(selectController);
         interactionProjectorWithSelectionChange(selectView, selectController);
         */
        const interactionProjectorWithoutSelectionChange = (rootElement, selectController, pageSize = 10) => {
            const currentColumn = Observable(0);

            interactionProjector(rootElement, selectController, currentColumn, pageSize);
        }


        /**
         * Decorates {@link interactionProjector} to direct selection change on cursor position change.
         * The same key bindings are defined as in {@link interactionProjector}.
         *
         * @param { HTMLDivElement }      rootElement
         * @param { SelectComponentType } selectController
         * @param { Number }              pageSize         - number of elements for pageUp/Down - default 10
         * @example
         const selectController = SelectController({});
         const selectView       = projectSelectViews(selectController);
         interactionProjectorWithSelectionChange(selectView, selectController);
         */
        const interactionProjectorWithSelectionChange = (rootElement, selectController, pageSize = 10) => {
            const currentColumn = Observable(0);

            selectController.onCursorPositionChanged((newOption) => {
                const columnComponent = selectController.getColumnOptionsComponent(currentColumn.getValue());
                if (columnComponent.getOptions().findIndex((option) => option.equals(newOption)) >= 0) {
                    columnComponent.setSelectedOption(newOption);
                }
            });

            interactionProjector(rootElement, selectController, currentColumn, pageSize, false);
        }

