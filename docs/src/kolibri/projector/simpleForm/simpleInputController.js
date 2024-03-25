import { SimpleInputModel }                          from "./simpleInputModel.js";
import { OptionsModel }                              from "./optionsModel.js";
import { EDITABLE, LABEL, NAME, TYPE, VALID, VALUE } from "../../presentationModel.js";
import { CHOICE, COMBOBOX }                          from "../../util/dom.js";

export { SimpleInputController, SimpleAttributeInputController };

/**
 * @typedef { object } SimpleInputControllerType
 * @template _T_
 * @property { ()  => _T_ }                 getValue
 * @property { (_T_) => void }              setValue
 * @property { ()  => String}               getType
 * @property { (valid: !Boolean) => void }  setValid
 * @property { (converter: Converter<_T_>)        => void } setConverter
 * @property { (cb: ValueChangeCallback<String>)  => void } onLabelChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onValidChanged
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onValueChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onNameChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onEditableChanged
 */

/** 
* @typedef { object } OptionsControllerType
* @property { () => Array<OptionType> }      getOptions
* @property { (option: OptionType) => void } addOption
* @property { (option: OptionType) => void } delOption
* @property { (cb: OptionAddCallback<OptionType>) => void } onAddOption
* @property { (cb: OptionAddCallback<OptionType>) => void } onDelOption
*/

/**
 * @typedef { SimpleInputControllerType<String> & OptionsControllerType } SimpleInputWithOptionsControllerType
 */

/**
 * The SimpleInputController gives access to a {@link SimpleInputModel} but in a limited fashion.
 * It does not expose the underlying {@link Attribute} but only those functions that a user of this
 * controller needs to see.
 * While controllers might contain business logic, this basic controller does not contain any.
 * @constructor
 * @template _T_
 * @param  { OptionAttributes } args
 * @return { SimpleInputControllerType<_T_> | SimpleInputWithOptionsControllerType }
 * @example
 *     const controller = SimpleInputController({
         value:  "Dierk",
         label:  "First Name",
         name:   "firstname",
         type:   "text",
     });
 */
const SimpleInputController = (args) => SimpleAttributeInputController(SimpleInputModel(args));

const SimpleAttributeInputController = (inputAttribute) => {
    if (   CHOICE   === inputAttribute.getObs(TYPE).getValue() 
        || COMBOBOX === inputAttribute.getObs(TYPE).getValue()) {
        const optionsModel = OptionsModel();
        return {
            setValue:          inputAttribute.setConvertedValue,
            getValue:          inputAttribute.getObs(VALUE).getValue,
            setValid:          inputAttribute.getObs(VALID).setValue,
            getType:           inputAttribute.getObs(TYPE).getValue,
            onValueChanged:    inputAttribute.getObs(VALUE).onChange,
            onValidChanged:    inputAttribute.getObs(VALID).onChange,
            onLabelChanged:    inputAttribute.getObs(LABEL).onChange,
            onNameChanged:     inputAttribute.getObs(NAME).onChange,
            onEditableChanged: inputAttribute.getObs(EDITABLE).onChange,
            setConverter:      inputAttribute.setConverter,
            
            getOptions:        optionsModel.getList,
            addOption:         optionsModel.getObsList().add,
            delOption:         optionsModel.getObsList().del,
            onAddOption:       optionsModel.getObsList().onAdd,
            onDelOption:       optionsModel.getObsList().onDel,
            //setOptions:        (v) => optionsModel.getObsList(), // todo do we need this
        };
    }
    return {
        setValue:          inputAttribute.setConvertedValue,
        getValue:          inputAttribute.getObs(VALUE).getValue,
        setValid:          inputAttribute.getObs(VALID).setValue,
        getType:           inputAttribute.getObs(TYPE).getValue,
        onValueChanged:    inputAttribute.getObs(VALUE).onChange,
        onValidChanged:    inputAttribute.getObs(VALID).onChange,
        onLabelChanged:    inputAttribute.getObs(LABEL).onChange,
        onNameChanged:     inputAttribute.getObs(NAME).onChange,
        onEditableChanged: inputAttribute.getObs(EDITABLE).onChange,
        setConverter:      inputAttribute.setConverter,
    };
};
