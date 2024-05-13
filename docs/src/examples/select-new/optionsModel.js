import { Observable, ObservableList } from "../../kolibri/observable.js";

export {
    OptionsModel,
    SelectedOptionModel,
    CategoryOption,
    ValueOption,
    reset,
};

/**
 * @typedef OptionType
 * @property { () => String } getValue  - selectable value of the input
 * @property { () => String } getLabel  - visible label of the input
 * @property { () => String } getId     - unique identifier of the option 
 */


/**
 * Internal, mutable, singleton state to make Option id unique.
 * @private
 */
let idCounter = 0;

/**
 * @private
 * @constructor
 * @param { String }  value 
 * @param { ?String } label
 * @returns { OptionType }
 */
const Option = (value, label) => {
    if(null == value){
        const id = "Option.none";
        return {
            getValue: () => "",
            getLabel: () => "",
            getId   : () => id,
        }
    } else {
        const id = "Option.value" + idCounter++;
        return {
            getValue: () => value,
            getLabel: () => label,
            getId   : () => id,
        }
    }
}


/**
 * @constructor
 * @param { String }  value 
 * @param { ?String } label - same as value if not defined
 * @returns { OptionType }
 * @example
 *      const model = ValueOption("pizza_fungi","Pizza Fungi");
 */
const ValueOption = (value, label) => {
    return Option(value, !label || label === "" ? value : label);
};

/**
 * @constructor
 * @param { String }  label 
 * @returns { OptionType }
 * @example
 *      const model = CategoryOption("pizza");
 */
const CategoryOption = (label) => {
    return Option("", label);
};


/**
 * @typedef OptionsModelType
 * @property { () => Array<OptionType> }           getList    - copy of inner list with all the options
 * @property { () => IObservableList<OptionType> } getObsList - observable list with all the options
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * It is also used for the selection component // todo name here
 * @constructor
 * @return { OptionsModelType }
 * @example
 *      const model = OptionsModel();
 */
const OptionsModel = () => {
    const list = [];
    const listObs = ObservableList(list);

    return {
        getList :   () => [...list],
        getObsList: () => listObs,
    };
};


/**
 * Creates a single empty option
 * @returns { OptionType }
 */
const reset = () => {
    return Option();
};


/**
 * @typedef SelectedOptionModelType
 * @property { ()  => OptionType }              getSelectedOption
 * @property { (OptionType) => void }           setSelectedOption
 * @property { ()  => void }                    clearSelectedOption
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionSelected
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a selection of an option.
 * @constructor
 * @return { SelectedOptionModelType }
 * @example
 *      const model = SelectedOptionModel();
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
