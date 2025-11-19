<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
header("Content-Type: application/json");

// Database connection
$conn = new mysqli("localhost", "root", "CPSC408!", "CatanTest");

if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

$query = "
    SELECT name, wins FROM player WHERE name != 'NULL'
";

$result = $conn->query($query);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$conn->close();
?>
