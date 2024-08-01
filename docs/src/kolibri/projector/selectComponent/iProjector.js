import { elementDataLabel, getHtmlElementByOption } from "./columnOptionsProjector.js";
import { nullOption }                               from "./optionsModel.js";

export { iProjector };

const iProjector = (rootElement, componentController, pageSize = 10) => {
    let currentColumn = 0;


    componentController.onCursorPositionChanged((newOption) => {
        const columnComponent = componentController.getColumnOptionsComponent(currentColumn);
        if (columnComponent.getOptions().findIndex((option) => option.equals(newOption)) >= 0) {
            columnComponent.setSelectedOption(newOption);
        }
    });

    // over all columns to listen for click for focus
    [...Array(componentController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        rootElement.querySelector(`[data-column="${col}"]`).addEventListener("mousedown", (_) => {
            currentColumn = col;
        });
    });

    const handleKeyDown = (event) => {
        if (componentController.isDisabled()) {
            return; // no events allowed
        }
        if (initCursor(event)) {
            // first key pressed in the component
            if (!["Enter", "Tab", "Escape", "Space", " "].includes(event.key)) {
                return;
            }
        }

        if (componentController.isOptionsVisible()) {
            // key actions for opened popover
            switch (event.key || event.code || event.keyCode) {
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
                case "Backspace":
                case 8:
                case "Delete":
                case 46:
                    componentController.clearSelectedValueOption();
                    break;
                case "Tab":
                case 9:
                case "Escape":
                case 27:
                    componentController.setOptionsVisibility(false);
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
            }
        } else {
            // key actions for closed popover
            if (resetCursor(event)) {
                return; // first key pressed in the closed component
            }
            switch (event.key || event.code || event.keyCode) {
                case " ":
                case "Space":
                case 32:
                    componentController.setOptionsVisibility(true);
                    break;
                case "ArrowUp":
                case 38:
                    moveCursorUp();
                    break;
                case "ArrowDown":
                case 40:
                    moveCursorDown();
                    break;
                case "Backspace":
                case 8:
                case "Delete":
                case 46:
                    componentController.clearSelectedValueOption();
                    break;
                case "Home":
                case 36:
                    moveCursorToFirstUp();
                    break;
                case "End":
                case 35:
                    moveCursorLastDown();
                    break;
            }
        }
        handleLetters(event);
    };

    rootElement.addEventListener('keydown', handleKeyDown);
    
    // prevent scrolling with key while popover opened
    window.addEventListener("keydown", (event) => {
        if (
            [
                "Space",
                "ArrowLeft",
                "ArrowUp",
                "ArrowRight",
                "ArrowDown",
                "PageUp",
                "PageDown",
                "Home",
                "End",
            ].indexOf(event.key) > -1 &&
            null != document.querySelector("[popover]:popover-open, [class*=select][class*=input]:focus")
        ) {
            event.preventDefault();
        }
    });

    const initCursor = (event) => {
        if (
            nullOption.getId() === componentController.getCursorPosition().getId() &&
            ![event.code, event.key].includes("Tab")
        ) {
            const columnOptions = componentController
                .getColumnOptionsComponent(currentColumn)
                .getOptions();
            componentController
                .getColumnOptionsComponent(currentColumn)
                .setSelectedOption(columnOptions[0]);
            return true;
        }
        return false;
    };

    const resetCursor = (event) => {
        if (currentColumn === 0) {
            return false;
        }
        currentColumn = 0;
        componentController.setCursorPosition(nullOption);
        initCursor(event);
        return true;
    };

    const findModelByElement = (element) => {
        const optionValue   = element.getAttribute("data-value");
        const optionLabel   = element.getAttribute("data-label");
        const columnOptions = componentController
            .getColumnOptionsComponent(currentColumn)
            .getOptions();
        return columnOptions.find(
            (option) =>
                elementDataLabel(option) === optionLabel &&
                option.getValue() === optionValue
        );
    };

    const isItemVisible = (element) => {
        const { y, height } = element.getBoundingClientRect();
        const { parentY, parentHeight } = [element.parentElement.getBoundingClientRect()].map(
            (parent) => ({ parentY: parent.y, parentHeight: parent.height })
        )[0];
        return parentY <= y && parentY + parentHeight >= y + height;
    }

    const moveCursorToFirstUp = () => {
        const currentModel   = componentController.getCursorPosition();
        const currentElement = getHtmlElementByOption(currentModel, rootElement);
        const siblingElement = currentElement?.parentElement.firstChild;
        if (siblingElement) {
            if (!isItemVisible(siblingElement)) {
                siblingElement.scrollIntoView(true);
            }
            const siblingModel = findModelByElement(siblingElement);
            componentController.setCursorPosition(siblingModel);
            // to update view
            moveCursorDown();
            moveCursorUp();
        }
    };

    const moveCursorLastDown = () => {
        const currentModel   = componentController.getCursorPosition();
        const currentElement = getHtmlElementByOption(currentModel, rootElement);
        const siblingElement = currentElement?.parentElement.lastChild;
        if (siblingElement) {
            if (!isItemVisible(siblingElement)) {
                siblingElement.scrollIntoView(false);
            }
            const siblingModel = findModelByElement(siblingElement);
            componentController.setCursorPosition(siblingModel);
            // to update view
            moveCursorUp();
            moveCursorDown();
        }
    };

    const moveCursorUp = () => {
        const currentModel   = componentController.getCursorPosition();
        const currentElement = getHtmlElementByOption(currentModel, rootElement);
        const siblingElement = currentElement?.previousElementSibling;
        if (siblingElement) {
            if (!isItemVisible(siblingElement)) {
                siblingElement.scrollIntoView(true);
            }
            const siblingModel = findModelByElement(siblingElement);
            componentController.setCursorPosition(siblingModel);
        }
    };

    const moveCursorDown = () => {
        const currentModel   = componentController.getCursorPosition();
        const currentElement = getHtmlElementByOption(currentModel, rootElement);
        const siblingElement = currentElement?.nextElementSibling;
        if (siblingElement) {
            if (!isItemVisible(siblingElement)) {
                siblingElement.scrollIntoView(false);
            }
            const siblingModel = findModelByElement(siblingElement);
            componentController.setCursorPosition(siblingModel);
        }
    };

    const moveCursorLeft = () => {
        const currentModel = componentController.getCursorPosition();
        const currentColumn = currentModel ? currentModel.getColumn() : 0;
        if (currentColumn > 0) {
            const newOptions = componentController.getCategoryOptions(currentColumn - 1);
            if (newOptions.length > 0) {
                componentController.setCursorPosition(newOptions[0]);
            }
        }
    };

    const moveCursorRight = () => {
        const currentModel = componentController.getCursorPosition();
        const currentColumn = currentModel ? currentModel.getColumn() : 0;
        const numberOfColumns = componentController.getNumberOfColumns();
        if (currentColumn < numberOfColumns - 1) {
            const newOptions = componentController.getCategoryOptions(currentColumn + 1);
            if (newOptions && newOptions.length > 0) {
                componentController.setCursorPosition(newOptions[0]);
            }
        }
    };

    const selectCursorPos = () => {
        const cursorModel = componentController.getCursorPosition();
        if (cursorModel) {
            if (cursorModel.getColumn() === 0) {
                componentController.setSelectedOptionModel(cursorModel);
            } else {
                componentController.toggleSelectedCategoryOptionsModel(cursorModel);
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

    const moveToLetter = (letter) => {
        letter = letter.toLowerCase();
        const columnChildren = [...rootElement.querySelector(`[data-column="${currentColumn}"]`)?.children] ?? [];
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
            const letterModel = findModelByElement(letterChild);
            componentController.setCursorPosition(letterModel);
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
