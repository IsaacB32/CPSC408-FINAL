<?php
//reference: https://www.geeksforgeeks.org/php/how-to-insert-form-data-into-database-using-php/
error_reporting(E_ALL);
ini_set("display_errors", 1);
header("Content-Type: application/json");

// Connect to DB
$conn = new mysqli("localhost", "root", "CPSC408!", "CatanTest");
if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
$name = mysqli_real_escape_string($conn, $data['name']);

$query = "
    INSERT INTO player(name, wins, numClosets) VALUES ('$name', 0, 0)
";

if ($conn->query($query) === TRUE) {
    echo json_encode("success");
} else {
    echo json_encode("Error: " . $sql . "<br>" . $conn->error);
}

$conn->close();
?>

