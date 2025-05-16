/*
Student Christian Alejandro Hidalgo Gonzalez
Student ID 22187872
Course: COMP721 - Web Development
*/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");
  const submitBtn = form.querySelector("button[type='submit']");
  const dateInput = document.getElementById("pudate");
  const timeInput = document.getElementById("putime");
  const errorMessage = document.getElementById("error-message");

  // Set today date as min for the date input
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  dateInput.min = today;

  // Function to check if the selected date and time are in the past
  function isDateTimeInPast() {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;
    
    if (!selectedDate || !selectedTime) return false;
    
    const now = new Date();
    const selected = new Date(`${selectedDate}T${selectedTime}`);
    
    return selected < now;
  }

  // When the date changes, adjust min time if today
  dateInput.addEventListener("change", () => {
    const selectedDate = dateInput.value;
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    if (selectedDate === today) {
      timeInput.min = currentTime;
    } else {
      timeInput.min = "00:00"; // Reset to allow any time for future dates
    }
    
    checkFormValidity();
  });

  // Check if the form is valid
  function checkFormValidity() {
    const isValid = form.checkValidity();
    const isPastDateTime = isDateTimeInPast();
    
    if (isPastDateTime) {
      errorMessage.textContent = "Invalid input: date and time cannot be set to a past value.";
      errorMessage.style.display = "block";
      submitBtn.disabled = true;
    } else if (!isValid) {
      errorMessage.style.display = "block";
      submitBtn.disabled = true;
    } else {
      errorMessage.style.display = "none";
      submitBtn.disabled = false;
    }
  }

  // Listen for changes in all form inputs
  form.addEventListener("input", checkFormValidity);
  timeInput.addEventListener("change", checkFormValidity);
  
  // Trigger validation check on page load
  dateInput.dispatchEvent(new Event("change"));

  // Confirmation screen
  const confirmation = document.getElementById("reference");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload and delete map
    console.log("Form submitted!");
    
    // Custom field labels names
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

    const formData = new FormData(form);

    fetch("booking.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          let summaryHTML = `<h2>Booking Confirmed</h2>`;
          summaryHTML += `<li><strong>Booking Number:</strong> ${data.booking_number}</li><ul>`;
          summaryHTML += `<li><strong>Status:</strong> <span id="live-status" class="unassigned">${data.booking_status}</span></li>`;

          for (const [key, value] of Object.entries(data.formData)) {
            if (fieldLabels[key]) {
              let displayValue = value;
              if (key === "pudate") {
                const [yyyy, mm, dd] = value.split("-");
                displayValue = `${dd}/${mm}/${yyyy}`;
              }
              summaryHTML += `<li><strong>${fieldLabels[key]}</strong>: ${displayValue}</li>`;
            }
          }
          summaryHTML += `</ul><button id="new-booking" class="btn">New Booking</button>`;
          confirmation.innerHTML = summaryHTML;
          form.style.display = "none";
          confirmation.style.display = "flex";
          const bookingRef = data.booking_number;
          startStatusPolling(bookingRef);
        }
      })
      .catch((error) => {
        alert("Booking failed: " + error.message);
      });
  });

  // Cancel Booking — show form again and reset marker/map
  confirmation.addEventListener("click", (e) => {
    if (e.target.id === "new-booking") {
      form.reset();
      map.setCenter({ lat: -36.8485, lng: 174.7633 }); // Reset to Auckland
      map.setZoom(13);
      confirmation.style.display = "none";
      form.style.display = "flex"; // Show form again
    }
  });
  
  // Check Status automatically every 10 seconds
  function startStatusPolling(bookingRef) {
    const statusSpan = document.getElementById("live-status");
    const interval = setInterval(() => {
      fetch(`get_status.php?booking_ref=${encodeURIComponent(bookingRef)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && statusSpan) {
            statusSpan.textContent = data.status;

            // Stop polling once assigned
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
    }, 10000); // check every 10 seconds
  }
});