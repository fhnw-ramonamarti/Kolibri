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

/**
 * big size demo data to test performance
 * @param  { ...String } elem - filter categories
 * @returns { Array<String> }
 */
const testData = (...elem) =>
    Array(10_000)
        .fill("a")
        .map((e, i) => e + i)
        .filter(e => elem.length === 0 || elem.includes(e));


// ----- continent selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute = {
    name: "continent",
    label: "Continent",
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb = [
    getContinents,
    // testData
];
const [selectComponent]  = SelectComponent(selectAttribute, columnServiceCb);
const componentContinent = document.getElementById("componentContinent");
componentContinent.append(selectComponent);

// ----- city selection form --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute1_2 = {
    name: "country",
    label: "Country*",
    isRequired: true,
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb1_2 = [
    getCountriesByContinent,
];
const [selectComponent1_2] = SelectComponent(selectAttribute1_2, columnServiceCb1_2);
const componentForm        = document.getElementById("formComponent");
componentForm.append(selectComponent1_2);

const submit     = document.createElement("button");
submit.innerHTML = "Submit";
componentForm.append(submit);

// ----- city selection form --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute1_3 = {
    name: "country",
    label: "Country",
    isDisabled: true,
};
const [selectComponent1_3] = SelectComponent(selectAttribute1_3, columnServiceCb1_2);
const disabledComponent    = document.getElementById("disabledComponent");
disabledComponent.append(selectComponent1_3);

// ----- city selection --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute2 = {
    name: "city",
    label: "City",
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
};
/**
 * @type { Array<(String) => Array<CallbackReturnType>> }
 */
const columnServiceCb3 = [
    getYearsByDecade, 
    getDecades
    // testData,
    // testData
];

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
