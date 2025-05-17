<?php

// Student: Christian Alejandro Hidalgo Gonzalez
// Student ID: 22187872
// Course: COMP721 - Web Development
// Assignment 2 - Web Application Development

// Set header to return a JSON response
header('Content-Type: application/json');

// Include database connection details
//require_once('../../files/sqlinfo.inc.php'); //------------------FOR UNI SERVER
require_once('sqlHome.inc.php'); // Home version of DB credentials

// --- Validate input ---

// Get booking ID from POST data (null if not set)
$bookingId = $_POST['booking_id'] ?? null;

// Check if booking ID is valid (non-empty and numeric)
if (!$bookingId || !is_numeric($bookingId)) {
    echo json_encode(['success' => false, 'error' => 'Invalid booking ID']);
    exit; // Stop script if invalid input
}

try {
    // Connect to the database using PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION // Throw exceptions for DB errors
    ]);
    
    // --- Attempt to assign the booking ---

    // Only update bookings that are currently 'unassigned'
    $stmt = $pdo->prepare("
        UPDATE bookings 
        SET status = 'assigned' 
        WHERE id = :id 
        AND status = 'unassigned'
    ");

    // Execute the update statement using the provided booking ID
    $stmt->execute(['id' => $bookingId]);
    
    // --- Check result of the update ---

    // If one or more rows were updated, assignment was successful
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        // No rows updated – either the ID was invalid or already assigned
        echo json_encode([
            'success' => false,
            'error' => 'Booking not found or already assigned'
        ]);
    }

} catch (PDOException $e) {
    // Handle database errors gracefully
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
