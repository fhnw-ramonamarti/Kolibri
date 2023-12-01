import "../docs/css/kolibri-base.css";
import "../docs/css/kolibri-light-colors.css";
import "../docs/css/kolibri-light-fonts.css";

import "../experimental/css/kolibri-input-elements-dd.css";
import "../experimental/css/kolibri-input-elements-colours.css";

function runJS() {
    const mainElement = document.createElement('main');
    mainElement.innerHTML = `
        <div class="countrySelectionView">
            <!-- dd-HTML -->
            <div class="countrySelectionView">
        <div class="selectedCountryLine">
            <input class="selectedCountry" name="" placeholder="Choose country" readonly value="" />
            <!-- extract to files svg -->
            <div class="clear" id="clear">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5.00002L15.6452 15.6452M5 15.6452L15.6452 5" stroke="#A0A3BD" stroke-width="1.66667"
                          stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="icon close show">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 9.03658L11.9632 15.9998L18.9263 9.03658" stroke="#A0A3BD" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="icon open">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 16L11.9632 8.96317L18.9263 16" stroke="#A0A3BD" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
        </div>
        <div class="lists">
            <ul class="continentList list" id="continents"></ul>
            <div class="line"></div>
            <ul class="countryList list" id="countries"></ul>
        </div>
    </div>
        </div>
    `;
    document.body.appendChild(mainElement);
}

export { runJS };
