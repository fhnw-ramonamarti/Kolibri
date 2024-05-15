import { getDecades, getYearsByDecade } from "./DataService.js";
import { SelectComponent, pageCss }                      from "./selectComponent.js";

const selectAttribute = {
    name: "",
    label: "",
    numberColumns: 2
};
const columnServiceCb = [
    getYearsByDecade,
    getDecades,
];
const selectComponent = SelectComponent(selectAttribute, columnServiceCb);

document.querySelector("head style").textContent += pageCss;
