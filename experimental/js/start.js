import {} from "./choiceInputModel.js";
import {} from "./choiceInputController.js";
import {projectChoiceInput,addActions} from "./choiceInputProjector.js";

import { SimpleInputController } from "../../docs/src/kolibri/projector/simpleForm/simpleInputController.js";
import { TEXT } from "../../docs/src/kolibri/util/dom.js";

const formHolder = document.querySelector(".countrySelectionView");
if (null != formHolder) {
    // there is no such element when called via test case
    const formStructure = { value: "", name: "country", type: TEXT, /* label: "Country" */ };
    const controller = SimpleInputController(formStructure);
    formHolder.append(...projectChoiceInput(800)(controller, "selectedCountry"));
}

addActions();


// controller für toggle, model hat state für open
// check selection close display after open dd
// possible split up -> split selection, textfeld detail, listen master

// controller / testen - neighbors
// anzeigerelevat in model -> controller ausführer, model infos -> webcl-w5
// @import url("../docs/css/kolibri-base.css");/*last kolibri import better*/
