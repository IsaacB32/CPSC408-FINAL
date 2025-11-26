<?php
//References 
//https://www.w3schools.com/php/php_mysql_prepared_statements.asp
//https://www.w3schools.com/php/php_mysql_connect.asp
error_reporting(E_ALL);
ini_set("display_errors", 1);
header("Content-Type: application/json");

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);
$action = $input["action"] ?? null;
$data   = $input["data"] ?? [];

// Connect to DB
$conn = new mysqli("localhost", "root", "CPSC408!", "CatanTest");
if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

// ----------------------------
// Query Functions
// ----------------------------

function getTradeCounts($conn) {
    $query = "
        SELECT player.name, player.playerID, COUNT(*) AS totalTrades
        FROM playertrade
        INNER JOIN player ON player.playerID IN (playertrade.toPlayerID, playertrade.fromPlayerID)
        GROUP BY player.playerID
    ";

    $result = $conn->query($query);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    return $rows;
}

function getPlayers($conn) {
    $query = "
        SELECT player.playerID, name, wins, COUNT(playergame.points) AS totalGamesPlayed
        FROM player
        LEFT OUTER JOIN playergame ON player.playerID = playergame.playerID
        WHERE name != 'NULL'
        GROUP BY playerID;
    ";
    $result = $conn->query($query);
    return $result->fetch_all(MYSQLI_ASSOC);
}

function getTradesForPlayer($conn, $playerID) {
    $stmt = $conn->prepare("
        SELECT * FROM playertrade WHERE toPlayerID = ?
    ");
    $stmt->bind_param("i", $playerID);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getGamesCard($conn) {
    $query = "
        SELECT gameID, player.name AS winner
        FROM game
        INNER JOIN player ON game.winnerID = player.playerID
        ORDER BY gameID
    ";
    $result = $conn->query($query);
    return $result->fetch_all(MYSQLI_ASSOC);
}

function getBoard($conn, $gameID) {
    $stmt = $conn->prepare("
        SELECT resource, number, location
        FROM gametile
        INNER JOIN tile ON gametile.tileID = tile.tileID
        WHERE gameID = ?
        ORDER BY location
    ");
    $stmt->bind_param("i", $gameID);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getAllTrades($conn, $ids) {
    $type = array_pop($ids);
    $placeholder = implode(',', array_fill(0, count($ids), '?'));

    $placeholder_needed = 1;
    switch($type) {
        case "both":
            $type_query = "WHERE p_to.playerID IN ($placeholder) OR p_from.playerID IN ($placeholder) ORDER BY p_from.playerID";
            $placeholder_needed = 2;
            break;
        case "gave":
            $type_query = "WHERE p_from.playerID IN ($placeholder) ORDER BY p_from.playerID";
            break;
        case "recieved":
            $type_query = "WHERE p_to.playerID IN ($placeholder) ORDER BY p_to.playerID";
            break;
        default:
            $type_query = "LIMIT 1";
            $placeholder_needed = 0;
            break;
    }

    $stmt = $conn->prepare("
        SELECT p_from.name AS Player1, playertrade.fromPlayerGave AS Gave1, p_to.name AS Player2, playertrade.toPlayerGave AS Gave2
        FROM playertrade
        INNER JOIN player p_from ON p_from.playerID = playertrade.fromPlayerID
        INNER JOIN player p_to ON p_to.playerID = playertrade.toPlayerID
        $type_query
    ");

    if ($placeholder_needed > 0) {
        $total_params = count($ids) * $placeholder_needed;
        $type_string = str_repeat('i', $total_params);

        $params = ($placeholder_needed === 2) ? array_merge($ids, $ids) : $ids;
        $stmt->bind_param($type_string, ...$params);
    }

    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function addPlayer($conn, $data) {
    $name = mysqli_real_escape_string($conn, $data['name']);

    $query = "
        INSERT INTO player(name, wins, numClosets) VALUES ('$name', 0, 0)
    ";

    if ($conn->query($query) === TRUE) {
        return "success";
    } else {
        return "Error: " . $sql . "<br>" . $conn->error;
    }
}

function getPlayerFromID($conn, $id) {
    $stmt = $conn->prepare("
        SELECT * FROM player WHERE playerID = ?
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function removePlayer($conn, $id) {
    $query = "
        INSERT INTO player(name, wins, numClosets) VALUES ('$name', 0, 0)
    ";

    if ($conn->query($query) === TRUE) {
        return "success";
    } else {
        return "Error: " . $sql . "<br>" . $conn->error;
    }
}

function alterPlayer($conn, $name, $id) {
    $query = "
        UPDATE player
        SET name = '$name'
        WHERE playerID = $id;
    ";

    if ($conn->query($query) === TRUE) {
        return "success";
    } else {
        return "Error: " . $sql . "<br>" . $conn->error;
    }
}

switch ($action) {
    case "getTradeCounts":
        echo json_encode(getTradeCounts($conn));
        break;

    case "getPlayers":
        echo json_encode(getPlayers($conn));
        break;

    case "getTradesForPlayer":
        echo json_encode(getTradesForPlayer($conn, $data["playerID"]));
        break;

    case "getGamesCard":
        echo json_encode(getGamesCard($conn));
        break;

    case "getBoard":
        echo json_encode(getBoard($conn, $data["gameID"]));
        break;

    case "getAllTrades":
        echo json_encode(getAllTrades($conn, $data["ids"]));
        break;

    case "addPlayer":
        echo json_encode(addPlayer($conn, $data));
        break;
    case "removePlayer":
        echo json_encode(removePlayer($conn, $data['id']));
        break;
    case "getPlayerFromID":
        echo json_encode(getPlayerFromID($conn, $data['id']));
        break;
    case "alterPlayer":
        echo json_encode(alterPlayer($conn, $data['name'], $data['id']));
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
}

$conn->close();
?>
