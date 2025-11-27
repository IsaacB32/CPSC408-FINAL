async function runQuery(action, data = {}) {
    const response = await fetch("server.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data })
    });
    const dbData = await response.json();
    return dbData;
}

async function createPlayerCards() {

    const dbData = await runQuery("getPlayers");
    const data = dbData.map(player => {
        return {
            playerName: player.name,
            wins: player.wins,
            totalGames: player.totalGamesPlayed,
            percent: (player.wins/player.totalGamesPlayed) * 100,
            imagesrc: `media/${player.name.toLowerCase()}.png`
        };
    });

    const stats = [
            { title: "TOTAL WINS", key: "wins"},
            { title: "GAMES PLAYED", key: "totalGames"},
            { title: "WIN PERCENTAGE", key: "percent"}
        ];

    const tableBody = document.querySelector("#dynamic-player-list");
    tableBody.innerHTML = "";

    data.forEach(rowData => {
        const list = document.createElement("li");
        const card = document.createElement("div");
        card.classList.add("person-card");

        const img = document.createElement("img");
        //https://www.geeksforgeeks.org/javascript/how-to-check-mentioned-file-exists-or-not-using-javascript-jquery/
        var http = new XMLHttpRequest();
        http.open('HEAD', rowData.imagesrc, false);
        http.send();
        if (http.status === 200) {
            img.src = rowData.imagesrc;
        } else {
            img.src = "media/default_player.png";
        }
        //--
        card.appendChild(img);

        const list_container = document.createElement("div");
        list_container.classList.add("list");

        const stats_title = document.createElement("h3");
        stats_title.textContent = `${rowData.playerName}`;
        list_container.appendChild(stats_title);
        
        const stats_list = document.createElement("ul");
        stats.forEach(stat => {
            const s = document.createElement("li");
            let value = rowData[stat.key];
            if (stat.key === "percent") value = value.toFixed(1) + "%";
            s.textContent = `${stat.title}: ${value}`;
            stats_list.appendChild(s);
        });

        list_container.appendChild(stats_list);
        card.appendChild(list_container);
        list.appendChild(card);
        tableBody.appendChild(list);
    });
}

async function createPlayerButtons(tradeAfter = true) {

    const dbData = await runQuery("getPlayers");
    const data = dbData.map(player => {
        return {
            playerName: player.name,
            playerID: player.playerID,
            color: playerColor(player.name)
        };
    });

    const trade_dbData = await runQuery("getTradeCounts");

    const tableBody = document.querySelectorAll("#dynamic-player-buttons");
    tableBody.forEach(body => {
        // body.innerHTML = "";

        data.forEach(rowData => {
            const player_button = document.createElement("button");
            player_button.classList.add("player-button")
            player_button.id = `${rowData.playerID}`;

            if (body.classList.contains("trade-player-button")) player_button.classList.add("trade-selected")
            else if (body.classList.contains("alter-player-button")) player_button.classList.add("alter-player");
            else if (body.classList.contains("delete-player-button")) player_button.classList.add("delete-player");
            else player_button.classList.add("query-player");

            player_button.addEventListener('mouseover', function () {
                player_button.style.backgroundColor = `${rowData.color}`;
            });
            player_button.addEventListener('mouseleave', function () {
                player_button.style.backgroundColor = '';
            });
            player_button.addEventListener('click', function () {
                if (body.classList.contains("trade-player-button")) {
                    player_button.classList.toggle("trade-selected");
                    tradeInfo();
                }
                else if (player_button.classList.contains("alter-player")) {
                    displayPlayer(player_button.id);
                    filterClickedVar(player_button, "alter-player");
                }
                else if (player_button.classList.contains("delete-player")) {
                    deletePlayer(player_button.id);
                }
                else {
                    queryPlayer(trade_dbData.find((element) => element.playerID == rowData.playerID));
                    filterClickedVar(player_button, "query-player")
                }
            });

            const label = document.createElement("p");
            label.textContent = `${rowData.playerName}`;

            player_button.appendChild(label);
            body.appendChild(player_button);
        });
    });

    if (tradeAfter) tradeInfo();
}

function queryPlayer(data) {
    const tableBody = document.querySelector("#dynamic-player-info")
    tableBody.innerHTML = "";

    if (data) {
        const label_name = document.createElement("p");
        label_name.textContent = `PLAYER NAME: ${data.name}`;
        tableBody.appendChild(label_name);

        const label_total_trades = document.createElement("p");
        label_total_trades.textContent = `TOTAL TRADES: ${data.totalTrades}`;
        tableBody.appendChild(label_total_trades);
    }
    else {
        console.log("no data");
    }
}

function playerColor(name) {
    switch(name.toLowerCase()) {
        case "isaac":
            return "var(--isaac-color)";
        case "jake":
            return "var(--jake-color)";
        case "seth":
            return "var(--seth-color)";
        case "blaise":
            return "var(--blaise-color)";
        case "michael":
            return "var(--michael-color)";
        case "faith":
            return "var(--faith-color)";
        default:
            return "var(--default-button-color)";
    }
}

async function createGameButtons() {
    const tableBody = document.querySelector("#dynamic-game-buttons");
    tableBody.innerHTML = "";

    const dbData = await runQuery("getGamesCard");

    dbData.forEach(rowData => {
        const game_button = document.createElement("a");
        game_button.classList.add("game-button");
        game_button.href = `gameview.html?gameID=${rowData.gameID}`;

        const game_name = document.createElement("p");
        game_name.textContent = `GAME: ${rowData.gameID}`;
        game_button.appendChild(game_name);

        const image_div = document.createElement("div");
        const game_image = document.createElement("img");
        game_image.src = "media/catan-board.png";
        image_div.appendChild(game_image);
        game_button.appendChild(image_div);

        const game_winner = document.createElement("p");
        game_winner.textContent = `WINNER: ${rowData.winner}`;
        game_button.appendChild(game_winner);

        tableBody.appendChild(game_button);
    });
}

async function tradeInfo() {
    const selection = document.getElementsByClassName("trade-selected");
    if (selection) {
        var ids = [];
        for (let item of selection) {
            ids.push(item.id);
        }
        if(ids.length == 1) {
            const total = document.getElementById("totaltrades");
            total.innerHTML = `TOTAL TRADES MADE: 0`;

            const tableBody = document.querySelector("#dynamic-trade-all");
            tableBody.innerHTML = "";
            return;
        }

        const data = await runQuery("getAllTrades", { ids: ids });

        const total = document.getElementById("totaltrades");
        total.innerHTML = `TOTAL TRADES MADE: ${data.length}`;

        const tableBody = document.querySelector("#dynamic-trade-all");
        tableBody.innerHTML = "";
        data.forEach(rowData => {
            const container = document.createElement("div");
            container.classList.add("horizontal-text", "trade");
            
            const p1 = document.createElement("p");
            p1.textContent = `${rowData.Player1}`;
            container.appendChild(p1);

            const g1 = document.createElement("p");
            g1.textContent = "Gave";
            container.appendChild(g1);

            const r1 = document.createElement("p");
            r1.textContent = `${rowData.Gave1}`;
            container.appendChild(r1);

            const a = document.createElement("a");
            a.textContent = "AND";
            container.appendChild(a);

            const p2 = document.createElement("p");
            p2.textContent = `${rowData.Player2}`;
            container.appendChild(p2);

            const g2 = document.createElement("p");
            g2.textContent = "Gave";
            container.appendChild(g2);

            const r2 = document.createElement("p");
            r2.textContent = `${rowData.Gave2}`;
            container.appendChild(r2);

            tableBody.appendChild(container);
        });
    }
}

async function createGameView(gameID) {
    const dbData = await runQuery("getBoard", {gameID: gameID});
    var size;
    if (dbData.length > 20) size = [4,5,6,5,4];
    else size = [3,4,5,4,3];

    drawBoard(dbData, size);
}

function drawBoard(data, rowSize) {
    const tableBody = document.querySelector("#dynamic-board");
    tableBody.innerHTML = "";

    var row = [];
    var sizeIndex = 0;
    data.forEach(rowData => {
        const hex = document.createElement("div");
        hex.classList.add("hex", `${rowData.resource.toLowerCase()}`);

        if (rowData.number != null) {
            const token = document.createElement("div");
            token.classList.add("token");
            token.textContent = `${rowData.number}`;
            hex.appendChild(token);
        }

        row.push(hex);

        if (row.length == rowSize[sizeIndex]) {
            const hexRow = document.createElement("div");
            hexRow.classList.add("hex-row");

            row.forEach(r => {
                hexRow.appendChild(r);
            });
            tableBody.appendChild(hexRow);

            row = [];
            sizeIndex++;
        }
    });
}

function filterClicked(clicked) {
    const buttons = document.getElementsByClassName("trade-filter");
    for (let f of buttons) {
        f.classList.remove("trade-selected");
    }
    clicked.classList.add("trade-selected");
    tradeInfo();
}

function filterClickedVar(clicked, filerName) {
    const buttons = document.getElementsByClassName(filerName);
    for (let f of buttons) {
        f.classList.remove("selected");
    }
    if (clicked.id != -1) clicked.classList.add("selected");
    tradeInfo();
}


async function addPlayerDropdown() {
    const dbData = await runQuery("getPlayers");
    const data = dbData.map(player => {
        return {
            playerName: player.name,
            id: player.playerID
        };
    });

    const tableBody = document.querySelector("#dynamic-player-winner-label");
    tableBody.innerHTML = "";

    data.forEach(rowData => {
        const option = document.createElement("option");
        option.value = rowData.id;
        option.innerHTML = rowData.playerName;
        tableBody.appendChild(option);
    });
}

//https://stackoverflow.com/questions/10520899/form-action-with-javascript
async function submitPlayer(data) {
    var values = {};
    for (element of data) {
        if (element.type == "submit") continue;
        values[`${element.name}`] = element.value;
    }

    const dbData = await runQuery("addPlayer", values)
    if (dbData === "success") notification("New Player Added!");
    else notification("Error Adding Player!");
}

function submitGame(data) {
    for (element of data) {
        if (element.type == "submit") continue;
        console.log(element);
    }
}

function notification(msg) {
    alert(msg);
}

async function boardDownload(gameID) {
    const dbData = await runQuery("getBoard", { gameID: gameID });
    var size;
    if (dbData.length > 20) size = [4, 5, 6, 5, 4];
    else size = [3, 4, 5, 4, 3];

    var data = [["Resource", "Number", "Location"]];
    dbData.forEach(rowData => {
        data.push([`${rowData.resource}`, `${rowData.number}`, `${rowData.location}`]);
    });

    download(csvmaker(data), gameID);
}
//https://www.geeksforgeeks.org/javascript/how-to-create-and-download-csv-file-in-javascript/
const csvmaker = function (data) {

    // Empty array for storing the values
    csvRows = [];

    // Pushing Object values into array
    // with comma separation
    const values = data.join('\n');
    csvRows.push(values);

    // Returning the array joining with new line 
    return csvRows;
}
// Function to download the CSV file
const download = (data, id) => {
    // Create a Blob with the CSV data and type
    const blob = new Blob([data], { type: 'text/csv' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor tag for downloading
    const a = document.createElement('a');

    // Set the URL and download attribute of the anchor tag
    a.href = url;
    a.download = `board_${id}.csv`;

    // Trigger the download by clicking the anchor tag
    a.click();
}

async function deletePlayer(playerID) {

    const playerData = await runQuery("getPlayerFromID", {id: playerID});

    if (confirm(`Are you sure you want to remove ${playerData[0].name} from the database?`)) {
        const status = await runQuery("deletePlayer", {id: playerID});
        if (status === "success") {
            notification("Player Deleted");
            window.location.reload();
        }
        else notification("Error Deleting Player!");
    }
}

async function displayPlayer(playerID) {
    const playerData = await runQuery("getPlayerFromID", { id: playerID });

    const nameTag = document.getElementById("player-alter-name");
    nameTag.value = playerData[0].name;

    const imageTag = document.getElementById("player-alter-image");
    var http = new XMLHttpRequest();
    http.open('HEAD', imageTag.src, false);
    http.send();
    if (http.status === 200) {
        imageTag.src = `media/${nameTag.value.toLowerCase()}.png`;
    } else {
        imageTag.src = "media/default_player.png";
    }

    const idTag = document.getElementsByClassName("info-location")[0];
    idTag.id = playerData[0].playerID;
}

async function alterPlayer() {
    const idTag = document.getElementsByClassName("info-location")[0];
    const nameTag = document.getElementById("player-alter-name");
    
    if (confirm(`Are you sure you want to change ${nameTag.name} in the database?`)) {
        const status = await runQuery("alterPlayer", { name: nameTag.value, id: idTag.id })
        if (status === "success") {
            notification("Player Altered");
            window.location.reload();
        }
        else notification("Error Altering Player!");
    } 
}

async function showWinner(gameID) {
    const dbData = await runQuery("getWinner", {gameID: gameID});

    const tableBody = document.querySelector("#dynamic-winner");
    
    const container = document.createElement("div");
    container.classList.add("winner", "center", "center-text");

    const label = document.createElement("div");
    label.classList.add("catan-font", "catan-font-color")
    label.innerHTML = "WINNER: "
    container.appendChild(label);

    const person = document.createElement("div");
    person.innerHTML = `${dbData[0].winner}`;
    container.appendChild(person);

    tableBody.appendChild(container);
}

async function createPlayerGameButtons(gameID) {

    const dbData = await runQuery("getPlayersInGame", {gameID: gameID});
    const data = dbData.map(player => {
        return {
            playerName: player.name,
            playerID: player.playerID,
            color: playerColor(player.name)
        };
    });

    const tableBody = document.querySelectorAll("#dynamic-player-buttons");
    tableBody.forEach(body => {

        data.forEach(rowData => {
            const player_button = document.createElement("button");
            player_button.classList.add("player-button", "selection-option");
            player_button.id = `${rowData.playerID}`;

            player_button.addEventListener('mouseover', function () {
                player_button.style.backgroundColor = `${rowData.color}`;
            });
            player_button.addEventListener('mouseleave', function () {
                player_button.style.backgroundColor = '';
            });
            player_button.addEventListener('click', function () {
                getPlayerBuilds(gameID, player_button.id);
                filterClickedVar(player_button, "selection-option");
            });

            const label = document.createElement("p");
            label.textContent = `${rowData.playerName}`;

            player_button.appendChild(label);
            body.appendChild(player_button);
        });

        const clear_button = document.createElement("button");
        clear_button.classList.add("player-button", "selection-option");
        clear_button.id = '-1';

        clear_button.addEventListener('mouseover', function () {
            clear_button.style.backgroundColor = 'lightgray';
        });
        clear_button.addEventListener('mouseleave', function () {
            clear_button.style.backgroundColor = '';
        });
        clear_button.addEventListener('click', function () {
            getPlayerBuilds(gameID, clear_button.id);
            filterClickedVar(clear_button, "selection-option");
        });

        const label = document.createElement("p");
        label.textContent = 'clear';

        clear_button.appendChild(label);
        body.appendChild(clear_button);
    });
}

async function getPlayerBuilds(gameID, playerID) {

    const tableBody = document.querySelector("#dynamic-player-builds");
    const listBody = document.createElement("div");
    tableBody.innerHTML = "";
    if (playerID == -1) return;

    const dbData = await runQuery("getBuildsByGame", {gameID: gameID, playerID: playerID});

    const title = document.createElement("div");
    title.innerHTML = `${dbData[0].playerName.toUpperCase()}`;
    title.classList.add("catan-font", "catan-font-color", "bold");
    tableBody.appendChild(title);

    dbData.forEach(rowData => {

        const l = document.createElement("p");
        l.innerHTML = `${rowData.buildingType} at ${rowData.vertex_id}`;
        listBody.appendChild(l);
    });
    tableBody.appendChild(listBody);

}

async function createGameTrades(gameID) {
    const dbData = await runQuery("getTradesByGame", {gameID: gameID});

    const tableBody = document.querySelector("#dynamic-game-trades");

    const total = document.getElementById("totaltrades");
    total.innerHTML = `TOTAL TRADES MADE: ${dbData.length}`;

    dbData.forEach(rowData => {
        const container = document.createElement("div");
        container.classList.add("horizontal-text", "trade");

        const p1 = document.createElement("p");
        p1.textContent = `${rowData.Player1}`;
        container.appendChild(p1);

        const g1 = document.createElement("p");
        g1.textContent = "Gave";
        container.appendChild(g1);

        const r1 = document.createElement("p");
        r1.textContent = `${rowData.Gave1}`;
        container.appendChild(r1);

        const a = document.createElement("a");
        a.textContent = "AND";
        container.appendChild(a);

        const p2 = document.createElement("p");
        p2.textContent = `${rowData.Player2}`;
        container.appendChild(p2);

        const g2 = document.createElement("p");
        g2.textContent = "Gave";
        container.appendChild(g2);

        const r2 = document.createElement("p");
        r2.textContent = `${rowData.Gave2}`;
        container.appendChild(r2);

        tableBody.appendChild(container);
    });
}