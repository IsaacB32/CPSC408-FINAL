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

async function createPlayerButtons() {

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

            player_button.addEventListener('mouseover', function () {
                player_button.style.backgroundColor = `${rowData.color}`;
            });
            player_button.addEventListener('mouseleave', function () {
                player_button.style.backgroundColor = ''
            });
            player_button.addEventListener('click', function () {
                if (body.classList.contains("trade-player-button")) {
                    player_button.classList.toggle("trade-selected");
                    tradeInfo();
                }
                else {
                    queryPlayer(trade_dbData.find((element) => element.playerID == rowData.playerID));
                }
            });

            const label = document.createElement("p");
            label.textContent = `${rowData.playerName}`;

            player_button.appendChild(label);
            body.appendChild(player_button);
        });
    });

    tradeInfo();
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
    var counter = 0;
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

    //https://code-boxx.com/call-php-file-from-javascript/
    const response = await fetch("add_player.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
    });
    const dbData = await response.json();
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