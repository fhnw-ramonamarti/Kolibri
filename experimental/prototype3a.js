const continentList = ["All", ...[...new Set(countryList.map((e) => e.continent))].sort()];

const activeCountryList = () =>
    countryList.filter((e) => [e.continent, "All"].includes(selectObject.getContinent())).map((e) => e.name);

const NUMB_COLUMN = 2;

const OPEN   = 0,
      CLOSE  = 1,
      TOGGLE = 2;

const DEFAULT_CONTINENT = "All",
      DEFAULT_COUNTRY   = countryList[0].name;

const SelectObject = () => {
    let continent     = DEFAULT_CONTINENT;
    let country       = DEFAULT_COUNTRY;
    let currentColumn = 1;
    let currentFocus  = country;
    let updateNeeded  = true;

    return {
        getContinent      : () => continent,
        setContinent      : (newVal) => (continent = newVal),
        setContinentToPrev: () => (continent = getNeighborPrevContinent(continent)),
        setContinentToNext: () => (continent = getNeighborNextContinent(continent)),

        getCountry      : () => country,
        setCountry      : (newVal) => (country = newVal),
        setCountryToPrev: () => (country = getNeighborPrevCountry(country)),
        setCountryToNext: () => (country = getNeighborNextCountry(country)),
        setCountryFirst : () => (country = activeCountryList()[0]),

        getCurrentColumn: () => currentColumn,
        setCurrentColumn: (newVal) => (currentColumn = newVal),
        decCurrentColumn: () => {
            if (currentColumn > 0) currentColumn--;
        },
        incCurrentColumn: () => {
            if (currentColumn < NUMB_COLUMN - 1) currentColumn++;
        },

        getCurrentFocus: () => currentFocus,
        setCurrentFocus: (newVal) => (currentFocus = newVal),

        toggleUpdateNeeded: (newVal) => (updateNeeded = newVal),
        getUpdateNeeded   : () => updateNeeded,
    };
};

const selectObject = SelectObject();

const getNeighborPrevContinent = (currentElem) => {
    return getNeighborPrev(currentElem, continentList);
};

const getNeighborNextContinent = (currentElem) => {
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

const displayConcreteField = (list, name, currentValue, className) => {
    const currentIndex = list.findIndex((e) => e === currentValue);
    if (currentIndex >= 0) {
        const currentColValue = document.getElementById(name + "-" + currentIndex);
        currentColValue.classList.add(className);
    }
};

const displayColumn = (list, name, currentValue) => {
    for (let i = 0; i < list.length; i++) {
        let element = document.getElementById(name + "-" + i);
        element.setAttribute("CLASS", "entry " + name);
    }
    displayConcreteField(list, name, currentValue, "selected");
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

const displayCurrentPosition = () => {
    if (selectObject.getCurrentColumn() === 0) {
        displayConcreteField(continentList, "continent", selectObject.getCurrentFocus(), "focused");
    }
    if (selectObject.getCurrentColumn() === 1) {
        displayConcreteField(activeCountryList(), "country", selectObject.getCurrentFocus(), "focused");
    }
};

const display = () => {
    displayContinents();
    displayCountries();
    displayCurrentPosition();
};

const buildColumn = (containerId, list, name, onClick, onHover) => {
    const columnContainer           = document.querySelector("#" + containerId);
          columnContainer.innerHTML = "";
    for (let i = 0; i < list.length; i++) {
        let element = document.createElement("LI");
        element.setAttribute("ID", name + "-" + i);
        element.setAttribute("CLASS", "entry " + name);
        element.onclick = (e) => {
            onClick(e);
        };
        element.onmouseover = (e) => {
            onHover(e);
        };
        element.innerHTML = list[i];
        columnContainer.appendChild(element);
    }
};

const buildContinents = () => {
    buildColumn(
        "continents",
        continentList,
        "continent",
        (e) => {
            selectObject.setContinent(e.target.innerHTML);
            changeContinent();
        },
        (e) => {
            selectObject.setCurrentColumn(0);
            changeFocus(e.target.innerHTML);
        }
    );
};

const buildCountries = () => {
    buildColumn(
        "countries",
        activeCountryList(),
        "country",
        (e) => {
            selectObject.setCountry(e.target.innerHTML);
            changeFocus(e.target.innerHTML);
            changeCountry();
        },
        (e) => {
            selectObject.setCurrentColumn(1);
            changeFocus(e.target.innerHTML);
        }
    );
};

const toggleSelect = (state = TOGGLE) => {
    const countryField   = document.querySelector(".countrySelectionView .selectedCountry").classList;
    const listsContainer = document.querySelector(".lists");
    const iconOpen       = document.querySelector(".icon.open").classList;
    const iconClose      = document.querySelector(".icon.close").classList;

    if (state === OPEN) {
        countryField.add("open");
        listsContainer.classList.add("open");

        iconOpen.add("show");
        iconClose.remove("show");

          // todo in style
        const continentsContainer         = document.querySelector("#continents");
              listsContainer.style.height = 
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";

        displayCurrentPosition();
        return;
    }
    if (state === CLOSE) {
        countryField.remove("open");
        listsContainer.classList.remove("open");

        iconOpen.remove("show");
        iconClose.add("show");
        return;
    }
    if (state === TOGGLE) {
        countryField.toggle("open");
        listsContainer.classList.toggle("open");

        iconOpen.toggle("show");
        iconClose.toggle("show");

          // todo in style
        const continentsContainer         = document.querySelector("#continents");
              listsContainer.style.height = 
            continentsContainer.childElementCount * continentsContainer.firstChild.offsetHeight + 1 + "px";

        displayCurrentPosition();
    }
};

const changeContinent = () => {
    if (!activeCountryList().includes(selectObject.getCountry())) {
        selectObject.setCountryFirst();
    }
    selectObject.setCurrentFocus(selectObject.getContinent());
    selectObject.toggleUpdateNeeded(true);
    selectObject.setCurrentColumn(0);
    updateFieldValue();
    display();
    scrollCountry();
};

const changeCountry = () => {
    selectObject.setCurrentFocus(selectObject.getCountry());
    selectObject.setCurrentColumn(1);
    updateFieldValue();
    display();
};

const changeFocus = (e) => {
    selectObject.setCurrentFocus(e);
    display();
};

const updateFieldValue = () => {
    const countryField       = document.querySelector(".countrySelectionView .selectedCountry");
          countryField.value = selectObject.getCountry();
    if (selectObject.getCountry() === "") {
        document.querySelector(".clear").classList.remove("show");
    } else {
        document.querySelector(".clear").classList.add("show");
    }
};

const resetValue = () => {
    selectObject.setCountry("");
    selectObject.decCurrentColumn();
    selectObject.setCurrentFocus(selectObject.getContinent());
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
        const height             = countriesContainer.offsetHeight / 2 - currentCountry.offsetHeight / 2;
        countriesContainer.scrollTo({top: currentCountry.offsetTop - height});
    }
};

document.querySelector("body").onload = () => {
    buildContinents();
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

document.querySelector(".selectedCountryLine input").onclick = toggleSelect;

document.querySelector(".selectedCountryLine .open").onclick = () => toggleSelect(OPEN);

document.querySelector(".selectedCountryLine .close").onclick = () => toggleSelect(CLOSE);

document.getElementById("clear").onclick = resetValue;

document.querySelector(".countrySelectionView .selectedCountry").onkeydown = (e) => {
    console.log(e.key, e.keyCode);

    switch (e.keyCode) {
        case 37:   // ArrowLeft
            if (!document.querySelector(".lists.open")) {
                break;
            }
            selectObject.decCurrentColumn();
            changeFocus(selectObject.getContinent());
            break;
        case 38:   // ArrowUp
            if (!document.querySelector(".lists.open")) {
                break;
            }
            if (selectObject.getCurrentColumn() === 0) {
                selectObject.setContinentToPrev();
                changeContinent();
            }
            if (selectObject.getCurrentColumn() === 1) {
                selectObject.setCountryToPrev();
                changeCountry();
            }
            scrollCountry();
            break;
        case 39:   // ArrowRight
            if (!document.querySelector(".lists.open")) {
                break;
            }
            if (!activeCountryList().includes(selectObject.getCountry())) {
                selectObject.setCountryFirst();
            }
            selectObject.incCurrentColumn();
            changeFocus(selectObject.getCountry());
            scrollCountry();
            break;
        case 40:   // ArrowDown
            if (!document.querySelector(".lists.open")) {
                toggleSelect(OPEN);
                break;
            }
            if (selectObject.getCurrentColumn() === 0) {
                selectObject.setContinentToNext();
                changeContinent();
            }
            if (selectObject.getCurrentColumn() === 1) {
                selectObject.setCountryToNext();
                changeCountry();
            }
            scrollCountry();
            break;
        case 13:   // Enter
        case 32:   // " " - Space
            if (!document.querySelector(".lists.open")) {
                toggleSelect(OPEN);
                break;
            }
            if (selectObject.getCurrentColumn() === 0) {
                selectObject.setCountryFirst();
                changeFocus(selectObject.getCountry());
            }
            selectObject.incCurrentColumn();
            changeCountry();
            display();
            break;
        case 27:   // Escape
            toggleSelect(CLOSE);
            break;
        case 8:   // BackSpace
            resetValue();
            break;
        case 9:   // Tab
            toggleSelect(CLOSE);
            break;
        default: 
              // nothing
            break;
    }
};
