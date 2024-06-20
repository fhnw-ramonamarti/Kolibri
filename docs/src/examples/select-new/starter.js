import {
    getCitiesByCountry,
    getContinents,
    getCountriesByContinent,
    getDecades,
    getMoneyByContinent,
    getMoneyContinents,
    getYearsByDecade,
}                                   from "./DataService.js";
import { SelectComponent, pageCss } from "./selectComponent.js";

document.querySelector("head style").textContent += pageCss;

// ----- continent selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute = {
    name: "continent",
    label: "Continent independent",
    numberOfColumns: 1,
    sortOptionsAlphabetically: false,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb = [
    getContinents,
];
const [selectComponent]  = SelectComponent(selectAttribute, columnServiceCb);
const componentContinent = document.getElementById("componentContinent");
componentContinent.append(selectComponent);

// ----- city selection form --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute1_2 = {
    name: "city",
    label: "City*",
    isRequired: true,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb1_2 = [
    getCitiesByCountry,
];
const [selectComponent1_2] = SelectComponent(selectAttribute1_2, columnServiceCb1_2);
const componentForm        = document.getElementById("formComponent");
componentForm.append(selectComponent1_2);

const submit     = document.createElement("button");
submit.innerHTML = "Submit";
componentForm.append(submit);

// ----- city selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute2 = {
    name: "city",
    label: "City",
    numberOfColumns: 2,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb2 = [
    getCitiesByCountry,
    getCountriesByContinent,
];
const [selectComponent2] = SelectComponent(selectAttribute2, columnServiceCb2);
const componentCountry   = document.getElementById("componentCountry");
componentCountry.append(selectComponent2);

// ----- decade selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute3 = {
    name: "year",
    label: "Year",
    numberOfColumns: 2,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb3 = [getYearsByDecade, getDecades];

const [selectComponent3] = SelectComponent(selectAttribute3, columnServiceCb3);
const componentYear      = document.getElementById("componentYear");
componentYear.append(selectComponent3);

// ----- currency selection with images --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute4 = {
    name: "money",
    label: "Money Img",
    numberOfColumns: 2,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb4 = [
    getMoneyByContinent,
    getMoneyContinents,
];
const [selectComponent4] = SelectComponent(selectAttribute4, columnServiceCb4);
const componentImg       = document.getElementById("componentImg");
componentImg.append(selectComponent4);

// ----- city selection 3 columns --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute5 = {
    name: "city",
    label: "City",
    numberOfColumns: 3,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb5 = [
    getCitiesByCountry,
    getCountriesByContinent,
    getContinents,
];
const [selectComponent5] = SelectComponent(selectAttribute5, columnServiceCb5);
const componentCity      = document.getElementById("componentCity");
componentCity.append(selectComponent5);
