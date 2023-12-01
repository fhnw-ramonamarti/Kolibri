

const ChoiceInputController = (model) => ({
    getContinent: () => continent,
    setContinent: (newVal) => (continent = newVal),
    setContinentToPrev: () => (continent = getNeighborPrevContinent(continent)),
    setContinentToNext: () => (continent = getNeighborNextContinent(continent)),

    getCountry: () => country,
    setCountry: (newVal) => (country = newVal),

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
    setFocusCountryToPrev: () => (currentFocus = getNeighborPrevCountry(currentFocus)),
    setFocusCountryToNext: () => (currentFocus = getNeighborNextCountry(currentFocus)),
    setFocusCountryFirst: () => (currentFocus = activeCountryList()[0]),

    toggleUpdateNeeded: (newVal) => (updateNeeded = newVal),
    getUpdateNeeded: () => updateNeeded,

    getDebouncingText: () => debounceText,
    setDebouncingText: (newVal) => (debounceText = newVal),
});
