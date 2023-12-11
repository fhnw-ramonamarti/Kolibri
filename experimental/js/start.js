import { countryList } from "../countries.js";
import { ChoiceInputController } from "./choiceInputController.js";
import { projectChoiceInput } from "./choiceInputProjector.js";

const formHolder = document.querySelector(".countrySelectionView");
if (null != formHolder) {
    // there is no such element when called via test case
    const formStructure = {
        listObjects    : countryList,
        selcectedObject: { continent: "All" },
        focusedObject  : {},
        filledValue    : "",
        placeholder    : "Choose Country",
        label          : "",
        name           : "country",
        colNames       : ["continent", "country"],
    };
    const controller = ChoiceInputController(formStructure);
    formHolder.append(...projectChoiceInput(800)(controller, "selectedCountry"));
}

// controller für toggle, model hat state für open
// check selection close display after open dd
// possible split up -> split selection, textfeld detail, listen master

// controller / testen - neighbors
// anzeigerelevat in model -> controller ausführer, model infos -> webcl-w5
// @import url("../docs/css/kolibri-base.css");/*last kolibri import better*/
