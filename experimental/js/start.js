import {} from "./choiceInputModel.js";
import {} from "./choiceInputController.js";
import {projectChoiceInput,addActions} from "./choiceInputProjector.js";

import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { TEXT } from "../../docs/src/kolibri/util/dom.js";

const formHolder = document.querySelector(".countrySelectionView");
if (null != formHolder) {
    // there is no such element when called via test case
    const formStructure = { value: "", name: "country", type: TEXT };
    const controller = SimpleInputController(formStructure);
    formHolder.append(...projectChoiceInput(800)(controller, "selectedCountry"));
}

addActions();