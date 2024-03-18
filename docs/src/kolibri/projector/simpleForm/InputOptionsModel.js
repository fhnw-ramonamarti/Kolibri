import {ObservableList} from "../../observable";

export { InputOptionsModel }

/**
 * @typedef { object } OptionType
 * @property { !String } value - value of the list item
 * @property { ?String } label - visible label of the list item
 */

/**
 * @typedef { object } OptionAttributes
 * @property { Array<OptionType> } list - object list, can be []
 */

/**
 * @typedef { object } OptionAttributeType
 * @property { Array<OptionType>  } list - //todo add comment
 * @property { ObservableList<String> } obsList -
 */

/**
 * Create a presentation model for the purpose of being used to bind against a single HTML Input in
 * combinations with its pairing Label element.
 * For a single input, it only needs one attribute.
 * @constructor
 * @param  { OptionAttributes }
 * @return { OptionAttributeType }
 * @example
 *     const model = InputOptionsModel({
         list:  [],
     });
 */
const InputOptionsModel = ({list = []}) => {
   const listObs = ObservableList(list)
    const listObject = list

    return {
       list: listObject,
        obsList: listObs
    };
};
