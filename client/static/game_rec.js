let gameIdToSearch = -1;
const getRecsBtn = document.querySelector('#recs-btn');
const dropInp = document.querySelector('.dropdown-input');
const dropList = document.querySelector('.dropdown-list');

const srchdGameCont = document.querySelector('.searched-game-cont');
const recDisp = document.querySelector('.display-sect');

const clearBtn = document.querySelector("#clear-btn");

getRecsBtn.disabled = true;
async function getCoreGameInfo() {
    try{
        const response = await fetch('/fetch-games-data');
        const responseData = await response.json();
        const gameData = responseData['popular_games_data'];
        // console.log(gameData);   
        return gameData;
    }
    catch(e) {
        console.log(e);
    }
}

let activeIndex = -1;

function getVisibleDropItems() {
    return Array.from(dropList.children).filter(el => el.style.display !== "none"); // visible only
}

function clearActiveDropSelected(items) {
    items.forEach(item => item.classList.remove("activeSelecedDropDownElem"));
}

function setActiveDropSelected(items, index) {
    clearActiveDropSelected(items);
    if (items[index]) {
        items[index].classList.add("activeSelecedDropDownElem");
        items[index].scrollIntoView({ block: "nearest" });
    }
}

async function prepSearchFunc(gameData) {
    clearBtn.style.visibility = 'hidden';
    clearBtn.onclick = function(){
        resetSearchInp();
    }

    // const gameNamesSet = new Set();
    const gameDataList = [];
    for(let k in gameData){
        gameDataList.push([String(gameData[k][1]).trim(), gameData[k][0], k]);
        // gameNamesSet.add(`${gameData[k][0]} | ${gameData[k][1]}`);
    }
    gameDataList.sort();
    // Populate initially
    gameDataList.forEach(item => {
        const divElem = document.createElement('div');
        const txtString = `${item[0]} | ${item[1]}`;
        divElem.className = 'dropdown-item';
        divElem.textContent = txtString;
        divElem.id = item[2];
        divElem.onclick = () => {
            gameIdToSearch = item[2];
            dropInp.value = txtString;
            dropList.style.display = 'none';
            clearBtn.style.visibility = 'visible';
            // getRecsBtn.innerText = 'Get Recommendations';
            getRecsBtn.style.boxShadow = '0 4px 8px rgb(185, 216, 185)';
            getRecsBtn.disabled = false;
        };
        dropList.appendChild(divElem);
    });


    // Open dropdown on click and turn editable
    dropInp.addEventListener('click', () => {
        dropList.style.display = 'block';
        dropInp.removeAttribute('readonly');
        dropInp.focus();
    });
    // let validElemsListToSelect = [];
    let focusOnInd = -1;
    // Filter as you type
    dropInp.addEventListener('input', () => {
        // validElemsListToSelect = [];
        focusOnInd = 0;
        const val = dropInp.value.toLowerCase();
        clearBtn.style.visibility = (val=='') ? 'hidden': 'visible';
        Array.from(dropList.children).forEach(elem => {
            elem.style.display = elem.textContent.toLowerCase().includes(val) ? "block" : "none";
            // validElemsListToSelect.push(elem);
        });
        // getRecsBtn.innerText = 'Select a game';
        getRecsBtn.style.boxShadow = '0 4px 8px rgb(231, 191, 191)';
        getRecsBtn.disabled = true;
    });

    dropInp.addEventListener('keydown', (e) => {
        // console.log(e);
        if(e.key !== "ArrowDown" && e.key !=="ArrowUp" && e.key !=="Enter"){
            activeIndex = -1;
            Array.from(dropList.children).forEach(elem => {
                if(elem.classList.contains('activeSelecedDropDownElem')){
                    elem.classList.remove('activeSelecedDropDownElem');
                }
            });
            return;
        }
        const items = getVisibleDropItems();
        if (!items.length) { return; }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            setActiveDropSelected(items, activeIndex);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex !== -1) ? (items.length - 1 + activeIndex) % items.length : items.length-1;
            setActiveDropSelected(items, activeIndex);
        }

        if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            items[activeIndex].click();
        }

        console.log(activeIndex, items.length);
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropList.style.display = 'none';
            dropInp.setAttribute('readonly', true);
        }
    });
}

async function getGameRecommendations(gameId) {
    console.log(gameId);
    let recommendationData = null;
    if(!isNaN(parseInt(gameId)) && (parseInt(gameId)!=-1)){
        try{
            const response = await fetch(`/get-recommendations/${gameId}`);
            recommendationData = await response.json();
            // console.log(recommendationData);
        }
        catch(e){
            console.log(e);
        }
    }
    else{
        console.log('NaN error');
    }
    return recommendationData;
}

function createEl(tag, className, text, attrs = {}) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    for (let key in attrs) {
        e.setAttribute(key, attrs[key]);
    }
    return e;
}

function createTagUnit(tagObj) {
    // tagObj[1] is the tag name
    let tagStr = tagObj[1].toString();
    tagStr = tagStr.slice(4).replaceAll('_', ' ');
    return createEl('div', 'tag-unit', tagStr);
}

function createMainGameSearchedForCard(gameObj) {
    const card = createEl('div', 'searched-for-disp', null, {id: `card-${gameObj['indexid']}`});
    const cardSide = createEl('div', 'card-main-side');
    const imgDiv = createEl('div', 'card-img-main');
    const img = createEl('img', 'game-img-main', null, {src: gameObj['thumbnail_img_url'], alt: `${gameObj['name']} image`})
    imgDiv.appendChild(img);
    cardSide.appendChild(imgDiv);
    card.appendChild(cardSide);
    
    const mainTextDiv = createEl('div', 'card-main-text-div');
    const nameDiv = createEl('div', 'card-name-title-div');
    nameDiv.title = 'Go to steam page';
    const gameLink = createEl('a', 'card-link-heading', null, 
        {href: `https://store.steampowered.com/app/${gameObj['appid']}/`, target: '_blank'});
    const h2 = createEl('h2', 'card-name', gameObj['name']);
    const span = createEl('span', '', gameObj['appid']);
    h2.appendChild(document.createElement('br'));
    h2.appendChild(span);
    gameLink.appendChild(h2);
    nameDiv.appendChild(gameLink);
    mainTextDiv.appendChild(nameDiv);
    
    const tagsDiv = createEl('div');
    tagsDiv.appendChild(createEl('h4', '', 'Tags:'));
    const tagsList = createEl('div', 'tags-list');
    gameObj['tags'].forEach(tag => tagsList.appendChild(createTagUnit(tag)));
    tagsDiv.appendChild(tagsList);
    
    mainTextDiv.appendChild(tagsDiv);
    card.appendChild(mainTextDiv);

    return card;
}

function createRecommendationGameCard(gameObj) {
    const card = createEl('div', 'game-disp-card', null, {id: `card-${gameObj['indexid']}`});

    // Top image
    const cardTop = createEl('div', 'card-top');
    const imgDiv = createEl('div', 'card-img');
    const img = createEl('img', 'game-img', null, {src: gameObj['thumbnail_img_url'], alt: `${gameObj['name']} image`});
    imgDiv.appendChild(img);
    cardTop.appendChild(imgDiv);
    card.appendChild(cardTop);

    // Name + link
    const nameDiv = createEl('div', 'card-name-title-div');
    nameDiv.title = 'Go to steam page';
    const gameLink = createEl('a', 'card-link-heading', null, 
        {href: `https://store.steampowered.com/app/${gameObj['appid']}/`, target: '_blank'});
    const h2 = createEl('h2', 'card-name', gameObj['name']);
    const span = createEl('span', '', gameObj['appid']);
    h2.appendChild(document.createElement('br'));
    h2.appendChild(span);
    gameLink.appendChild(h2);
    nameDiv.appendChild(gameLink);
    card.appendChild(nameDiv);

    // Tags
    const cardLower = createEl('div', 'card-lower');
    cardLower.appendChild(createEl('h4', '', 'Similar tags:'));
    const tagsList = createEl('div', 'tags-list');
    gameObj['tags'].forEach(tag => tagsList.appendChild(createTagUnit(tag)));
    cardLower.appendChild(tagsList);
    card.appendChild(cardLower);

    return card;
}

function fillRecommendationDisplay(gameData, recommendationData){
    if(!recommendationData['success']){
        // recDisp.innerText = 'Invalid';
        srchdGameCont.innerText = 'Invalid search query. Select a game from the list.';
        return;
    }

    Array.from(srchdGameCont.children).forEach((element)=>{
        element.remove();
    });

    Array.from(recDisp.children).forEach((element)=>{
        element.remove();
    });

    const recommendationList = recommendationData['game_recommendations'];
    console.log(recommendationList);

    for(let i=1; i<recommendationList.length; i++){
        const gameDetailsObj = recommendationList[i];
        recDisp.append(createRecommendationGameCard(gameDetailsObj));
    }

    srchdGameCont.append(createMainGameSearchedForCard(recommendationList[0]));
    // srchdGameCont.innerText = `Game recommendations for: ${recommendationList[0]['name']} | ${recommendationList[0]['appid']}`;
}

function resetSearchInp(){
    activeIndex = -1;
    dropInp.value = '';
    clearBtn.style.visibility = 'hidden';
    dropList.style.display = 'none'
    getRecsBtn.style.boxShadow = 'none';
    getRecsBtn.disabled = true;
    Array.from(dropList.children).forEach(elem => {
        elem.style.display = "block";
        if(elem.classList.contains('activeSelecedDropDownElem')){
            elem.classList.remove('activeSelecedDropDownElem');
        }
    });
    dropInp.click();
}

async function wrapperMain() {
    const gameData = await getCoreGameInfo();
    // console.log(gameDataList);

    await prepSearchFunc(gameData);

    getRecsBtn.addEventListener('click', async () =>{
        // console.log(gameIdToSearch);
        getRecsBtn.disabled = true;
        getRecsBtn.style.boxShadow = '0 4px 8px rgb(243, 223, 255)';
        const recommendationData = await getGameRecommendations(gameIdToSearch);
        fillRecommendationDisplay(gameData, recommendationData);
    });
}

wrapperMain();