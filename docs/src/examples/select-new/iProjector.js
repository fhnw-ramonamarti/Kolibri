export { iProjector };

let currentColumn = 0;
const iProjector = (rootElement, componentController) => {

    componentController.onCursorPositionChanged( newOption=> componentController.getColumnOptionsComponent(currentColumn).setSelectedOption(newOption) )
    const handleKeyDown = (e) => {
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
            case 32:
                selectCursorPos();
                break;
            case "Escape":
            case 27:
                componentController.setOptionsVisibility(false);
                break;
            default:
                break;
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    /*const highlightItem = (cursorModel, previousCursorModel) => {
        if (previousCursorModel) {
            const oldItem = rootElement.querySelector(`[data-id="${previousCursorModel.getId().replaceAll('.', '-')}"]`);
            if (oldItem) {
                oldItem.classList.remove("highlighted");
            }
        }

        if (cursorModel) {
            const newItem = rootElement.querySelector(`[data-id="${cursorModel.getId().replaceAll('.', '-')}"]`);
            if (newItem) {
                newItem.classList.add("highlighted");
            }
        }
    };

    componentController.onCursorPositionChanged((newCursorModel, oldCursorModel) => {
        highlightItem(newCursorModel, oldCursorModel);
    });*/

     const findModelByElement = (element) => {
         const optionID = element.getAttribute("data-id").replaceAll('-', '.');
         return componentController
             .getColumnOptionsComponent(currentColumn).getOptions().find( option => option.getId() === optionID);
     };

    const moveCursorUp = () => {
        const currentModel = componentController.getCursorPosition();
        const currentElement = rootElement.querySelector(`[date-id="${currentModel.getId().replaceAll('.','-')}"]`);
        const previousElement = currentElement?.previousElementSibling;
        if (previousElement){
            const siblingModel = findModelByElement(previousElement);
            componentController.setCursorPosition(siblingModel)
        }
        /*const currentColumn = currentModel ? currentModel.getColumn() : 0;
        const allOptions = componentController.getCategoryOptions(currentColumn);
        const currentIndex = allOptions.indexOf(currentModel);
        if (currentIndex > 0) {
            componentController.setCursorPosition(allOptions[currentIndex - 1]);
        }*/
    };

    const moveCursorDown = () => {
        const currentModel = componentController.getCursorPosition();
        const currentElement = rootElement.querySelector(`[date-id="${currentModel.getId().replaceAll('.','-')}"]`);
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

    return {
        //highlightItem,
        handleKeyDown,
    };
};
