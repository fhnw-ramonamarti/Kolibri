import { projectForm, FORM_CSS } from "../../kolibri/projector/simpleForm/simpleFormProjector.js";
import { SimpleFormController }  from "../../kolibri/projector/simpleForm/simpleFormController.js";
import { CHOICE, COMBOBOX }      from "../../kolibri/util/dom.js";

/**
 * @private
 */
const createData = () => {
    let decades = [{ value: "", label: `none` }];
    let years = [];
    for (let i = 1950; i < 2020; i++) {
        if (i % 10 === 0) {
            decades.push({ value: String(i / 10), label: `${i}s` });
        }
        years.push({ value: i });
    }
    return [decades, years];
};

const start = () => {
    /** @type { [Array<OptionType>, Array<OptionType>] } */
    const [decades, years] = createData();
    const formStructure = [
        { value: "", label: "Decade",        name: "decade", type: CHOICE,   list: decades },
        { value: "", label: "Year of Birth", name: "year",   type: COMBOBOX, list: years   },
    ];
    const controller = SimpleFormController(formStructure);
    const [decadeController, yearController] = controller;
    decadeController.onValueChanged((val) => {
        const options = years.filter((y) => val === Math.floor(y.value / 10) || val === "");
        yearController.getOptions().forEach((option) => {
            yearController.delOption(option);
        });
        options.forEach((option) => {
            yearController.addOption(option);
        });
    });
    return projectForm(controller);
};

// keep document-specific info out of the start function such that it is easier to test without
// side-effecting the execution environment
const formHolder = document.getElementById("form-holder-dependant");
if (null != formHolder) {
    // there is no such element when called via test case
    document.querySelector("head style").textContent += FORM_CSS;
    document.querySelector("head style").textContent += `
        #form-holder-dependant {
            margin-top: 20px;
        }
    `;
    formHolder.append(...start());
}
