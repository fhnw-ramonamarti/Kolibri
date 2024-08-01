import { CategoryOption, ValueOption, nullOption }         from "./optionsModel.js";
import { SelectController }                                from "./selectController.js";
import { pageCss as pageComponentCss, projectSelectViews } from "./selectProjector.js";
import { pageCss as pageCssColumn, updateScrollbar }       from "./columnOptionsProjector.js";
import {
    iProjector,
}                                                          from "./iProjector.js";

export { SelectComponentByCallbacks, SelectComponentByTableValues, pageCss };


/**
 * @typedef { String | { label: String, value: String } } OptionDataType
 */

/**
 * @typedef { (...String) => Array<OptionDataType> } CallbackType
 */

/**
 * @typedef { Array<Array<OptionDataType>> } OptionsTable
 */


/**
 * @typedef SelectComponentType
 * @property { () => SelectControllerType } getSelectController
 * @property { () => HTMLDivElement }       getComponentView
 * @property { () => HTMLLabelElement }     getLabelElement
 */

/**
 * SelectComponentByCallbacks maintains a {@link SelectController} and it creates the view.
 * It fills and filters the options columns with the callback functions.
 * The number of the functions in the `serviceCallbacksGeneralToSpecific` defines the number of columns.
 * The order of the callbacks starts with the most general going to the specific service.
 * A selection of a category leads to unselecting all sub categories and values
 * if they are not contained in the selected category. 
 * This component supports up to 3 columns where one contains the input values 
 * and the others may contain categories to filter the values or subcategories.
 * For a good performance the callback return array should not contain > 5_000 entries.
 * While the column values are loading a circular loader in the loading column is provided.
 *
 * The used projector supports browser with popover api and nested css support.
 * Browsers: Chrome ≥ 114, Firefox ≥ 125, Safari ≥ 17 (for lower versions an alert infobox appears)
 *
 * @param { SelectAttributes }    selectAttributes
 * @param { Array<CallbackType> } serviceCallbacksGeneralToSpecific - list of callbacks to support the column data
 * @returns { SelectComponentType }
 * @constructor
 * @example 
        const selectAttributes = { name: 'city', label: 'City' };
        const component        = SelectComponentByCallbacks(
            selectAttributes,
            [ getCountries, getCitiesForCountry ]
        );
 */
const SelectComponentByCallbacks = (selectAttributes, serviceCallbacksGeneralToSpecific) => {
    const serviceCallbacks = [...serviceCallbacksGeneralToSpecific].reverse();
    const selectController = SelectController(selectAttributes, serviceCallbacks.length);

    const [componentView, selectionElement] = projectSelectViews(selectController);
    const [labelElement, inputElement]      = componentView.children;

    /**
     * @param { Number } col - defines if column is value or category type, 0 is value
     * @returns { (OptionDataType) => OptionType }
     */
    const mapping = (col) => (e) => {
        if (null != e?.label || null != e?.value) {
            // callback returns object
            return col !== 0
                ? CategoryOption(e?.label ?? e?.value)
                : ValueOption(e?.value ?? e, e?.label);
        }
        // callback returns string
        return col !== 0 ? CategoryOption(String(e)) : ValueOption(String(e));
    };

    // initial fill of options
    serviceCallbacks.forEach((cb, col) => {
        selectController.getColumnOptionsComponent(col).addOptions(cb().map(mapping(col)));
    });

    // define value options selection change
    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        if (!selectController.isDisabled()) {
            selectionElement.innerHTML = option.getLabel();
        }
        inputElement
            .querySelector(".clear")
            .classList.toggle("hidden", "" === option.getLabel());
    });

    const nullOptionId = nullOption.getId();

    /**
     * @param { Number }            col 
     * @param { Array<OptionType> } filterCategories 
     */
    const filterOptions = (col, filterCategories) => {
        if(col >= serviceCallbacks.length){
            return;
        }
        const selectedOption   = selectController.getColumnOptionsComponent(col).getSelectedOption();
        const searchCategories = filterCategories?.map(option => option.getLabel()) ?? [];
        const options          = serviceCallbacks[col](...searchCategories).map(mapping(col));

        /**
         * @param { Array<OptionType> } oldOpts 
         * @param { Array<OptionType> } newOpts 
         * @returns { Boolean }
         */
        const areOptionsSame = (oldOpts, newOpts) =>
            oldOpts.map((opt, inx) => opt.equals(newOpts[inx])).filter((eq) => !eq).length === 0 &&
            newOpts.map((opt, inx) => opt.equals(oldOpts[inx])).filter((eq) => !eq).length === 0;

        if (areOptionsSame(selectController.getColumnOptionsComponent(col).getOptions(), options)) {
            const columnView = selectController.getColumnOptionsComponent(col).getColumnView();
            updateScrollbar(columnView);
            return;
        }

        if (!options.some((option) => option.equals(selectedOption))) {
            selectController.getColumnOptionsComponent(col).clearSelectedOption();
        }
        selectController.getColumnOptionsComponent(col).clearOptions();
        selectController.getColumnOptionsComponent(col).addOptions(options);
        
        const columnView = selectController.getColumnOptionsComponent(col).getColumnView();
        updateScrollbar(columnView);

        if (col !== 0) {
            const selectedOption = selectController
                .getColumnOptionsComponent(col)
                .getSelectedOption();

            const categories = selectedOption.getId() !== nullOptionId
                             ? [selectedOption]
                             : options;

            filterOptions(col - 1, categories);
        }
    };

    // define category option selection changes
    serviceCallbacks.forEach((_, col) => {
        if (col === 0) {
            return;
        }
        selectController.getColumnOptionsComponent(col)?.onOptionSelected((option) => {
            if (option.getId() === nullOptionId) {
                if (serviceCallbacks.length <= col + 1) {
                    // unselect most general category
                    filterOptions(col - 1, []);
                    return;
                }

                // unselect category
                const selectedSuperCategory = option;
                const allSuperCategories    = selectController
                    .getColumnOptionsComponent(col)
                    .getOptions();
                const superCategories = selectedSuperCategory.getId() !== nullOptionId
                    ? [selectedSuperCategory]
                    : allSuperCategories;
                filterOptions(col - 1, superCategories);
                return;
            } 
            // select category
            filterOptions(col - 1, [option]);
        });
    });

    // add interaction
    setTimeout(() => {
        // async due to waiting for ui
         iProjector(componentView, selectController);
    }, 81);

    return {
        getSelectController: () => selectController,
        getComponentView   : () => componentView,
        getLabelElement    : () => /** @type { HTMLLabelElement } */ labelElement,
    };
};

/**
 * SelectComponentByTableValues maintains a {@link SelectController} and it creates the view.
 * It fills and filters the options columns by the given options table.
 * The min number of entries each row in the `optionsTable` has defines the number of columns.
 * The order of the row entries starts with the most general category going to the specific values.
 * A selection of a category leads to unselecting all sub categories and values
 * if they do not contain a table row with the selected category. 
 * This component supports up to 3 columns where the most left entry of each row contains the 
 * input values and the others contain categories to filter the values or subcategories.
 * If a value does not have any categories, the spots must be filled with null.
 * For a good performance the callback return array should not contain > 5_000 entries.
 * While the column values are loading a circular loader in the loading column is provided.
 *
 * The used projector supports browser with popover api and nested css support.
 * Browsers: Chrome ≥ 114, Firefox ≥ 125, Safari ≥ 17 (for lower versions an alert infobox appears)
 *
 * @param { SelectAttributes } selectAttributes
 * @param { OptionsTable }     optionsTable
 * @param { Boolean }          sortColumnOptionsAlphabetical
 * @returns { SelectComponentType }
 * @constructor
 * @example 
        const selectAttributes = { name: 'region', label: 'Region' };
        const component        = SelectComponentByTableValues(
            selectAttributes,
            [
                ["Switzerland", "Aargau"],
                ["Switzerland", "Basel-Landschaft"],
                ["Switzerland", "Basel-Stadt"],
                ["Switzerland", "Bern"],
                ["Switzerland", "Jura"],
                ["Switzerland", "Solothurn"],
                ["Switzerland", "Zürich"],
            ],
            true
        );
 */
const SelectComponentByTableValues = (
    selectAttributes,
    optionsTable,
    sortColumnOptionsAlphabetical = false
) => {
    /**
     * @param { Number } col
     * @returns { (...String) => Array<OptionDataType> } - callback to get option data
     */
    const getColumnOptions =
        (col) =>
        (...categories) => {
            const options = optionsTable
                .filter(
                    (optionRow) =>
                        (0 === categories.length ||
                         0 === col ||
                            categories.includes(optionRow[col - 1])
                        ) && null != optionRow[col]
                )
                .map((optionRow) => optionRow[col]);
            return sortColumnOptionsAlphabetical
                ? options.sort((a, b) => a.localeCompare(b))
                : options;
        };

    const callbacks = Array(Math.min(...optionsTable.map((optionsRow) => optionsRow.length)))
        .fill("a")
        .map((_, i) => getColumnOptions(i));
    const component = SelectComponentByCallbacks(selectAttributes, callbacks);

    return {
        ...component,
    };
};

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
