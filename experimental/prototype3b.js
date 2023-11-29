// import { countryList } from "./countries.js";

const continentList = ["All", ...[...new Set(countryList.map((e) => e.continent))].sort()];

const OPEN = 0,
    CLOSE = 1,
    TOGGLE = 2;

const SelectObject = () => {
    let continent = "All";
    let country = countryList[0].name;
    let currentFocus = country; // todo over think this
    let updateNeeded = true;

    return {
        getCurrentFocus: () => currentFocus,
        setCurrentFocus: (newVal) => (currentFocus = newVal), // todo change side
        toggleUpdateNeeded: (newVal) => (updateNeeded = newVal),
        getUpdateNeeded: () => updateNeeded,

        getContinent: () => continent,
        setContinent: (newVal) => (continent = newVal),
        setContinentToPrev: () => (continent = getNeighborPrevContintent(continent)),
        setContinentToNext: () => (continent = getNeighborNextContintent(continent)),

        getCountry: () => country,
        setCountry: (newVal) => (country = newVal),

        setFocusCountryToPrev: () => (currentFocus = getNeighborPrevCountry(currentFocus)),
        setFocusCountryToNext: () => (currentFocus = getNeighborNextCountry(currentFocus)),
        setFocusCountryFirst: () => (currentFocus = activeCountryList()[0]),
    };
};

const selectObject = SelectObject();

const getNeighborPrevContintent = (currentElem) => {
    return getNeighborPrev(currentElem, continentList);
};

const getNeighborNextContintent = (currentElem) => {
    return getNeighborNext(currentElem, continentList);
};

const getNeighborPrevCountry = (currentElem) => {
    return getNeighborPrev(currentElem, activeCountryList());
};

const getNeighborNextCountry = (currentElem) => {
    return getNeighborNext(currentElem, activeCountryList());
};

const getNeighborPrev = (currentElem, list) => {
    return getNeighbor(currentElem, list, (x) => x - 1);
};

const getNeighborNext = (currentElem, list) => {
    return getNeighbor(currentElem, list, (x) => x + 1);
};

const getNeighbor = (currentElem, list, operation) => {
    let currentIndex = list.findIndex((e) => e === currentElem);
    return list[operation(currentIndex)] ?? currentElem;
};

const activeCountryList = () =>
    countryList.filter((e) => [e.continent, "All"].includes(selectObject.getContinent())).map((e) => e.name);

const displayColumn = (list, name, currentValue) => {
    for (let i = 0; i < list.length; i++) {
        let element = document.getElementById(name + "-" + i);
        element.setAttribute("CLASS", "entry " + name);
    }
    const currentIndex = list.findIndex((e) => e === currentValue);
    if (currentIndex >= 0) {
        const currentColValue = document.getElementById(name + "-" + currentIndex);
        currentColValue.classList.add("selected");
    }
};

const displayContinents = () => {
    displayColumn(continentList, "continent", selectObject.getContinent());
};

const displayCountries = () => {
    if (selectObject.getUpdateNeeded()) {
        buildCountries();
        selectObject.toggleUpdateNeeded(false);
    }
    displayColumn(activeCountryList(), "country", selectObject.getCountry());
};

const buildCountries = () => {
    let countriesContainer = document.querySelector("#countries");
    countriesContainer.innerHTML = "";
    for (let i = 0; i < activeCountryList().length; i++) {
        let element = document.createElement("LI");
        element.setAttribute("ID", "country-" + i);
        element.setAttribute("CLASS", "entry country");
        element.innerHTML = activeCountryList()[i];
        element.onclick = (e) => {
            changeCountry(e.target.innerHTML);
        };
        element.onmouseover = (e) => {
            changeFocus(e.target.innerHTML);
        };
        countriesContainer.appendChild(element);
    }
};

const displayCurrentPosition = () => {
    const currentContinentIndex = continentList.findIndex((e) => e === selectObject.getCurrentFocus());
    if (currentContinentIndex >= 0) {
        const currentFocus = document.getElementById("continent-" + currentContinentIndex);
        currentFocus.classList.add("focused");
    }
    const currentCountryIndex = activeCountryList().findIndex((e) => e === selectObject.getCurrentFocus());
    if (currentCountryIndex >= 0) {
        const currentFocus = document.getElementById("country-" + currentCountryIndex);
        currentFocus.classList.add("focused");
    }
};

const display = () => {
    displayContinents();
    displayCountries();
    displayCurrentPosition();
};

const toggleSelect = (state = TOGGLE) => {
    const countryField = document.querySelector(".countrySelectionView .selectedCountry");
    const listsElem = document.querySelector(".lists");

    if (state === OPEN) {
        countryField.classList.add("open");
        listsElem.classList.add("open");

        // todo in style
        const continentsContainer = document.querySelector("#continents");
        document.querySelector(".icon.open").classList.add("show");
        document.querySelector(".icon.close").classList.remove("show");
        listsElem.style.height =
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";
        displayCurrentPosition();
        return;
    }
    if (state === CLOSE) {
        countryField.classList.remove("open");
        listsElem.classList.remove("open");
        document.querySelector(".icon.open").classList.remove("show");
        document.querySelector(".icon.close").classList.add("show");
        return;
    }
    if (state === TOGGLE) {
        countryField.classList.toggle("open");
        listsElem.classList.toggle("open");

        document.querySelector(".icon.open").classList.toggle("show");
        document.querySelector(".icon.close").classList.toggle("show");

        // todo in style
        const continentsContainer = document.querySelector("#continents");
        listsElem.style.height =
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";
        displayCurrentPosition();
        return;
    }
};

const changeContinent = (e) => {
    if (e) {
        changeFocus(e);
        selectObject.setContinent(e);
    }
    selectObject.toggleUpdateNeeded(true);
    display();
    scrollCountry();
};

const changeCountry = (e) => {
    if (e) {
        changeFocus(e);
        selectObject.setCountry(e);
    }
    updateFieldValue();
    display();
};

const changeFocus = (e) => {
    selectObject.setCurrentFocus(e);
    display();
};

const updateFieldValue = () => {
    const countryField = document.querySelector(".countrySelectionView .selectedCountry");
    countryField.value = selectObject.getCountry();
    if (selectObject.getCountry() === "") {
        document.querySelector(".clear").classList.remove("show");
    } else {
        document.querySelector(".clear").classList.add("show");
    }
};

const resetValue = () => {
    selectObject.setCountry("");
    updateFieldValue();
    display();
};

const scrollCountry = () => {
    const currentCountry =
        document.querySelector(".country.focused") ??
        document.querySelector(".country.selected") ??
        document.querySelector(".country");
    if (currentCountry) {
        const countriesContainer = document.querySelector("#countries");
        countriesContainer.scrollTo({ top: currentCountry.offsetTop - 20 });
    }
};

document.querySelector("body").onload = () => {
    const continentsContainer = document.querySelector("#continents");
    for (let i = 0; i < continentList.length; i++) {
        let element = document.createElement("LI");
        element.setAttribute("ID", "continent-" + i);
        element.setAttribute("CLASS", "entry continent");
        element.onclick = (e) => {
            changeContinent(e.target.innerHTML);
        };
        element.onmouseover = (e) => {
            changeFocus(e.target.innerHTML);
        };
        element.innerHTML = continentList[i];
        continentsContainer.appendChild(element);
    }

    display();
};

// todo fix bug mouse open
document.querySelector(".countrySelectionView").onclick = () => {
    document.querySelector(".selectedCountryLine input").focus();
    // toggleSelect();
};

document.querySelector(".selectedCountryLine input").onfocus = () => {
    display();
    toggleSelect(OPEN);
};

document.querySelector(".selectedCountryLine input").onblur = () => {
    // toggleSelect(CLOSE); // todo
};

document.querySelector(".selectedCountryLine input").onclick = () => {
    toggleSelect();
};

document.querySelector(".selectedCountryLine .open").onclick =
    document.querySelector(".selectedCountryLine input").onclick;

document.querySelector(".selectedCountryLine .close").onclick =
    document.querySelector(".selectedCountryLine input").onclick;

document.getElementById("clear").onclick = () => {
    resetValue();
};

document.querySelector(".countrySelectionView .selectedCountry").onkeydown = (e) => {
    console.log(e.key, e.keyCode);

    switch (e.keyCode) {
        case 37: // ArrowLeft
            if (!document.querySelector(".lists.open")) {
                break;
            }
            changeFocus(selectObject.getContinent());
            scrollCountry();
            break;
        case 38: // ArrowUp
            if (!document.querySelector(".lists.open")) {
                break;
            }
            if (continentList.includes(selectObject.getCurrentFocus())) {
                selectObject.setContinentToPrev();
                changeContinent();
                changeFocus(selectObject.getContinent());
            }
            if (activeCountryList().includes(selectObject.getCurrentFocus())) {
                selectObject.setFocusCountryToPrev();
                changeCountry();
            }
            scrollCountry();
            break;
        case 39: // ArrowRight
            if (!document.querySelector(".lists.open")) {
                break;
            }
            if (!activeCountryList().includes(selectObject.getCountry())) {
                selectObject.setFocusCountryFirst();
            } else {
                selectObject.setCurrentFocus(selectObject.getCountry());
            }
            changeFocus(selectObject.getCurrentFocus());
            scrollCountry();
            break;
        case 40: // ArrowDown
            if (!document.querySelector(".lists.open")) {
                toggleSelect(OPEN);
                break;
            }
            if (continentList.includes(selectObject.getCurrentFocus())) {
                selectObject.setContinentToNext();
                changeContinent();
                changeFocus(selectObject.getContinent());
            }
            if (activeCountryList().includes(selectObject.getCurrentFocus())) {
                selectObject.setFocusCountryToNext();
                changeCountry();
            }
            scrollCountry();
            break;
        case 13: // Enter
        case 32: // " " - Space
            if (!document.querySelector(".lists.open")) {
                toggleSelect(OPEN);
                break;
            }
            if (continentList.includes(selectObject.getCurrentFocus())) {
                selectObject.setFocusCountryFirst();
                changeFocus();
            }
            if (activeCountryList().includes(selectObject.getCurrentFocus())) {
                changeCountry(selectObject.getCurrentFocus());
            }
            break;
        case 27: // Escape
            toggleSelect(CLOSE);
            break;
        case 8: // BackSpace
            resetValue();
            break;
        case 9: // Tab
            toggleSelect(CLOSE);
            break;
        default:
            // nothing
            break;
    }
};

// todo problem antarctica
