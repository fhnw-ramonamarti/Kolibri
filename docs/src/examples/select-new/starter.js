import { getDecades, getYearsByDecade } from "./DataService.js";
import { SelectComponent, pageCss }                      from "./selectComponent.js";

/**
 * @type { SelectAttribute }
 */
const selectAttribute = {
    name: "name",
    label: "Label",
    numberColumns: 2
};
/**
 * @type { Array<(String) => Array<String>> }
 */
const columnServiceCb = [
    getYearsByDecade,
    getDecades,
];

const selectComponent = SelectComponent(selectAttribute, columnServiceCb);
document.getElementById("component").append(...selectComponent);

document.querySelector("head style").textContent += pageCss;
