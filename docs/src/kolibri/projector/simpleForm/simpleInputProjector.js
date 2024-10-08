/**
 * @module projector/simpleForm/simpleInputProjector
 *
 * Following the projector pattern, this module exports an implementation of the {@link IInputProjector}
 * interface with projection functions
 * that create respective views and bind underlying models.
 * Following classical MVC, the binding is available solely through a controller.
 *
 * Projectors are _compositional_. Projecting a form means projecting multiple inputs.
 *
 * Projectors are interchangeable. Any two projectors that export the same functions
 * can be used in place of each other. This can provide a totally different "look & feel"
 * to the application while all business logic and their test cases remain untouched.
 */

import { CHANGE, dom, INPUT, TIME, CHECKBOX, CHOICE, COMBOBOX } from "../../util/dom.js";
import { timeStringToMinutes, totalMinutesToTimeString }        from "../projectorUtils.js";

export { InputProjector }

/**
 * @private
 * Internal mutable singleton state to produce unique id values for the label-input pairs.
 * @type { Number }
 */
let counter = 0;

/** 
 * @private
 */
const createInputElements = (id, elementAsString) => {
    return dom(`
        <label for="${id}"></label>
        <span  data-id="${id}">
            ${elementAsString}
            <span aria-hidden="true"></span>
        </span>
    `);
};

/**
 * @private
 */
const createInputView = (id, inputController) => {
    // create view
    const elements = createInputElements(id, `
        <input type="${inputController.getType()}" id="${id}">
    `);
    /** @type {HTMLLabelElement} */ const labelElement = elements[0]; // only for the sake of type casting, otherwise...
    /** @type {HTMLSpanElement}  */ const spanElement  = elements[1]; // only for the sake of type casting, otherwise...
    /** @type {HTMLInputElement} */ const inputElement = spanElement.firstElementChild; // ... we would use array deconstruction
    
    return [elements, labelElement, inputElement];
};

/**
 * @private
 */
const createOptionElements = (options, optionContainer) => {
    options.forEach(option => {
        const optionElement             = document.createElement("option");
              optionElement.value       = option.value;
              optionElement.textContent = option.label ?? option.value;
        optionContainer.appendChild(optionElement);
    });
};

/** 
 * @private 
 */
const createChoiceView = (id, options) => {
    const elements = createInputElements(id, `
        <select id="${id}"></select>
    `);
    /** @type {HTMLLabelElement}  */ const labelElement  = elements[0]; // only for the sake of type casting, otherwise...
    /** @type {HTMLSpanElement}   */ const spanElement   = elements[1]; // only for the sake of type casting, otherwise...
    /** @type {HTMLSelectElement} */ const selectElement  = spanElement.firstElementChild; // ... we would use array deconstruction

    createOptionElements(options, selectElement);
    return [elements, labelElement, selectElement];
};

/**
 * @private 
 */
const createComboboxView = (id, options) => {
    const elements = createInputElements(id, `
        <input type="text" id="${id}" list="${id}-list" />
        <datalist id="${id}-list"></datalist>
    `);
    /** @type {HTMLLabelElement}    */ const labelElement  = elements[0]; // only for the sake of type casting, otherwise...
    /** @type {HTMLSpanElement}     */ const spanElement   = elements[1]; // only for the sake of type casting, otherwise...
    /** @type {HTMLInputElement}    */ const inputElement  = spanElement.firstElementChild; // ... we would use array deconstruction
    /** @type {HTMLDataListElement} */ const datalistElement = spanElement.children[1]; // ... we would use array deconstruction

    createOptionElements(options, datalistElement);
    return [elements, labelElement, inputElement, datalistElement];
};

/**
 * @private
 * "hh:mm" in the vies vs minutes since midnight in the model
 */
const bindTimeValue = (inputElement, eventType, inputController) => {
    inputElement.addEventListener(eventType, _ =>
        inputController.setValue(/** @type { * } */ timeStringToMinutes(inputElement.value))
    );
    inputController.onValueChanged(val => inputElement.value = totalMinutesToTimeString(/** @type { * } */ val));
};

/**
 * @private
 * "checked" attribute vs boolean in model
 */
const bindCheckboxValue = (inputElement, eventType, inputController) => {
    inputElement.addEventListener(eventType, _ => inputController.setValue(/** @type { * } */ inputElement.checked));
    inputController.onValueChanged(val => inputElement.checked = /** @type { * } */ val);
};

/**
 * @private
 */
const bindOptionValue = (viewElement, optionContainer, eventType, inputController) => {
    viewElement.addEventListener(eventType, (_) => inputController.setValue(/** @type { * } */ viewElement.value));
    inputController.onValueChanged((val) => (viewElement.value = /** @type { * } */ val));

    // redraw all options 
    inputController.onAddOption((option) => {
        if (document.getElementById(viewElement.id)) {
            const optionElement = document.createElement("option");
            optionElement.value = option.value;
            optionElement.textContent = option.label ?? option.value;
            optionContainer.appendChild(optionElement);
        }
    });
    inputController.onDelOption((option) => {
        if (document.getElementById(viewElement.id)) {
            const optionElement = optionContainer.querySelector(`[value="${option.value}"]`);
            if (optionElement) {
                optionContainer.removeChild(optionElement);
            }
        }
    });
};

/**
 * @private
 */
const bindChoiceValue = (selectElement, inputController) => {
    bindOptionValue(selectElement, selectElement, CHANGE, inputController);
};

/**
 * @private
 */
const bindComboboxValue = (inputElement, datalistElement, eventType, inputController) => {
    bindOptionValue(inputElement, datalistElement, eventType, inputController);
};

/**
 * @private
 */
const bindViewDebounceValue = (inputElement, eventType, inputController, timeout) => {
    let timeoutId; // maybe move down inside function
    inputElement.addEventListener(eventType, _event => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        timeoutId = setTimeout( _timestamp =>
           inputController.setValue(/** @type { * } */ inputElement.value),
           timeout
        );
    });
};

/**
 * @private
 */
const bindViewUnbouncedValue = (inputElement, eventType, inputController) => {
    inputElement.addEventListener(eventType, _ => inputController.setValue(/** @type { * } */ inputElement.value));
};

/**
 * @private
 */
const bindDataValue = (inputController, inputElement) => {
    inputController.onValueChanged(val => inputElement.value = /** @type { * } */ val);
};

/**
 * @private
 * Implementation for the exported projection functions. Configured via curried parameters.
 * @type { <_T_> (timeout: Number) => (eventType: EventTypeString) => InputProjectionType<_T_> }
 */
const projectInput = (timeout) => (eventType) =>
    (inputController, formCssClassName) => {
    if( ! inputController) {
        console.error("no inputController in input projector."); // be defensive
        return;
    }
    const id = formCssClassName + "-id-" + (counter++);
    const shallDebounce = () => timeout !== 0;

    let elements, labelElement, inputElement;

    // view and data binding can depend on the type
    switch (inputController.getType()) {
        case TIME:
            [elements, labelElement, inputElement] = createInputView(id, inputController);
            bindTimeValue(inputElement, eventType, inputController);
            break;
        case CHECKBOX:
            [elements, labelElement, inputElement] = createInputView(id, inputController);
            bindCheckboxValue(inputElement, eventType, inputController);
            break;
        case CHOICE:
            [elements, labelElement, inputElement] = createChoiceView(id, inputController.getOptions());
            bindChoiceValue(inputElement, inputController);
            break;
        case COMBOBOX:
            let datalistElement;
            [elements, labelElement, inputElement, datalistElement] = createComboboxView(id, inputController.getOptions());
            bindComboboxValue(inputElement, datalistElement, eventType, inputController);
            break;
        default:
            [elements, labelElement, inputElement] = createInputView(id, inputController);
            if(shallDebounce()) {
                bindViewDebounceValue(inputElement, eventType, inputController, timeout);
            } else {
                bindViewUnbouncedValue(inputElement, eventType, inputController);
            }
            bindDataValue(inputController, inputElement);
    }

    inputController.onLabelChanged (  label => {
        labelElement.textContent = /** @type {String} */ label;
        inputElement.setAttribute("title", label);
    });
    inputController.onNameChanged  (name  => inputElement.setAttribute("name", name || id));
    inputController.onValidChanged (valid => inputElement.setCustomValidity(valid ? "" : "invalid"));

    inputController.onEditableChanged(isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", "on"));

    return /** @type { [HTMLLabelElement, HTMLSpanElement] } */ elements; // todo: fix second element type
};

/**
 * @template _T_
 * @type { ChangeInputProjectionType<_T_> }
 * @example
 * const [labelElement, spanElement] = projectChangeInput(controller);
 */
const projectChangeInput = projectInput(0)(CHANGE);

/**
 * @template _T_
 * @type { InstantInputProjectionType<_T_> }
 * @example
 * const [labelElement, spanElement] = projectInstantInput(controller);
 */
const projectInstantInput = projectInput(0)(INPUT);

/**
 * @template _T_
 * @type { DebounceInputProjectionType<_T_> }
 * @example
 * // waits for a quiet time of 200 ms before updating
 * const [label, input] = projectDebounceInput(200)(controller, "Wyss");
 */
const projectDebounceInput = (quietTimeMs) => projectInput(quietTimeMs)(INPUT);

/**
 * Namespace object for the {@link IInputProjector} functions.
 * @type { IInputProjector }
 */
const InputProjector = {
    projectInstantInput,
    projectChangeInput,
    projectDebounceInput
};
