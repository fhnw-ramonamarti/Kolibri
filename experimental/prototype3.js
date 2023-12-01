const continentList2 = ["All", ...[...new Set(countryList.map((e) => e.continent))].sort()];

const container = document.querySelector(".countrySelectionView");
const countryField = document.querySelector(".countrySelectionView .selectedCountry");
const listsElem = document.querySelector(".lists");
const categoryListElem = document.getElementById("continents");
const elementsListElem = document.getElementById("countries");
const clearElem = document.getElementById("clear");
let focused = document.querySelector(".focused");

const timeContinent = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[0];
let currContinent = continentList.includes(timeContinent) ? timeContinent : "All";

const scrollCountry = (e) => {
    const curr =
        focused && focused.classList.contains("country")
            ? focused
            : document.querySelector(".country.select")
            ? document.querySelector(".country.select")
            : document.querySelector(".country");
    if (curr) {
        elementsListElem.scrollTo({ top: curr.offsetTop - 20 });
    }
};

const resetValue = () => {
    countryField.value = "";
    document.querySelector(".clear").classList.remove("show");
    elementsListElem.querySelector(".select").classList.remove("select");
};

const toggleSelect = (state = 0) => {
    if (state === 1) {
        countryField.classList.remove("open");
        listsElem.classList.remove("open");
        document.querySelector(".icon.open").classList.add("select");
        document.querySelector(".icon.close").classList.remove("select");
    } else if (state === 2) {
        countryField.classList.add("open");
        listsElem.classList.add("open");
        document.querySelector(".icon.open").classList.remove("select");
        document.querySelector(".icon.close").classList.add("select");
    } else {
        countryField.classList.toggle("open");
        listsElem.classList.toggle("open");
        document.querySelector(".icon.open").classList.toggle("select");
        document.querySelector(".icon.close").classList.toggle("select");
    }
    if (!listsElem.classList.contains("open")) {
        changeFocus(null);
        const temp = document.querySelector(".country.select");
        if(temp){
            temp.classList.remove("select");
        }
    }
    listsElem.style.height = categoryListElem.offsetHeight + 1 + "px";
};

const fillCountry = () => {
    elementsListElem.innerHTML = "";
    const cons = countryList.filter((e) => e.continent == currContinent || currContinent == "All");
    for (const country of cons) {
        let isCurrentCountry = countryField.value == country.name ? "select" : "";
        const shortContinent =
            currContinent == "All" ? `<div class="shortcut">${country.continent.substr(0, 2).toUpperCase()}</div>` : "";
        const countryElem = `<li class="element country ${isCurrentCountry}" onclick="changeValue(this)" onmouseover="changeFocus(this)">
                    <div>${country.name}</div>
                    ${shortContinent}
                </li>`;
        elementsListElem.innerHTML += countryElem;
    }
};

const changeFocus = (e) => {
    if (focus != null) {
        focused.classList.remove("focused");
    }
    if (e) {
        focused = e;
        focused.classList.add("focused");
    }
    let pseudoContient = document.querySelector(".select2");
    if (pseudoContient != null) {
        pseudoContient.classList.remove("select2");
    }
    if (currContinent == "All" && e.classList.contains("country")) {
        [...document.querySelectorAll(".continent")]
            .filter((c) => {
                let cou = e.querySelector("div").innerHTML;
                let con = countryList.filter((cy) => cy.name == cou).map((cy) => cy.continent)[0];
                let val = con ? con : "--";
                return c.querySelector("div").innerHTML == val;
            })
            .forEach((c) => c.classList.add("select2"));
    }
};

const changeValue = (e) => {
    document.querySelector(".clear").classList.add("show");
    countryField.value = e.querySelector("div").innerHTML;
    if (elementsListElem.querySelector(".select")) {
        elementsListElem.querySelector(".select").classList.remove("select");
    }
    e.classList.add("select");
    changeFocus(e);
    // toggleSelect(1);
};

const changeCategory = (e) => {
    currContinent = e.querySelector("div").innerHTML;
    if (categoryListElem.querySelector(".select")) {
        categoryListElem.querySelector(".select").classList.remove("select");
    }
    e.classList.add("select");
    fillCountry();
    scrollCountry();
    changeFocus(e);
};

clearElem.onclick = () => {
    resetValue();
};
countryField.onfocus = () => {
    if (categoryListElem.querySelector(".select")) {
        changeFocus(categoryListElem.querySelector(".select"));
    } else {
        changeFocus(document.querySelector(".continent"));
    }
};
document.querySelector(".selectedCountryLine input").onclick = () => {
    toggleSelect();
};
document.querySelector(".selectedCountryLine .icon.open").onclick = () => {
    toggleSelect();
};
document.querySelector(".selectedCountryLine .icon.close").onclick = () => {
    toggleSelect();
};
container.onfocus = () => countryField.focus();
countryField.onblur = () => {
    focused = document.querySelector(".select");
    focused.classList.remove("focused");
    //toggleSelect(1);
};
container.onclick = (e) => countryField.focus();
//countryField.onchange = () => {toggleSelect(2);};
//container.onmouseleave = () => changeFocus(null);
// countryField.onblur = () => toggleSelect(1);
countryField.onkeyup = (e) => {
    console.log(e.key, e.keyCode);
    focused = document.querySelector(".focused");
    if (e.key == "ArrowLeft" || e.keyCode == 37) {
        if (focused != null) {
            if (focused.classList.contains("country")) {
                focused.classList.remove("focused");
                if (categoryListElem.querySelector(".select")) {
                    focused = categoryListElem.querySelector(".select");
                } else {
                    focused = document.querySelector(".country");
                }
                changeFocus(focused);
                document.querySelector(".country.select").classList.remove("select");
            }
        }
    } else if (e.key == "ArrowUp" || e.keyCode == 38) {
        if (focused != null) {
            if (focused.previousSibling) {
                focused.classList.remove("focused");
                changeFocus(focused.previousSibling);
                focused = document.querySelector(".focused");
            }
            if (focused.classList.contains("country")) {
                const pH = focused.parentElement.offsetHeight;
                const h = (pH - focused.offsetHeight) / 2;
                elementsListElem.scrollTo({ top: focused.offsetTop - h });
                changeValue(focused);
            } else {
                changeCategory(focused);
            }
        }
    } else if (e.key == "ArrowRight" || e.keyCode == 39) {
        if (focused != null) {
            if (focused.classList.contains("continent")) {
                focused.classList.remove("focused");
                if (elementsListElem.querySelector(".select")) {
                    focused = elementsListElem.querySelector(".select");
                    elementsListElem.scrollTo({ top: focused.offsetTop - 20 });
                } else {
                    focused = document.querySelector(".country");
                    elementsListElem.scrollTo({ top: 0 });
                }
                changeFocus(focused);
                changeValue(focused);
            }
        }
    } else if (e.key == "ArrowDown" || e.keyCode == 40) {
        if (focused != null) {
            if (focused.nextSibling) {
                focused.classList.remove("focused");
                changeFocus(focused.nextSibling);
                focused = document.querySelector(".focused");
                if (focused.classList.contains("country")) {
                    const pH = focused.parentElement.offsetHeight;
                    const h = (pH - focused.offsetHeight) / 2;
                    elementsListElem.scrollTo({ top: focused.offsetTop - h });
                    changeValue(focused);
                } else {
                    changeCategory(focused);
                }
            }
        }
    } else if (e.key == "Enter" || e.keyCode == 13 || e.key == " " || e.keyCode == 32) {
        if (focused != null) {
            if (focused.classList.contains("country")) {
                if (elementsListElem.querySelector(".select")) {
                    elementsListElem.querySelector(".select").classList.remove("select");
                }
                focused.classList.add("select");
                countryField.value = focused.querySelector("div").innerHTML;
            } else if (focused.classList.contains("continent")) {
                currContinent = focused.querySelector("div").innerHTML;
                if (categoryListElem.querySelector(".select")) {
                    categoryListElem.querySelector(".select").classList.remove("select");
                }
                focused.classList.add("select");
                fillCountry();
                focused.classList.remove("focused");
                if (elementsListElem.querySelector(".select")) {
                    focused = elementsListElem.querySelector(".select");
                } else {
                    focused = document.querySelector(".country");
                }
                focused.classList.add("focused");
                scrollCountry(focused);
            }
        }
    } else if (e.key == "Tab" || e.keyCode == 9) {
        toggleSelect(2);
        // next field
    } else if (e.key == "Escape" || e.keyCode == 27) {
        toggleSelect(1);
    } else if (e.key == "BackSpace" || e.keyCode == 8) {
        resetValue();
    }
};

categoryListElem.innerHTML = "";
for (const continent of continentList) {
    const isCurrentContinent = currContinent === continent ? "select" : "";

    const continentElem = `<li class="element continent ${isCurrentContinent}" onmouseover="changeFocus(this)" onclick="changeCategory(this)">
                <div>${continent}</div>
                <div class="shortcut">${
                    countryList.filter((e) => e.continent === continent || continent === "All").length
                }</div>
            </li>`;
    categoryListElem.innerHTML += continentElem;
}
focused = document.querySelector(".select") ? document.querySelector(".select") : document.querySelector(".continent");

fillCountry();
