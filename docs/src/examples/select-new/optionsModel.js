import { Observable, ObservableList } from "../../kolibri/observable.js";

export {
    OptionsModel,
    SelectedOptionModel,
    CategoryOption,
    ValueOption,
    nullOption,
};


/**
 * Internal, mutable, singleton state to make option id unique.
 * @private
 */
let idCounter = 0;


/**
 * @typedef OptionType
 * @property { () => String } getValue                 - selectable value of the input
 * @property { () => String } getLabel                 - visible label of the input
 * @property { () => String } getId                    - unique identifier of the option 
 * @property { (other: OptionType) => Boolean } equals - true if label and value are the same
 */

/**
 * The id is only created in context with the `optionsModel`.
 * @private
 * @constructor
 * @param { String } value
 * @param { String } label
 * @returns { OptionType }
 */
const Option = (value, label) => {
    const equals = (other) => label === other?.getLabel() && value === other?.getValue();
    if (null == value) {
        const id = "OptionNull";
        return {
            getValue: () => "",
            getLabel: () => "",
            getId   : () => id,
            equals  : equals,
        }
    }
    let id = "";
    return {
        getValue: () => value,
        getLabel: () => label,
        getId   : () => id,
        createId: () => id === "" ? id = "OptionItem" + idCounter++ : {},
        equals  : equals,
    }
}


/**
 * @constructor
 * @param { String } value
 * @param { String } label - same as value if not defined
 * @returns { OptionType }
 * @example
        const model = ValueOption("pizza_fungi","Pizza Fungi");
 */
const ValueOption = (value, label = "") => {
    const optionLabel = !label || label === "" ? value : label
    return Option(value, optionLabel);
};

/**
 * @constructor
 * @param { String }  label 
 * @returns { OptionType }
 * @example
        const model = CategoryOption("Pizza");
 */
const CategoryOption = (label) => {
    return Option("", label);
};


/**
 * @typedef OptionsModelType
 * @property { () => Array<OptionType> }           getList    - copy of inner list with all options
 * @property { () => IObservableList<OptionType> } getObsList - observable list with all the options
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * It is also used for the {@link ColumnOptionsComponent}.
 * @constructor
 * @returns { OptionsModelType }
 * @example
        const model = OptionsModel();
 */
const OptionsModel = () => {
    const list    = [];
    const listObs = ObservableList(list);
    const allEverAddedOptions = []; // no options ever removed

    /**
     * `allEverAddedOptions`is used to preserve the id if the value-label pair was added erlier.
     * Only options with unique value-label pairs can be added.
     * @param { OptionType } option - option to add with created id
     */
    const addOption = (option) => {
        if (null == option) {
            return;
        }
        const filteredAllOptions = allEverAddedOptions.filter((o) => o.equals(option));
        if (filteredAllOptions.length === 0) {
            option.createId();
            listObs.add(option);
            allEverAddedOptions.push(option);
            return;
        }
        const filteredCurrentOptions = list.filter((o) => o.equals(option));
        if (filteredCurrentOptions.length === 0) {
            listObs.add(filteredAllOptions[0]);
        } 
    };

    return {
        getList                : () => [...list],
        getObsList             : () => ({ ...listObs, add: addOption, }),
    };
};


/**
 * @typedef SelectedOptionModelType
 * @property { ()  => OptionType }                             getSelectedOption
 * @property { (OptionType) => void }                          setSelectedOption
 * @property { ()  => void }                                   clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a selection of an option.
 * @constructor
 * @returns { SelectedOptionModelType }
 * @example
        const model = SelectedOptionModel();
 */
const SelectedOptionModel = () => {
    const selectedOption = Observable(reset());

    return {
        getSelectedOption  : selectedOption.getValue,
        setSelectedOption  : selectedOption.setValue,
        clearSelectedOption: () => selectedOption.setValue(reset()),
        onOptionSelected   : selectedOption.onChange
    };
};


/**
 * Creates a single empty option
 * @private
 * @returns { OptionType }
 */
const reset = () => {
    return Option(null, null);
};

/** @public @type { OptionType } */
const nullOption = reset();
