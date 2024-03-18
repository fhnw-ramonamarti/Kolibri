import { ObservableList } from "../../observable.js";

export { InputOptionsModel }

/**
 * @typedef { object } OptionType
 * @property { !String } value - value of the list item
 * @property { ?String } label - visible label of the list item
 */

/**
 * @typedef { object } OptionAttributes
 * @property { Array<OptionType> } list - list of all possible options
 */

/**
 * @typedef { object } OptionAttributeType
 * @property { Array<OptionType>      } list    - static list with all the option type values
 * @property { ObservableList<String> } obsList - observable list with all the values
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * For a single input, it only needs one option attribute type.
 * @constructor
 * @param  { OptionAttributes }
 * @return { OptionAttributeType }
 * @example
 *      const model = InputOptionsModel({
            list: [],
        });
 */
const InputOptionsModel = ({ list = [] }) => {
    const listObs = ObservableList(list);
    const listObject = list;

    return {
        list: listObject,
        obsList: listObs,
    };
};
