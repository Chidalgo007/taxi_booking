<?php
// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development

header('Content-Type: application/json');

// Include database connection details
//require_once('../../files/sqlinfo.inc.php'); //------------------FOR UNI SERVER
require_once('sqlHome.inc.php'); // local db credentials

// PDO options for error handling and fetch mode
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    // Create new PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, $options);

    // Get booking reference from query string
    $bookingRef = $_GET['booking_ref'] ?? '';

    // Validate BRN format (e.g. BRN00001)
    if (!preg_match('/^BRN\d{5}$/', $bookingRef)) {
        throw new Exception("Invalid booking reference format.");
    }

    // Prepare and execute query to fetch booking status
    $stmt = $pdo->prepare("SELECT status FROM $table WHERE booking_ref = :booking_ref");
    $stmt->execute([':booking_ref' => $bookingRef]);
    $result = $stmt->fetch();

    // If found, return success + status
    if ($result) {
        echo json_encode(["success" => true, "status" => $result['status']]);
    } else {
        // If not found, return error
        echo json_encode(["success" => false, "error" => "Booking not found"]);
    }

} catch (Exception $e) {
    // Handle DB or logic errors
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
