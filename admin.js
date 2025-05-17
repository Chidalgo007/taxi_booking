// Student Christian Alejandro Hidalgo Gonzalez
// Student ID 22187872
// Course: COMP721 - Web Development

document.addEventListener("DOMContentLoaded", function () {
  const bookingDisplay = document.getElementById("content");
  const searchBtn = document.getElementById("sbuton");
  let allBookings = []; // Store all bookings for client-side filtering

  // Create table structure once and append it to the display
  const bookingsTable = document.createElement("table");
  bookingsTable.innerHTML = `
    <thead>
      <tr>
        <th>Booking Ref</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Pickup Address</th>
        <th>Dropoff Address</th>
        <th>Booking Date & time</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="bookings-table-body"></tbody>
  `;
  bookingDisplay.appendChild(bookingsTable);
  const bookingsTableBody = document.getElementById("bookings-table-body");

  // Render all bookings into the table
  function renderBookings(bookings) {
    bookingsTableBody.innerHTML = "";
    if (bookings.length === 0) {
      bookingsTableBody.innerHTML = `<tr><td colspan="8">No bookings found</td></tr>`;
      return;
    }

    // Create a row for each booking
    bookings.forEach((booking) => {
      const bookingRow = document.createElement("tr");
      bookingRow.innerHTML = `
            <td>${booking.booking_ref}</td>
            <td>${booking.name}</td>
            <td>${booking.phone}</td>
            <td>${booking.pickup}</td>
            <td>${booking.dropoff}</td>
            <td>${booking.pickup_datetime}</td>
            <td class="status-cell">${booking.status}</td>
            <td>
                <button class="abtn" data-id="${booking.id}" ${
        booking.status !== "unassigned" ? "disabled" : ""
      }>
                    ${booking.status === "unassigned" ? "Assign" : "Assigned"}
                </button>
            </td>
        `;
      bookingsTableBody.appendChild(bookingRow);
    });

    // Add click listeners for assign buttons
    document.querySelectorAll(".abtn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const bookingId = this.getAttribute("data-id");
        assignBooking(bookingId, this);
      });
    });
  }

  // Assign a booking and update UI
  function assignBooking(bookingId, buttonElement) {
    if (!bookingId) return;

    // Show assigning state
    buttonElement.disabled = true;
    buttonElement.textContent = "Assigning...";

    // Send assignment request to server
    fetch("assign.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `booking_id=${encodeURIComponent(bookingId)}`,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network error");
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          // Update local status
          const booking = allBookings.find((b) => b.id == bookingId);
          if (booking) {
            booking.status = "assigned";
          }

          // Update button and status cell
          buttonElement.textContent = "Assigned";
          buttonElement.disabled = true;

          const row = buttonElement.closest("tr");
          if (row) {
            const statusCell = row.querySelector(".status-cell");
            if (statusCell) {
              statusCell.textContent = "assigned";
            }
          }

          // Show success message
          showAlert("Booking assigned successfully!", "success");
        } else {
          throw new Error(data.error || "Failed to assign booking");
        }
      })
      .catch((error) => {
        console.error("Assignment error:", error);
        buttonElement.disabled = false;
        buttonElement.textContent = "Assign";
        showAlert(error.message, "error");
      });
  }

  // Show a temporary loading row
  function showLoadingRow() {
    bookingsTableBody.innerHTML = `
    <tr><td colspan="8">Loading...</td></tr>
  `;
  }

  // Show temporary message at top of page
  function showAlert(message, type) {
    document.querySelectorAll(".alert").forEach((el) => el.remove()); // remove old ones
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  }

  // Fetch all bookings from server and display them
  function loadAllBookings() {
    showLoadingRow();
    fetch("admin.php")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          allBookings = data.bookings;
          renderBookings(allBookings);
        } else {
          console.log("Server returned error:", data.error);
          bookingsTableBody.innerHTML = ""; // Clear existing rows
          const errorRow = document.createElement("tr");
          errorRow.innerHTML = `<td colspan="8" class="error">${
            data.error || "No bookings found."
          }</td>`;
          bookingsTableBody.appendChild(errorRow);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        bookingsTableBody.innerHTML = ""; // Clear existing rows
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `<td colspan="8" class="error">${error.message}</td>`;
        bookingsTableBody.appendChild(errorRow);
      });
  }

  // Fetch and display filtered bookings based on search input
  function filterBookings(searchTerm) {
    if (!searchTerm) {
      renderBookings(allBookings);
      return;
    }
    console.log("Sending fetch to admin.php with search =", searchTerm);
    // Use fetch to get filtered bookings from the server
    showLoadingRow();
    fetch(`admin.php?search=${encodeURIComponent(searchTerm)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Network response was not ok");

        const text = await response.text();
        console.log("Raw response:", text); // Debug: log raw text response
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error("Invalid server response.");
        }

        if (data.success) {
          renderBookings(data.bookings);
        } else {
          bookingsTableBody.innerHTML = ""; // Clear existing rows
          const errorRow = document.createElement("tr");
          errorRow.innerHTML = `<td colspan="8" class="error">${
            data.error || "No bookings found."
          }</td>`;
          bookingsTableBody.appendChild(errorRow);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        bookingsTableBody.innerHTML = ""; // Clear existing rows
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `<td colspan="8" class="error">${error.message}</td>`;
        bookingsTableBody.appendChild(errorRow);
      });
  }

  // Add event listener for search button
  searchBtn.addEventListener("click", handleSearch);

  // Add Enter key support to search input
  document.getElementById("bsearch").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submission or default behavior
      handleSearch(); // trigger search manually
    }
  });

  // Sanitize input to remove symbols and special characters
  function sanitizeInput(input) {
    return input.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  }

  // Main search handler function
  function handleSearch() {
    console.log("Search triggered");
    const rawInput = document.getElementById("bsearch").value;
    const searchInput = sanitizeInput(rawInput); // clean up input before sending

    // Load all if empty
    if (searchInput === "") {
      loadAllBookings();
    } else {
      // Otherwise search
      filterBookings(searchInput);
    }
  }

  // Initial load when page is ready
  loadAllBookings();
});
