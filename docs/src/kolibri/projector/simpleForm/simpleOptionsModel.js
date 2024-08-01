import { ObservableList } from "../../observable.js";

export { OptionsModel }

/**
 * @typedef OptionType
 * @property { !String } value - selectable value of the input
 * @property { ?String } label - visible label of the input
 */

/**
 * @typedef OptionsModelType
 * @property { () => Array<OptionType>          } getList    - copy of inner list with all the options
 * @property { () => ObservableList<OptionType> } getObsList - observable list with all the options
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * For a single input, it does not need any parameters.
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
