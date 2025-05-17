<?php
ob_start(); // Start output buffering to allow clean control over what gets sent to the client

// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development
// Assignment 2 - Web Application Development

// Set header to return JSON data
header('Content-Type: application/json');

// Enable error reporting for debugging during development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set timezone to NZ for consistent date/time handling
date_default_timezone_set('Pacific/Auckland');

// Include database connection details
//require_once('../../files/sqlinfo.inc.php'); //------------------FOR UNI SERVER
require_once('sqlHome.inc.php');

// Retrieve the search term from query string if provided
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // Connect to the database using PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION // Throw exceptions on DB errors
    ]);

    // If search term is provided, filter results accordingly
    if ($search !== '') {
        // --- CASE 1: Search is a Booking Reference (e.g. BRN12345) ---
        if (preg_match('/^BRN\d{5}$/i', $search)) {
            $search = strtoupper($search); // Normalize to uppercase just in case

            // Query bookings by exact booking reference
            $stmt = $pdo->prepare("
                SELECT * 
                FROM $table 
                WHERE booking_ref = ?
                ORDER BY pickup_datetime
            ");
            $stmt->execute([$search]);

        // --- CASE 2: Search is a Phone Number (10-12 digits) ---
        } elseif (preg_match('/^\d{10,12}$/', $search)) {
            // Query bookings by phone number
            $stmt = $pdo->prepare("
                SELECT * 
                FROM $table 
                WHERE phone = ?
                ORDER BY pickup_datetime
            ");
            $stmt->execute([$search]);

        // --- CASE 3: Search is a Name (letters and spaces only) ---
        } elseif (preg_match('/^[a-zA-Z\s]+$/', $search)) {
            $search = strtolower($search); // Make case-insensitive

            // Query bookings by lowercase name
            $stmt = $pdo->prepare("
                SELECT * 
                FROM $table 
                WHERE LOWER(name) = ?
                ORDER BY pickup_datetime
            ");
            $stmt->execute([$search]);

        } else {
            // --- CASE 4: Input does not match any expected format ---
            ob_clean(); // Clear buffer before sending response
            echo json_encode([
                'success' => false,
                'error' => 'Invalid input. Please enter a Booking Ref e.g.(BRN12345), phone number (10-12 digits), or name.'
            ]);
            exit;
        }

    } else {
        // --- DEFAULT: No search provided ---
        // Return all unassigned bookings with pickup time in the next 2 hours

        $currentDateTime = date('Y-m-d H:i:s'); // Current server time
        $twoHoursLater = date('Y-m-d H:i:s', strtotime('+2 hours')); // 2 hours later

        $stmt = $pdo->prepare("
            SELECT * 
            FROM $table 
            WHERE status = 'unassigned'
            AND pickup_datetime BETWEEN ? AND ?
            ORDER BY pickup_datetime
        ");

        // Execute query with date range
        $stmt->execute([$currentDateTime, $twoHoursLater]);
    }

    // Fetch all matching bookings from DB
    $bookings = $stmt->fetchAll();

    // Send successful JSON response
    ob_clean(); // Clear any previous output
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
    ]);

} catch (PDOException $e) {
    // Handle DB connection or query error
    http_response_code(500); // Internal server error
    ob_clean(); // Clear buffer to send only JSON
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
