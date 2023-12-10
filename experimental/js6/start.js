import { countryList } from "../countries.js";
// import { ChoiceInputController } from "./choiceInputController.js";
import { ChoiceDetailController, ChoiceMasterController } from "./choiceInputController.js";
import { projectChoiceInput } from "./choiceInputProjector.js";

const formHolder = document.querySelector(".countrySelectionView");
if (null != formHolder) {
    // there is no such element when called via test case
    const formStructure = { // todo
        valueList: countryList,
        sectionValue: { continent: "All" },
        focusObject: {},
        value: "",
        placeholder: "Choose Country",
        label: "",
        name: "country",
        colNames: ["continent", "name"],
    };
    const detailController = ChoiceDetailController(formStructure);
    const masterController = ChoiceMasterController("continent", "name")(formStructure);
    formHolder.append(...projectChoiceInput(detailController, masterController, "selectedCountry"));
}

// controller für toggle, model hat state für open
// check selection close display after open dd
// possible split up -> split selection, textfeld detail, listen master

// controller / testen - neighbors
// anzeigerelevat in model -> controller ausführer, model infos -> webcl-w5
// @import url("../docs/css/kolibri-base.css");/*last kolibri import better*/
