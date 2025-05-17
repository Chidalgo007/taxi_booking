# 🚖 Simple Taxi Booking System

An interactive, real-time **taxi booking system** built with HTML, CSS, JavaScript, and PHP — designed for both customers and administrators. Featuring **Google Maps integration** for address prediction and route display, live booking reference generation, and automated status updates.

![Taxi Booking Banner](https://your-image-url.com/banner.png)

---

## 📌 Features

### 👤 **Client Side**
- 📍 Google Maps Places Autocomplete for pickup/dropoff
- 🗺️ Route visualized from Point A to B
- ✅ Validates user input and confirms bookings
- 🧾 Generates a unique **Booking Reference (BRNxxxxx)**
- 🔄 Booking status updates automatically upon assignment

### 🔐 **Admin Side**
- 🔍 Search bookings by:
  - Booking Reference
  - Customer Name
  - Phone Number
- ⏰ See bookings scheduled within the next **2 hours**
- ✅ One-click assignment of bookings
- 📡 Status auto-synced with the client interface

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | API |
|----------|---------|----------|-----|
| HTML5, CSS3, JavaScript | PHP (Vanilla) | MySQL via PDO | Google Maps JavaScript API (Places + Directions) |

---

## 🧠 How It Works

1. **User** fills out a booking form with pickup/dropoff details.
2. **Google Maps** predicts and autocompletes the address.
3. Upon submission:
   - Input is validated
   - Booking ref is generated
   - Record is saved in MySQL
4. **Admin dashboard** shows bookings in the next 2 hours.
5. Admin can:
   - Search using name, phone, or booking ref
   - Assign bookings with one click
6. Status changes are **immediately visible** to clients.

---

## 📸 Screenshots

> Replace these links with your own screenshots

### 🚕 Booking Form  
![Booking Form](https://your-image-url.com/form.png)

### 🛠️ Admin Dashboard  
![Admin Panel](https://your-image-url.com/admin.png)

---

## 🚀 Getting Started

### Prerequisites
- PHP 7.x+
- MySQL
- Google Maps API Key

### Installation

```bash
git clone https://github.com/your-username/taxi-booking-system.git
cd taxi-booking-system
