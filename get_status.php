<?php
// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development

header('Content-Type: application/json');
// sql info or use include 'file.inc'
//require_once('../../files/sqlinfo.inc.php'); //------------------FOR UNI SERVER
require_once('sqlHome.inc.php');

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, $options);

    $bookingRef = $_GET['booking_ref'] ?? '';
    if (!preg_match('/^BRN\d{5}$/', $bookingRef)) {
        throw new Exception("Invalid booking reference format.");
    }

    $stmt = $pdo->prepare("SELECT status FROM bookings WHERE booking_ref = :booking_ref");
    $stmt->execute([':booking_ref' => $bookingRef]);
    $result = $stmt->fetch();

    if ($result) {
        echo json_encode(["success" => true, "status" => $result['status']]);
    } else {
        echo json_encode(["success" => false, "error" => "Booking not found"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
