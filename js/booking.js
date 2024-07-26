import { collection, db, getDocs } from "../js/firebase_config.js";

document.addEventListener("DOMContentLoaded", async function () {
  const loader = document.getElementById("loader");
  const noBookingsMessage = document.getElementById("no-bookings");
  loader.style.display = "block";
  noBookingsMessage.style.display = "none";
  
  try {
    await getAllReservations();
  } finally {
    loader.style.display = "none";
  }
});

async function getAllReservations() {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";

  try {
    const carsCollection = collection(db, "cars");
    const cars = await getDocs(carsCollection);
    let bookingCount = 0;

    for (const doc of cars.docs) {
      const carId = doc.id;
      const carData = doc.data();
      const reservationsCollection = collection(db, `cars/${carId}/reservations`);
      const reservationsSnapshot = await getDocs(reservationsCollection);
      
      for (const reservationDoc of reservationsSnapshot.docs) {
        const reservationData = reservationDoc.data();
        console.log(reservationData);
        const userData = await fetchDocumentData(reservationData.userId);
        const card = bookingCar(
          userData.name,
          userData.email,
          carData.carName,
          carData.carNumber,
          reservationData.totalPrice,
          reservationData.driver,
          reservationData.pickupDateTime,
          reservationData.dropoffDateTime
        );
        cardContainer.appendChild(card);
        bookingCount++;
      }
    }

    if (bookingCount === 0) {
      document.getElementById("no-bookings").style.display = "block";
    }

  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

function bookingCar(
  userName,
  userEmail,
  carName,
  carPrice,
  totalPrice,
  withDriver,
  pickupDateTime,
  dropofDateTime
) {
  const fromDate = pickupDateTime.toDate();
  const toDate = dropofDateTime.toDate();
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  };
  const formattedFromDate = fromDate.toLocaleString('en-US', options);
  const formattedToDate = toDate.toLocaleString('en-US', options);
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h2>Reserved by: ${userName}</h2>
    <p><span class="label">Email:</span>&nbsp;&nbsp; ${userEmail}</p>
    <p><span class="label">Car:</span>&nbsp;&nbsp; ${carName}</p>
    <p><span class="label">Car Number:</span>&nbsp;&nbsp; ${carPrice}</p>
    <p><span class="label">From:</span>&nbsp;&nbsp; ${formattedFromDate}</p>
    <p><span class="label">To:</span>&nbsp;&nbsp; ${formattedToDate}</p>
    <p class="driver"><span class="label">Driver:</span>&nbsp;&nbsp; ${withDriver}</p>
    <div class="price-wrapper">
      <p class="price"><span class="label">Total Price:</span>&nbsp;&nbsp;$${totalPrice}</p>
    </div>
  `;
  return card;
}

async function fetchDocumentData(documentId) {
  try {
    const userCollection = collection(db, 'users');
    const users = await getDocs(userCollection);
    let userData = '';
    for (const doc of users.docs) {
      if (doc.id === documentId) {
        userData = doc.data();
      }
    }
    console.log("userData", userData);
    return userData;
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}
