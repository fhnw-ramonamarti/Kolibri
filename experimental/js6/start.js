import { countryList } from "../countries.js";
// import { ChoiceInputController } from "./choiceInputController.js";
import { ChoiceDetailController, ChoiceMasterController } from "./choiceInputController.js";
import { projectChoiceInput } from "./choiceInputProjector.js";

const formHolder = document.querySelector(".countrySelectionView");
if (null != formHolder) {
    // there is no such element when called via test case
    const formStructureDetail = {
        value: "",
        placeholder: "Choose a country",
        label: "",
        name: "country",
    };
    const formStructureMaster = {
        valueList: countryList,
        sectionValue: { continent: "All" },
        focusObject: {},
    };
    const detailController = ChoiceDetailController(formStructureDetail);
    const masterController = ChoiceMasterController("continent", "country")(formStructureMaster);
    formHolder.append(...projectChoiceInput(detailController, masterController, "selectedCountry"));
}
