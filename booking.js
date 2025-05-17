/*
Student: Christian Alejandro Hidalgo Gonzalez
Student ID: 22187872
Course: COMP721 - Web Development
*/

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const form = document.getElementById("booking-form");
  const submitBtn = form.querySelector("button[type='submit']");
  const dateInput = document.getElementById("pudate");
  const timeInput = document.getElementById("putime");
  const errorMessage = document.getElementById("error-message");

  // Set today's date as the minimum allowed for the pickup date
  const today = new Date().toISOString().split("T")[0]; // Format: "YYYY-MM-DD"
  dateInput.min = today;

  // --- Helper: Check if selected date/time is in the past ---
  function isDateTimeInPast() {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;
    
    if (!selectedDate || !selectedTime) return false; // Skip check if incomplete
    
    const now = new Date();
    const selected = new Date(`${selectedDate}T${selectedTime}`);
    
    return selected < now;
  }

  // --- Adjust minimum pickup time based on selected date ---
  dateInput.addEventListener("change", () => {
    const selectedDate = dateInput.value;
    const now = new Date();

    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    // If user selected today's date, restrict time to current or later
    if (selectedDate === today) {
      timeInput.min = currentTime;
    } else {
      timeInput.min = "00:00"; // For future dates, allow any time
    }
    
    checkFormValidity();
  });

  // --- Check if form is valid and update UI accordingly ---
  function checkFormValidity() {
    const isValid = form.checkValidity();
    const isPastDateTime = isDateTimeInPast();
    
    if (isPastDateTime) {
      errorMessage.textContent = "Invalid input: date and time cannot be set to a past value.";
      errorMessage.style.display = "block";
      submitBtn.disabled = true;
    } else if (!isValid) {
      errorMessage.style.display = "block"; // Native HTML validation
      submitBtn.disabled = true;
    } else {
      errorMessage.style.display = "none"; // No issues
      submitBtn.disabled = false;
    }
  }

  // Listen for any changes in form fields to revalidate
  form.addEventListener("input", checkFormValidity);
  timeInput.addEventListener("change", checkFormValidity);
  
  // Trigger an initial check on page load
  dateInput.dispatchEvent(new Event("change"));

  // --- Confirmation screen logic ---
  const confirmation = document.getElementById("reference");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop page from reloading

    // Optional: log form submission
    console.log("Form submitted!");

    // Friendly field labels to display in summary
    const fieldLabels = {
      name: "Customer Name",
      phone: "Phone Number",
      pickup: "Pickup Location",
      snumber: "Street Number",
      unumber: "Unit Number",
      sbname: "Suburb",
      postcode: "Postcode",
      pudate: "Pickup Date",
      putime: "Pickup Time",
      dropoff: "Dropoff Location",
    };

    // Gather form data
    const formData = new FormData(form);

    // Send form data to backend booking handler
    fetch("booking.php", {
      method: "POST",
      body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
      // If booking is successful, show summary
      if (data.status === "success") {
        let summaryHTML = `<h2>Booking Confirmed</h2>`;
        summaryHTML += `<li><strong>Booking Number:</strong> ${data.booking_number}</li><ul>`;
        summaryHTML += `<li><strong>Status:</strong> <span id="live-status" class="unassigned">${data.booking_status}</span></li>`;

        // Loop through and show submitted fields with nice labels
        for (const [key, value] of Object.entries(data.formData)) {
          if (fieldLabels[key]) {
            let displayValue = value;

            // Format date for readability
            if (key === "pudate") {
              const [yyyy, mm, dd] = value.split("-");
              displayValue = `${dd}/${mm}/${yyyy}`;
            }

            summaryHTML += `<li><strong>${fieldLabels[key]}</strong>: ${displayValue}</li>`;
          }
        }

        summaryHTML += `</ul><button id="new-booking" class="btn">New Booking</button>`;

        // Replace form with confirmation summary
        confirmation.innerHTML = summaryHTML;
        form.style.display = "none";
        confirmation.style.display = "flex";

        // Begin polling for real-time booking status updates
        const bookingRef = data.booking_number;
        startStatusPolling(bookingRef);
      }
    })
    .catch((error) => {
      // Notify user if submission failed
      alert("Booking failed: " + error.message);
    });
  });

  // --- Allow user to make a new booking ---
  confirmation.addEventListener("click", (e) => {
    if (e.target.id === "new-booking") {
      form.reset(); // Reset all inputs

      // Reset Google Map to default view (Auckland)
      map.setCenter({ lat: -36.8485, lng: 174.7633 });
      map.setZoom(13);

      confirmation.style.display = "none"; // Hide confirmation
      form.style.display = "flex"; // Show form again
    }
  });
  
  // --- Booking status polling every 10 seconds ---
  function startStatusPolling(bookingRef) {
    const statusSpan = document.getElementById("live-status");

    const interval = setInterval(() => {
      fetch(`get_status.php?booking_ref=${encodeURIComponent(bookingRef)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && statusSpan) {
            statusSpan.textContent = data.status;

            // Stop polling if assigned
            if (data.status.toLowerCase() === "assigned") {
              clearInterval(interval);
              statusSpan.classList.remove("unassigned");
              statusSpan.classList.add("assigned");
            }
          }
        })
        .catch((err) => {
          console.error("Status check failed:", err);
        });
    }, 10000); // Every 10 seconds
  }
});
