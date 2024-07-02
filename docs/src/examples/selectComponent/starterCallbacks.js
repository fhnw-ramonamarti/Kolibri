import {
    getCitiesByCountry,
    getContinents,
    getCountriesByContinent,
    getDecades,
    getMoneyByContinent,
    getMoneyContinents,
    getYearsByDecade,
}                                              from "./DataService.js";
import {
    SelectComponentByCallbacks,
    pageCss,
} from "../../kolibri/projector/selectComponent/selectComponent.js";

document.querySelector("head style").textContent += pageCss;

document.addEventListener("DOMContentLoaded", () => {
    console.log("finished loading page");
});


// ----- continent selection --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute = {
    name: "continent",
    label: "Continent",
};
/**
 * @type { Array<CallbackType> }
 */
const columnServiceCb = [
    getContinents,
];
const selectComponent = SelectComponentByCallbacks(
    selectAttribute,
    columnServiceCb
).getComponentView();
const componentContinent = document.getElementById("componentContinent");
componentContinent.append(selectComponent);

// ----- city selection form --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute1_2 = {
    name: "country",
    label: "Country*",
    isRequired: true,
};
/**
 * @type { Array<CallbackType> }
 */
const columnServiceCb1_2 = [
    getCountriesByContinent,
];
const selectComponent1_2 = SelectComponentByCallbacks(
    selectAttribute1_2,
    columnServiceCb1_2
).getComponentView();
const componentForm      = document.getElementById("formComponent");
componentForm.append(selectComponent1_2);

const submit     = document.createElement("button");
submit.innerText = "Submit";
componentForm.append(submit);

// ----- city selection form --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute1_3 = {
    name: "country",
    label: "Country",
    isDisabled: true,
};
const selectComponent1_3 = SelectComponentByCallbacks(
    selectAttribute1_3,
    columnServiceCb1_2
).getComponentView();
const disabledComponent  = document.getElementById("disabledComponent");
disabledComponent.append(selectComponent1_3);

// ----- city selection --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute2 = {
    name: "city",
    label: "City",
};
/**
 * @type { Array<CallbackType> }
 */
const columnServiceCb2 = [
    getCountriesByContinent,
    getCitiesByCountry,
];
const selectComponent2 = SelectComponentByCallbacks(
    selectAttribute2,
    columnServiceCb2
).getComponentView();
const componentCountry = document.getElementById("componentCountry");
componentCountry.append(selectComponent2);

// ----- decade selection --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute3 = {
    name: "year",
    label: "Year",
};
/**
 * @type { Array<CallbackType> }
 */
const columnServiceCb3 = [
    getDecades,
    getYearsByDecade,
    // testData,
    // testData
];

const selectComponent3 = SelectComponentByCallbacks(
    selectAttribute3,
    columnServiceCb3
).getComponentView();
const componentYear    = document.getElementById("componentYear");
componentYear.append(selectComponent3);

// ----- currency selection with images --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute4 = {
    name: "money",
    label: "Money Img",
};
/**
 * @type { Array<CallbackType> }
 */
const columnServiceCb4 = [
    getMoneyContinents,
    getMoneyByContinent,
];
const selectComponent4 = SelectComponentByCallbacks(
    selectAttribute4,
    columnServiceCb4
).getComponentView();
const componentImg     = document.getElementById("componentImg");
componentImg.append(selectComponent4);

// ----- city selection 3 columns --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute5 = {
    name: "city",
    label: "City",
};
/**
 * @type { Array<CallbackType> }
 */
const columnServiceCb5 = [
    getContinents,
    getCountriesByContinent,
    getCitiesByCountry,
];
const selectComponent5 = SelectComponentByCallbacks(
    selectAttribute5,
    columnServiceCb5
).getComponentView();
const componentCity    = document.getElementById("componentCity");
componentCity.append(selectComponent5);
