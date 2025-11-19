
async function createPlayerCards() {

    const response = await fetch("dataconnection.php");
    const dbData = await response.json();

    const data = dbData.map(player => {
        return {
            playername: player.name,
            wins: player.wins,
            imagesrc: `media/${player.name.toLowerCase()}.png`
        };
    });
    console.log(data);


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

