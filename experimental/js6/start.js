import {countryList} from "../countries.js";

import {ChoiceDetailController, ChoiceMasterController} from "./choiceInputController.js";
import {projectChoiceInput} from "./choiceInputProjector.js";

const createDetailController = () => {
    const formStructureDetail = {
        value: "",
        placeholder: "Choose a country",
        label: "",
        name: "country",
    };
    return ChoiceDetailController(formStructureDetail);
};

const createMasterController = () => {
    const formStructureMaster = {
        elementList: countryList,
        sectionElement: {continent: "All"},
        focusObject: {},
    };
    return ChoiceMasterController("continent", "country")(formStructureMaster);
};

const createController = () => {
    return [createDetailController(), createMasterController()]
};

const formHolder = document.querySelector(".countrySelectionView");
if (null != formHolder) {
    // there is no such element when called via test case
    formHolder.append(...projectChoiceInput(...createController(), "selectedCountry"));
}
