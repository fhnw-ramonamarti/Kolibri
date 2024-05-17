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

// ----- decade selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute = {
    name: "year",
    label: "Year",
    numberColumns: 2,
};
/**
 * @type { Array<(String) => Array<String>> }
 */
const columnServiceCb = [getYearsByDecade, getDecades];

const selectComponent = SelectComponent(selectAttribute, columnServiceCb);
document.getElementById("componentYear").append(...selectComponent);

// ----- city selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute2 = {
    name: "city",
    label: "City",
    numberColumns: 2,
};
/**
 * @type { Array<(String) => Array<String>> }
 */
const columnServiceCb2 = [
    getCitiesByCountry,
    getCountriesByContinent,
    // getContinents,
];
const selectComponent2 = SelectComponent(selectAttribute2, columnServiceCb2);
document.getElementById("componentCountry").append(...selectComponent2);

// ----- continent selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute3 = {
    name: "continent",
    label: "Continent independent",
    numberColumns: 1,
};
/**
 * @type { Array<(String) => Array<String>> }
 */
const columnServiceCb3 = [
    getContinents,
];
const selectComponent3 = SelectComponent(selectAttribute3, columnServiceCb3);
document.getElementById("componentContinent").append(...selectComponent3);

// ----- currency selection with images --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute4 = {
    name: "money",
    label: "Money Img",
    numberColumns: 2,
};
/**
 * @type { Array<(String) => Array<String|{label: String, value: String}>> }
 */
const columnServiceCb4 = [
    getMoneyByContinent,
    getMoneyContinents,
];
const selectComponent4 = SelectComponent(selectAttribute4, columnServiceCb4);
document.getElementById("componentImg").append(...selectComponent4);

document.querySelector("head style").textContent += pageCss;
