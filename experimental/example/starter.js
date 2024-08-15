import { SimpleFormController } from "../../docs/src/kolibri/projector/simpleForm/simpleFormController.js";
import { projectForm } from "../../docs/src/kolibri/projector/simpleForm/simpleFormProjector.js";
import { TEXT } from "../../docs/src/kolibri/util/dom.js";

import { countryList } from "../countries.js";

import { ChoiceDetailController, ChoiceMasterController } from "../js/choiceInputController.js";
import { projectChoiceInput } from "../js/choiceInputProjector.js";

export { start }; // exported for testing purposes

// prepare form controller with model for example view page
const createFormController = () => {
    const formStructure = [
        { value: "", label: "First name", name: "text", type: TEXT },
        { value: "", label: "Name", name: "text", type: TEXT },
    ];
    const controller = SimpleFormController(formStructure);
    return projectForm(controller);
};

// prepare detail controller with model for select header
const createDetailController = () => {
    const formStructureDetail = {
        value: "",
        placeholder: "Choose a country",
        label: "Country",
        name: "country",
    };
    return ChoiceDetailController(formStructureDetail);
};

// prepare master controller with model for select body
const createMasterController = () => {
    const formStructureMaster = {
        elementList: countryList,
        sectionElement: { continent: "All" },
        focusObject: {},
    };
    return ChoiceMasterController("continent", "country")(formStructureMaster);
};

// collect detail and master controller
const createControllers = () => {
    return [createDetailController(), createMasterController()];
};

// create view using both controller
const start = (classname) => {
    return projectChoiceInput(...createControllers(), classname)
};

// keep document-specific info out of the start function such that it is easier to test without
// side-effecting the execution environment
const formHolder = document.querySelector("#form-holder");
// there is no such element when called via test case
if (null != formHolder) {
    formHolder.append(...createFormController());
    formHolder.querySelector("fieldset").append(...start("selectedCountry"));
}
