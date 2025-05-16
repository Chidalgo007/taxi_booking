<?php
ob_start();
// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development
// Assignment 2 - Web Application Development


header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
date_default_timezone_set('Pacific/Auckland'); // local timezone

require_once('sqlHome.inc.php');

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // No search, just get unassigned in the next 2 hours
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Check if the search parameter is set and not empty
    if ($search !== '') {
        // Use wildcard search on name, phone, or pickup location

        if (preg_match('/^BRN\d{5}$/i', $search)) {
            $search = strtoupper($search);

            $stmt = $pdo->prepare("
                SELECT * 
                FROM $table 
                WHERE booking_ref = ?
                ORDER BY pickup_datetime
            ");
            $stmt->execute([$search]);
        } elseif (preg_match('/^\d{10,12}$/', $search)) {

            $stmt = $pdo->prepare("
                SELECT * 
                FROM $table 
                WHERE phone = ?
                ORDER BY pickup_datetime
            ");
            $stmt->execute([$search]);
        } elseif (preg_match('/^[a-zA-Z\s]+$/', $search)) {
            $search = strtolower($search);

            $stmt = $pdo->prepare("
                SELECT * 
                FROM $table 
                WHERE LOWER(name) = ?
                ORDER BY pickup_datetime
            ");
            $stmt->execute([$search]);
        } else {
            // No match for BRN, phone, or name — bad input
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Invalid input. Please enter a Booking Ref e.g.(BRN12345), phone number (10-12 digits), or name.'
            ]);
            exit;
        }
    } else {

        // Default behavior: get unassigned bookings for next 2 hours
        $currentDateTime = date('Y-m-d H:i:s');
        $twoHoursLater = date('Y-m-d H:i:s', strtotime('+2 hours'));

        $stmt = $pdo->prepare("
        SELECT * 
        FROM $table 
        WHERE status = 'unassigned'
        AND pickup_datetime BETWEEN ? AND ?
        ORDER BY pickup_datetime
        ");

        $stmt->execute([$currentDateTime, $twoHoursLater]);
    }

    $bookings = $stmt->fetchAll();

    ob_clean();
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
    ]);


} catch (PDOException $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
