import {
    getCitiesByCountry,
    getContinents,
    getCountriesByContinent,
    getDecades,
    getYearsByDecade,
}                                   from "./DataService.js";
import { SelectComponent, pageCss } from "./selectComponent.js";

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

document.querySelector("head style").textContent += pageCss;
