let accountsCount = null;
let accountsPerPage = 3;
let pagesAmount = null;
let currentPageNumber = 0;


fillTable(currentPageNumber, accountsPerPage);
updatePlayersCount();
// setTimeout(()=>{createAccountPerPageDropdown()}, 0)
createAccountPerPageDropdown()


function fillTable(pageNumber, pageSize) {
    $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        console.log(players);

        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';

        players.forEach((player) => {
            htmlRows +=
                `<tr>
                    <td class="cell">${player.id}</td>
                    <td class="cell">${player.name}</td>
                    <td class="cell">${player.title}</td>
                    <td class="cell">${player.race}</td>
                    <td class="cell">${player.profession}</td>
                    <td class="cell">${player.level}</td>
                    <td class="cell">${player.birthday}</td>
                    <td class="cell">${player.banned}</td>
                    <td class="cell">
                        <button class="edit-button">
                            <img src="../img/edit.png" alt="edit">
                        </button>
                    </td>
                     <td class="cell">
                        <button class="delete-button">
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

