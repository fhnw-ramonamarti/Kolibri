import { SimpleFormController } from "../../docs/src/kolibri/projector/simpleForm/simpleFormController.js";
import { projectForm } from "../../docs/src/kolibri/projector/simpleForm/simpleFormProjector.js";
import { TEXT } from "../../docs/src/kolibri/util/dom.js";

import { countryList } from "../countries.js";

import { ChoiceDetailController, ChoiceMasterController } from "../js/choiceInputController.js";
import { projectChoiceInput } from "../js/choiceInputProjector.js";

export { start };

const createFormController = () => {
    const formStructure = [
        { value: "Max", label: "Prename", name: "text", type: TEXT },
        { value: "Müller", label: "Name", name: "text", type: TEXT },
    ];
    const controller = SimpleFormController(formStructure);
    return projectForm(controller);
};

const createDetailController = () => {
    const formStructureDetail = {
        value: "",
        placeholder: "Choose a country",
        label: "Country",
        name: "country",
    };
    return ChoiceDetailController(formStructureDetail);
};

const createMasterController = () => {
    const formStructureMaster = {
        elementList: countryList,
        sectionElement: { continent: "All" },
        focusObject: {},
    };
    return ChoiceMasterController("continent", "country")(formStructureMaster);
};

const createController = () => {
    return [createDetailController(), createMasterController()];
};

const start = (classname) => {
    return projectChoiceInput(...createController(), classname)
};

const formHolder = document.querySelector("#form-holder");
if (null != formHolder) {
    // there is no such element when called via test case
    formHolder.append(...createFormController());
    formHolder.querySelector("fieldset").append(...start("selectedCountry"));
}
