import { CategoryOption, ValueOption, reset }              from "./optionsModel.js";
import { SelectController }                                from "./selectController.js";
import { projectSelectViews, pageCss as pageComponentCss } from "./selectProjector.js";
import { pageCss as pageCssColumn }                        from "./columnOptionsProjector.js";

export { SelectComponent, pageCss };


/**
 * @typedef { String | { label: String, value: String } } CallbackReturnType
 */

/**
 * SelectComponent maintains a {@link SelectController} and it creates the view.
 * It fills and filters the options columns with the callback functions.
 * More than 2 columns is experimental and can contain filtering bugs.
 * A selection of a category leads to the disselection of all sub categories expect the selected value.
 * @param { SelectAttribute }                              selectAttributes
 * @param { Array<(String) => Array<CallbackReturnType>> } serviceCallbacks - list of functions to get the data for each column
 * @return { [HTMLElement, HTMLElement, HTMLElement] } - component view
 * @constructor
 * @example 
        const selectAttributes = { name: 'city', label: 'City', numberOfColumns: 2 };
        const componentView = SelectComponent(
            selectAttributes,
            [ getCitiesForCountry, getCountries ]
        );
 */
const SelectComponent = (selectAttributes, serviceCallbacks) => {
    const selectController              = SelectController(selectAttributes);
    const [component, selectionElement] = projectSelectViews(selectController);
    const [labelElement, inputElement]  = component.children;

    // initial fill of options
    serviceCallbacks.forEach((cb, col) => {
        cb().forEach(e => {
            const option = col !== 0 ? mapToCategoryOption(e) : mapToValueOption(e?.value ?? e, e?.label ?? e);
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
    });

    // define value options selection change
    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        selectionElement.innerHTML = option.getLabel();
        inputElement.querySelector(".clear").classList.toggle("hidden", "" === option.getLabel());
    });

    /**
     * @param { Number } col
     * @returns { (e: OptionType) => OptionType }
     */
    const mapping = (col) => (e) => col !== 0 ? mapToCategoryOption(e?.label ?? e?.value ?? e) 
                                              : mapToValueOption(e?.value ?? e, e?.label ?? e);

    /**
     * sort option elements by order of service return
     * @param { HTMLDivElement } col
     */
    const sortOptionElements = (col) => {
        const sorting = (a, b) => {
            const allColumnOptions = serviceCallbacks[col](null).map(mapping(col));
            const indexA = allColumnOptions.findIndex(
                (option) => a.innerHTML === option.getLabel() && a.getAttribute("data-value") === option.getValue()
            );
            const indexB = allColumnOptions.findIndex(
                (option) => b.innerHTML === option.getLabel() && b.getAttribute("data-value") === option.getValue()
            );
            return indexA - indexB;
        };
        const columnElement = inputElement.querySelector(`[data-column="${col}"]`);
        const columnOptionsElements = [...columnElement.children].sort(sorting);
        columnElement.innerHTML = "";
        columnElement.append(...columnOptionsElements);
    }

    const nullOptionId = reset().getId();

    /**
     * @param { Number }     col 
     * @param { OptionType } filterCategory 
     * @param { Number }     selectedColumn 
     * @returns { Boolean } - true if the value option is contained in selected categories
     */
    const filterOptions = (col, filterCategory, selectedColumn = 0) => {        
        const selectedOption = selectController.getColumnOptionsComponent(col).getSelectedOption();
        const searchCategory = filterCategory.getLabel() === "" ? null : filterCategory.getLabel();
        
        const options = serviceCallbacks[col](searchCategory).map(mapping(col));
        options.forEach((option) => {
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
        sortOptionElements(col);
        
        if (col === 0) {
            return options.map((o) => o.getValue()).includes(selectedOption.getValue());
        } else {
            if(selectedOption.getId() !== nullOptionId){
                return filterOptions(col - 1, selectedOption, selectedColumn);
            } else {
                return options.map((option) => 
                    filterOptions(col - 1, option, selectedColumn)
                ).reduce((acc, option) => acc || option, false);
            }
        }
    };

    // define category option selection changes
    serviceCallbacks.forEach((_, col) => {
        if (col === 0) {
            return;
        }
        selectController.getColumnOptionsComponent(col)?.onOptionSelected((option) => {
            let isValueOptionSelected = false;
            const selectedColumn = selectController
                .getSelectedOptionOfColumns()
                .findIndex((option) => option.getId() !== nullOptionId);
            if(option.getId() === nullOptionId){
                if(serviceCallbacks.length <= col + 1){
                    // disselect most general category
                    selectController.clearColumnOptions(col);
                    filterOptions(col, option);
                    return;
                }

                // disselect category
                const selectedCategory = selectController
                    .getColumnOptionsComponent(col + 1, selectedColumn)
                    .getSelectedOption();
                selectController.clearColumnOptions(col);
                filterOptions(col, selectedCategory);
            } else {
                // select category
                const minCol = (selectedColumn <= col - 1) ? selectedColumn: 0;
                selectController.clearSelectedOptions(col - 1);
                selectController.clearColumnOptions(col - 1, minCol);
                isValueOptionSelected = filterOptions(col - 1, option, minCol);
                if(!isValueOptionSelected){
                    selectController.clearSelectedValueOption();
                }
            }
        });
    });

    return [component, labelElement, inputElement];
}

/**
 * @param { String } value 
 * @param { String } label 
 * @returns { OptionType }
 */
const mapToValueOption = (value, label) => {
    return ValueOption(value, label);
}

/**
 * @param { String } label 
 * @returns { OptionType }
 */
const mapToCategoryOption = (label) => {
    return CategoryOption(label);
}

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
