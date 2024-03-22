import { SimpleInputModel }                          from "./simpleInputModel.js";
import { InputOptionsModel }                         from "./inputOptionsModel.js";
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
 * @typedef { object } SimpleInputWithOptionsControllerType
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
 * These properties are used for the selection elements
 * @property { () => Array<OptionType> }      getOptions
 * @property { (option: OptionType) => void } addOption
 * @property { (option: OptionType) => void } delOption
 * @property { (cb: OptionAddCallback<OptionType>) => void } onAddOption
 * @property { (cb: OptionAddCallback<OptionType>) => void } onDelOption
 */

/**
 * The SimpleInputController gives access to a {@link SimpleInputModel} but in a limited fashion.
 * It does not expose the underlying {@link Attribute} but only those functions that a user of this
 * controller needs to see.
 * While controllers might contain business logic, this basic controller does not contain any.
 * @constructor
 * @template _T_
 * @param  { OptionAttributes } args
 * @return { SimpleInputControllerType<_T_> | SimpleInputWithOptionsControllerType<String> }
 * @example
 *     const controller = SimpleInputController({
         value:  "Dierk",
         label:  "First Name",
         name:   "firstname",
         type:   "text",
     });
 */
const SimpleInputController = (args) => SimpleAttributeInputController(SimpleInputModel(args), InputOptionsModel(args));

const SimpleAttributeInputController = (inputAttribute, optionAttribute) => {
    if (CHOICE === inputAttribute.getObs(TYPE).getValue() || COMBOBOX === inputAttribute.getObs(TYPE).getValue()) {
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
            getOptions:        () => [...optionAttribute.list],
            addOption:         optionAttribute.obsList.add,
            delOption:         optionAttribute.obsList.del,
            onAddOption:       optionAttribute.obsList.onAdd,
            onDelOption:       optionAttribute.obsList.onDel,
            //setOptions:        (v) => optionAttribute.obsList, // todo do we need this
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
