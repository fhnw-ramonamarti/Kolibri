import { CategoryOption, ValueOption, nullOption }         from "./optionsModel.js";
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
 * A selection of a category leads to unselecting all sub categories
 * expect the selected value. This component slows down for over 1_000 options in a column.
 * @param { SelectAttribute }                                      selectAttributes
 * @param { Array<(filter: String) => Array<CallbackReturnType>> } serviceCallbacks - list of functions to get the data for each column
 * @returns { [HTMLDivElement, HTMLLabelElement, HTMLDivElement] }   - [component container (all in one container), 
 *                                                                     label part of component, 
 *                                                                     selection input part of component]
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

    /**
     * @param { Number } col - defines if column is value or category type, 0 is value
     * @returns { (CallbackReturnType) => OptionType }
     */
    const mapping = (col) => (e) => {
        if(null != e?.label || null != e?.value ){
            // callback returns object
            return col !== 0 ? CategoryOption(e?.label ?? e?.value)
                : ValueOption(e?.value ?? e, e?.label)
        } else {
            // callback returns string
            return col !== 0 ? CategoryOption( e)
                : ValueOption(e)
        }
    };

    // initial fill of options
    serviceCallbacks.forEach((cb, col) => {
        cb().forEach(e => {
            const option = mapping(col)(e);
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
        // due to performance issues, rm: find a better solution
        const areOptionsSorted = selectAttributes.sortOptionsAlphabetically ?? true;
        selectController
            .getColumnOptionsComponent(col)
            .setOptionsSorted(areOptionsSorted && cb().length <= 1_000);
    });

    // define value options selection change
    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        if (!selectController.isDisabled()) {
            selectionElement.innerHTML = option.getLabel();
            inputElement
                .querySelector(".clear")
                .classList.toggle("hidden", "" === option.getLabel());
        }
    });

    const nullOptionId = nullOption.getId();

    /**
     * @param { Number }     col 
     * @param { OptionType } filterCategory 
     * @param { Number }     selectedColumn - biggest found column with selected option smaller than current col
     * @returns { Boolean } - true if the value option is contained in selected categories
     */
    const filterOptions = (col, filterCategory, selectedColumn = 0) => {        
        const selectedOption = selectController.getColumnOptionsComponent(col).getSelectedOption();
        const searchCategory = filterCategory.getLabel() === "" ? null : filterCategory.getLabel();

        const options = serviceCallbacks[col](searchCategory).map(mapping(col));
        options.forEach((option) => {
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
        
        if (col === 0) {
            return options.map((o) => o.getValue()).includes(selectedOption.getValue());
        } else {
            if (selectedOption.getId() !== nullOptionId) {
                return filterOptions(col - 1, selectedOption, selectedColumn);
            } else {
                return options
                    .map((option) => filterOptions(col - 1, option, selectedColumn))
                    .reduce((acc, option) => acc || option, false);
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
            const selectedColumn      = selectController
                .getSelectedOptionOfColumns(col)
                .findIndex((option) => option.getId() !== nullOptionId);
            if (option.getId() === nullOptionId) {
                if (serviceCallbacks.length <= col + 1) {
                    // unselect most general category
                    selectController.clearColumnOptions(col, 0);
                    filterOptions(col, option);
                    return;
                }

                // unselect category
                const selectedCategory = selectController
                    .getColumnOptionsComponent(col + 1)
                    .getSelectedOption();
                selectController.clearColumnOptions(col, 0);
                filterOptions(col, selectedCategory);
            } else {
                // select category
                const minCol = selectedColumn <= col - 1 ? selectedColumn : 0;
                selectController.clearSelectedOptions(col - 1);
                selectController.clearColumnOptions(col - 1, minCol);
                isValueOptionSelected = filterOptions(col - 1, option, minCol);
                if (!isValueOptionSelected) {
                    selectController.clearSelectedValueOption();
                }
            }
        });
    });

    return [
        component,
        /** @type { HTMLLabelElement } */ labelElement,
        /** @type { HTMLDivElement } */ inputElement,
    ];
}

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
