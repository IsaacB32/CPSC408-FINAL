
async function createPlayerCards() {

    const response = await fetch("indexconnection.php");
    const dbData = await response.json();

    const data = dbData.map(player => {
        return {
            playerName: player.name,
            wins: player.wins,
            imagesrc: `media/${player.name.toLowerCase()}.png`
        };
    });

    const stats = [
            { title: "TOTAL WINS", key: "wins"}//,
            // { title: "GAMES PLAYED", key: "played"},
            // { title: "WIN PERCENTAGE", key: "percent"}
        ];

    const tableBody = document.querySelector("#dynamic-player-list");
    tableBody.innerHTML = "";

    data.forEach(rowData => {
        const list = document.createElement("li");
        const card = document.createElement("div");
        card.classList.add("person-card");

        const img = document.createElement("img");
        img.src = rowData.imagesrc;
        card.appendChild(img);

        const list_container = document.createElement("div");
        list_container.classList.add("list");

        const stats_title = document.createElement("h3");
        stats_title.textContent = "STATS";
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

    const response = await fetch("playersearchconnection.php");
    const dbData = await response.json();

    const data = dbData.map(player => {
        return {
            playerName: player.name,
            playerID: player.playerID,
            color: playerColor(player.name)
        };
    });

    const trade_response = await fetch("playerinfoconnection.php");
    const trade_dbData = await trade_response.json();

    const trade_data = trade_dbData.map(trade => {
        return {
            playerName: trade.name,
            playerID: trade.playerID,
            totalTrades: trade.totalTrades
        }
    });

    const tableBody = document.querySelector("#dynamic-player-buttons");
    tableBody.innerHTML = "";

    data.forEach(rowData => {
        const player_button = document.createElement("button");
        player_button.classList.add("player-button")
        player_button.id = `${rowData.playerID}`;

        player_button.addEventListener('mouseover', function () {
            player_button.style.backgroundColor=`${rowData.color}`;
        });
        player_button.addEventListener('mouseleave', function () {
            player_button.style.backgroundColor = ''
        });
        player_button.addEventListener('click', function () {
            queryPlayer(trade_data.find((element) => element.playerID == rowData.playerID));
        });

        const label = document.createElement("p");
        label.textContent = `${rowData.playerName}`;

        player_button.appendChild(label);
        tableBody.appendChild(player_button);
    });
}

function queryPlayer(data) {
    const tableBody = document.querySelector("#dynamic-player-info")
    tableBody.innerHTML = "";

    if (data) {
        const label_name = document.createElement("p");
        label_name.textContent = `PLAYER NAME: ${data.playerName}`;
        tableBody.appendChild(label_name);

        const label_total_trades = document.createElement("p");
        label_total_trades.textContent = `TOTAL TRADES: ${data.totalTrades}`;
        tableBody.appendChild(label_total_trades);
    }
    else {
        console.log("no data");
    }
}


function playerColor(playerName) {
    switch(playerName.toLowerCase()) {
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

function createGameButtons() {
    
}