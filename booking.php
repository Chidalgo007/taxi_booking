
<?php
// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development

header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// sql info or use include 'file.inc'
//require_once('../../files/sqlinfo.inc.php'); //------------------FOR UNI SERVER
require_once('sqlHome.inc.php');

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];
try {
    // Connect to database using PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, $options);

    // Create table if it doesn't exist
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS $table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_ref VARCHAR(10) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            pickup TEXT NOT NULL,
            street_number VARCHAR(20),
            unit_number VARCHAR(20),
            suburb VARCHAR(50),
            postcode VARCHAR(10),
            pickup_date DATE NOT NULL,
            pickup_time TIME NOT NULL,
            pickup_datetime DATETIME NOT NULL,
            dropoff TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'unassigned'
        )
    ";
    // execute the SQl stmt
    $pdo->exec($createTableSQL);

    // Generate Booking Reference Number (BRN00001)
    $stmt = $pdo->query("SELECT MAX(id) as max_id FROM bookings");
    $row = $stmt->fetch();
    $nextId = $row['max_id'] + 1;
    $bookingRef = "BRN" . str_pad($nextId, 5, "0", STR_PAD_LEFT);


    // Validate name (letters and spaces only)
    $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
    if (!$name || !preg_match("/^[a-zA-Z\s]+$/", $name)) {
        http_response_code(400);
        exit("Invalid name.");
    }

    // Validate phone (digits, space, dashes, etc.)
    $phone = htmlspecialchars($_POST['phone'] ?? '', ENT_QUOTES, 'UTF-8');

    // Remove non-digit characters (optional, if allowing spaces, dashes, etc.)
    $digitsOnly = preg_replace('/\D/', '', $phone);

    if (strlen($digitsOnly) < 10 || strlen($digitsOnly) > 12) {
        http_response_code(400);
        exit("Phone number must be 10 to 12 digits.");
    }


    // Validate date (format YYYY-MM-DD)
    $pudate = $_POST['pudate'] ?? '';
    if (!DateTime::createFromFormat('Y-m-d', $pudate)) {
        http_response_code(400);
        exit("Invalid pickup date.");
    }

    // Validate time (format HH:MM)
    $putime = $_POST['putime'] ?? '';
    if (!DateTime::createFromFormat('H:i', $putime)) {
        http_response_code(400);
        exit("Invalid pickup time.");
    }

    // Validate required text fields
    $pickup = trim($_POST['pickup'] ?? '');
    $dropoff = trim($_POST['dropoff'] ?? '');
    if (!$pickup || !$dropoff) {
        http_response_code(400);
        exit("Pickup and drop-off addresses are required.");
    }

    $pickupDateTime = $pudate . ' ' . $putime;
    // Prepare insert
    $stmt = $pdo->prepare("
    INSERT INTO $table (
      booking_ref, name, phone, pickup, street_number, unit_number, suburb, postcode, pickup_date, pickup_time,pickup_datetime, dropoff
    ) VALUES (
      :booking_ref, :name, :phone, :pickup, :street_number, :unit_number, :suburb, :postcode, :pickup_date, :pickup_time,:pickup_datetime, :dropoff
    );
  ");

    // Bind and execute
    $stmt->execute([
        ':booking_ref'      => $bookingRef,
        ':name'             => $_POST['name'] ?? '',
        ':phone'            => $_POST['phone'] ?? '',
        ':pickup'           => $_POST['pickup'] ?? '',
        ':street_number'    => $_POST['snumber'] ?? '',
        ':unit_number'      => $_POST['unumber'] ?? '',
        ':suburb'           => $_POST['sbname'] ?? '',
        ':postcode'         => $_POST['postcode'] ?? '',
        ':pickup_date'      => $_POST['pudate'] ?? '',
        ':pickup_time'      => $_POST['putime'] ?? '',
        ':pickup_datetime'  => $pickupDateTime,
        ':dropoff'          => $_POST['dropoff'] ?? '',
    ]);


    // Success response
    echo json_encode([
        "status" => "success",
        "booking_number" => $bookingRef,
        "formData" => $_POST,
        "booking_status" => "unassigned"
    ]);
} catch (PDOException $e) {

    http_response_code(500);
    echo "Database error: " . $e->getMessage();
}
?>