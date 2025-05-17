/*
Student Christian Alejandro Hidalgo Gonzalez
Student ID 22187872
Course: COMP721 - Web Development
*/

// const for map, pickup and dropoff markers, directions route
let map,
  autocomplete,
  dpAutocomplete,
  pickupMarker,
  dropoffMarker,
  directionsService,
  directionsRenderer;

function initAutocomplete() {
  const center = { lat: -36.8485, lng: 174.7633 }; // Auckland, NZ

  // Create a bounding box with sides ~5km away from the center point
  const defaultBounds = {
    north: -36.3,
    south: -37.3,
    east: 175.1,
    west: 174.4,
  };

  // Initialize the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 13,
    disableDefaultUI: true, // This disables all default controls
  });

  // initialize directions service and renderer
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  // Setup autocomplete fields for pickup and dropoff
  const input = document.getElementById("autocomplete");
  const dpInput = document.getElementById("dpAutocomplete");
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "nz" },
    fields: ["address_components", "geometry", "name"],
    types: ["address"],
    strictBounds: true,
  };

  // attach autocomplete to input fields
  autocomplete = new google.maps.places.Autocomplete(input, options);
  dpAutocomplete = new google.maps.places.Autocomplete(dpInput, options);

  // add listeners to handle address selection
  autocomplete.addListener("place_changed", handlePickup);
  dpAutocomplete.addListener("place_changed", handleDropoff);
}

function handlePickup() {
  // Get the place details from the autocomplete object
  const place = autocomplete.getPlace();
  if (!place.geometry || !place.geometry.location) return;

  // Clear existing form values
  document.getElementById("snumber").value = "";
  document.getElementById("sbname").value = "";
  document.getElementById("postcode").value = "";

  // Extract useful components (street number, suburb, postcode)
  for (const component of place.address_components) {
    const componentType = component.types[0];
    if (componentType.includes("street_number")) {
      document.getElementById("snumber").value = component.long_name;
    }
    if (componentType.includes("locality")) {
      document.getElementById("sbname").value = component.long_name;
    }
    if (componentType.includes("postal_code")) {
      document.getElementById("postcode").value = component.long_name;
    }
  }

  // Create a temporary pickup marker if it doesn't exist
  if (!window.tempPickupMarker) {
    window.tempPickupMarker = new google.maps.Marker({
      map,
      animation: google.maps.Animation.DROP,
      title: "Pickup Location",
    });
  }

  // Position the marker and store pickup location for routing
  window.tempPickupMarker.setPosition(place.geometry.location);
  window.pickupLocation = place.geometry.location;

  // Zoom into selected pickup location
  map.setCenter(place.geometry.location);
  map.setZoom(15);
}

function handleDropoff() {
  // Get the place details from the autocomplete object
  const place = dpAutocomplete.getPlace();
  if (!place.geometry || !place.geometry.location) return;

  // Get the dropoff location and calculate route
  const dropoffLocation = place.geometry.location;

  if (window.pickupLocation && dropoffLocation) {
    const request = {
      origin: window.pickupLocation,
      destination: dropoffLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    // Request route and render if successful
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
      } else {
        console.error("Error fetching directions: " + status);
      }
    });

    // Remove the temporary pickup marker after route is shown
    if (window.tempPickupMarker) {
      window.tempPickupMarker.setMap(null);
      window.tempPickupMarker = null;
    }
  }
}
