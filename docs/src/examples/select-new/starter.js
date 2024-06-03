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
    numberOfColumns: 2,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
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
    numberOfColumns: 2,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
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
    numberOfColumns: 1,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb3 = [
    getContinents,
];
const selectComponent3 = SelectComponent(selectAttribute3, columnServiceCb3);
document.getElementById("componentContinent").append(...selectComponent3);

// ----- city selection 3 columns --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute4 = {
    name: "city",
    label: "Continent to City",
    numberOfColumns: 3,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb4 = [
    getCitiesByCountry,
    getCountriesByContinent,
    getContinents,
];
const selectComponent4 = SelectComponent(selectAttribute4, columnServiceCb4);
document.getElementById("componentCity3").append(...selectComponent4);


// ----- currency selection with images --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute5 = {
    name: "money",
    label: "Money Img",
    numberOfColumns: 2,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb5 = [
    getMoneyByContinent,
    getMoneyContinents,
];
const selectComponent5 = SelectComponent(selectAttribute5, columnServiceCb5);
document.getElementById("componentImg").append(...selectComponent5);

document.querySelector("head style").textContent += pageCss;
