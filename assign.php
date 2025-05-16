<?php

// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development
// Assignment 2 - Web Application Development

header('Content-Type: application/json');

// sql info or use include 'file.inc'
//require_once('../../files/sqlinfo.inc.php'); //------------------FOR UNI SERVER
require_once('sqlHome.inc.php');

// Validate input
$bookingId = $_POST['booking_id'] ?? null;
if (!$bookingId || !is_numeric($bookingId)) {
    echo json_encode(['success' => false, 'error' => 'Invalid booking ID']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    // Update the status in database
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'assigned' WHERE id = :id AND status = 'unassigned'");
    $stmt->execute(['id' => $bookingId]);
    
    // Check if any row was actually updated
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Booking not found or already assigned']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}