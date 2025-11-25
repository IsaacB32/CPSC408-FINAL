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

$first_name = mysqli_real_escape_string($conn, $_POST['first_name']);
$last_name = mysqli_real_escape_string($conn, $_POST['last_name']);
$gender = mysqli_real_escape_string($conn, $_POST['gender']);
$address = mysqli_real_escape_string($conn, $_POST['address']);
$email = mysqli_real_escape_string($conn, $_POST['email']);


$conn->close();
?>

