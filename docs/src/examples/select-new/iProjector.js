import { nullOption } from "./optionsModel.js";

export { iProjector };

let currentColumn = 0;
const iProjector = (rootElement, componentController) => {

    componentController.onCursorPositionChanged((newOption) =>
        componentController.getColumnOptionsComponent(currentColumn).setSelectedOption(newOption)
    );

    // over all columns to listen for click
    [...Array(componentController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        rootElement.querySelector(`[data-column="${col}"]`).addEventListener("mousedown", (_) => {
            currentColumn = col;
        });
    });

    const handleKeyDown = (e) => {
        if (componentController.isOptionsVisible()) {
            // initial no cursor position
            if (
                nullOption.getId() === componentController.getCursorPosition().getId() &&
                ![e.code, e.key].includes("Tab")
            ) {
                const columnOptions = componentController
                    .getColumnOptionsComponent(currentColumn)
                    .getOptions();
                componentController
                    .getColumnOptionsComponent(currentColumn)
                    .setSelectedOption(columnOptions[0]);
                return;
            }
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
                    componentController.setOptionsVisibility(false);
                    break;
                default:
                    break;
            }
        } else {
            switch (e.code || e.key || e.keyCode) {
                case " ":
                case "Space":
                case 32:
                case "ArrowDown":
                case 40:
                    componentController.setOptionsVisibility(true);
                    break;
            }
        }
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
            document.querySelector("[popover]:popover-open") != null
        ) {
            e.preventDefault();
        }
    });

    const findModelByElement = (element) => {
        const optionValue = element.getAttribute("data-value");
        const optionLabel = element.getAttribute("data-label");
        const columnOptions = componentController
            .getColumnOptionsComponent(currentColumn)
            .getOptions();
        return columnOptions.find(
            (option) => option.getLabel() === optionLabel && option.getValue() === optionValue
        );
    };

    const moveCursorUp = () => {
        const currentModel = componentController.getCursorPosition();
        const currentElement = rootElement.querySelector(
            `[data-value="${currentModel.getValue()}"][data-label="${currentModel.getLabel()}"]`
        );
        const siblingElement = currentElement?.previousElementSibling;
        if (siblingElement){
            const siblingModel = findModelByElement(siblingElement);
            componentController.setCursorPosition(siblingModel);
        }
    };

    const moveCursorDown = () => {
        const currentModel = componentController.getCursorPosition();
        const currentElement = rootElement.querySelector(
            `[data-value="${currentModel.getValue()}"][data-label="${currentModel.getLabel()}"]`
        );
        const nextElement = currentElement?.nextElementSibling;
        if (nextElement){
            const siblingModel = findModelByElement(nextElement);
            componentController.setCursorPosition(siblingModel)
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
    }; //mitn column variable arbeitn 1 erhöhen oder tiefen und dann columncomponent holen und schauen ob getselected exisitert als curserpos setzen und wenn keins gefungen wird first child nehmen von column column als element holen mit col 0 und 1 siehe im UI dann umwandeln zum damit arbeiten

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
};
