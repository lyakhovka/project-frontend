let accountsCount = null;
let accountsPerPage = 3;
let pagesAmount = null;
let currentPageNumber = 0;

const RACE_ARRAY= ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const PROFESSION_ARRAY = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const BANNED_ARRAY = ['true', 'false'];

setTimeout(() =>{initCreateForm()}, 1000);
fillTable(currentPageNumber, accountsPerPage);
updatePlayersCount();
setTimeout(()=>{createAccountPerPageDropdown()}, 1000)

function initCreateForm(){
    const $raceSelect = document.querySelector('[data-create-race]');
    const $professionSelect = document.querySelector('[data-create-profession]');

    $raceSelect.insertAdjacentHTML('afterbegin', createSelectOptions(RACE_ARRAY, RACE_ARRAY[0]))
    $professionSelect.insertAdjacentHTML('afterbegin', createSelectOptions(PROFESSION_ARRAY, PROFESSION_ARRAY[0]))
}

function fillTable(pageNumber, pageSize) {
    $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {

        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';

        players.forEach((player) => {
            htmlRows +=
                `<tr class="row" data-account-id="${player.id}">
                    <td class="cell">${player.id}</td>
                    <td class="cell" data-account-name>${player.name}</td>
                    <td class="cell" data-account-title>${player.title}</td>
                    <td class="cell" data-account-race>${player.race}</td>
                    <td class="cell" data-account-profession>${player.profession}</td>
                    <td class="cell" data-account-level>${player.level}</td>
                    <td class="cell" data-account-birthday>${new Date(player.birthday).toLocaleDateString('uk')}</td>
                    <td class="cell" data-account-banned>${player.banned}</td>
                    <td class="cell">
                        <button class="edit-button" value="${player.id}">
                            <img src="../img/edit.png" alt="edit">
                        </button>
                    </td>
                     <td class="cell">
                        <button class="delete-button" value="${player.id}">
                            <img src="../img/delete.png" alt="delete">
                        </button>
                    </td>
                </tr>`
        })

        const shownAccounts = $playersTableBody.children.length;

        if(shownAccounts !==0){
            Array.from($playersTableBody.children).forEach(row => row.remove())
        }

        $playersTableBody.insertAdjacentHTML("beforeend", htmlRows)

        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => button.addEventListener('click', removeAccountHandler))

        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => button.addEventListener('click', editAccountHandler))

    })
}

function updatePlayersCount() {
    $.get('/rest/players/count', (count) => {
       accountsCount = count;
       updatePaginationButtons();
    })

}

function updatePaginationButtons(){
        pagesAmount = accountsCount ? Math.ceil(accountsCount/accountsPerPage) : 0;
        const $buttonsContainer=document.querySelector('.pagination-buttons');
        const pagesButtonsCount = $buttonsContainer.children.length;
        let paginationButtonsHtml = '';

        for (let i=1; i<=pagesAmount; i++){
            paginationButtonsHtml +=`<button value="${i-1}">${i}</button>`
        }

        if(pagesButtonsCount !==0){
            Array.from($buttonsContainer.children).forEach(node => node.remove())
        }

        $buttonsContainer.insertAdjacentHTML("beforeend", paginationButtonsHtml);
        Array.from($buttonsContainer.children).forEach(button => button.addEventListener('click', onPageChange))
        setActivePageButton(currentPageNumber)
}

function createAccountPerPageDropdown(){
    const $dropDown = document.querySelector('.accounts-per-page')
    const options = createSelectOptions([3,5,10,20], 3)
    $dropDown.addEventListener('change', rowsPerPageChangeHandler)
    $dropDown.insertAdjacentHTML('afterbegin', options)
}

function createSelectOptions(optionsArray, defaultValue){
    let optionHtml = '';

    optionsArray.forEach(option => optionHtml +=
        `<option ${defaultValue === option && 'selected'} value="${option}">
        ${option}</option>`
    )

    return optionHtml;
}

function rowsPerPageChangeHandler(e){
    accountsPerPage = e.currentTarget.value
    currentPageNumber=0;
    fillTable(currentPageNumber, accountsPerPage);
    updatePaginationButtons()
}

function onPageChange(e){
   currentPageNumber =  e.currentTarget.value;

    fillTable(currentPageNumber, accountsPerPage)
    setActivePageButton(currentPageNumber)
}

function setActivePageButton(activePageButtonIndex=0){
    const $buttonsContainer = document.querySelector('.pagination-buttons');
    const $activeButton = Array.from($buttonsContainer.children)[activePageButtonIndex];

    Array.from($buttonsContainer.children).forEach(button =>button.classList.remove('active-pagination-button'));

    $activeButton.classList.add('active-pagination-button');
}

function createAccount(){
   const data = {
       name: $('[data-create-name]').val(),
       title: $('[data-create-title]').val(),
       race: $('[data-create-race]').val(),
       profession: $('[data-create-profession]').val(),
       level: $('[data-create-level]').val(),
       birthday: new Date($('[data-create-birthday]').val()).getTime(),
       banned: $('[data-create-banned]').val() === 'on',
   }


    $.ajax({
       url: `/rest/players`,
       type: 'POST',
       data: JSON.stringify(data),
       dataType: "json",
       contentType: "application/json",
       success: function(){
           updatePlayersCount();
           fillTable(currentPageNumber, accountsPerPage);
       }
   })
}

function removeAccountHandler(e){
    const accountID = e.currentTarget.value;
    console.log('remove' + accountID)
    $.ajax({
        url: `/rest/players/${accountID}`,
        type: 'DELETE',
        contentType: "application/json",
        success: function (){
             updatePlayersCount();
            fillTable(currentPageNumber, accountsPerPage);
        }
    })
}

function updateAccount({accountId, data}){
    $.ajax({
        url: `/rest/players/${accountId}`,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        success: function (){
            fillTable(currentPageNumber, accountsPerPage);
        }
    })
}

function editAccountHandler(e){
    const accountId = e.currentTarget.value;

    const $currentRow = document.querySelector(`.row[data-account-id="${accountId}"]`);
    const $currentRemoveButton = $currentRow.querySelector('.delete-button');

    const $currentImage = $currentRow.querySelector('.edit-button img');


    const $currentName = $currentRow.querySelector('[data-account-name]')
    const $currentTitle = $currentRow.querySelector('[data-account-title]')
    const $currentRace = $currentRow.querySelector('[data-account-race]')
    const $currentProfession = $currentRow.querySelector('[data-account-profession]')
    const $currentBanned =  $currentRow.querySelector('[data-account-banned]')

    $currentImage.src = "../img/save.png";

    $currentImage.addEventListener('click', () => {
        const params = {
            accountId : accountId,
            data: {
                name: $currentName.childNodes[0].getAttribute('data-value'),
                title: $currentTitle.childNodes[0].getAttribute('data-value'),
                race: $currentRace.childNodes[0].getAttribute('data-value'),
                profession: $currentProfession.childNodes[0].getAttribute('data-value'),
                banned: $currentBanned.childNodes[0].getAttribute('data-value'),
            }
        }
        updateAccount(params)
    })
    $currentRemoveButton.classList.add('hidden');

    $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML))
    $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML))
    $currentRace.childNodes[0].replaceWith(createSelect(RACE_ARRAY, $currentRace.innerHTML))
    $currentProfession.childNodes[0].replaceWith(createSelect(PROFESSION_ARRAY, $currentProfession.innerHTML))
    $currentBanned.childNodes[0].replaceWith(createSelect(BANNED_ARRAY, $currentBanned.innerHTML))
}

function createInput(value){
    const $htmlInputElement = document.createElement('input');

    $htmlInputElement.setAttribute('type', 'text');
    $htmlInputElement.setAttribute('value', value);
    $htmlInputElement.setAttribute('data-value', value);

    $htmlInputElement.addEventListener('input', e =>{
        $htmlInputElement.setAttribute('data-value', `${e.currentTarget.value}`)
    })
    return $htmlInputElement;
}

function createSelect(optionsArray, defaultValue){
    const $options = createSelectOptions(optionsArray, defaultValue);
    const $selectElement = document.createElement('select');

    $selectElement.insertAdjacentHTML('afterbegin', $options);

    $selectElement.setAttribute('data-value', defaultValue);

    $selectElement.addEventListener('change', e =>{
        $selectElement.setAttribute('data-value', e.currentTarget.value)
    })
    return $selectElement
}