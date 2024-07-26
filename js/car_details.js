import { getDocs, getDoc, query, collection, where, doc, db, auth } from '../js/firebase_config.js';
import { CarModel } from '../models/car-model.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const carNumber = urlParams.get('carNumber');

  if (!carNumber) {
    console.error("No carNumber provided in URL parameters.");
    return;
  }

  try {
    const carsCollection = collection(db, 'cars');
    const carQuery = query(carsCollection, where('carNumber', '==', carNumber));
    const querySnapshot = await getDocs(carQuery);

    if (!querySnapshot.empty) {
      const carDoc = querySnapshot.docs[0]; // Assuming carNumber is unique
      const carData = carDoc.data();
      const car = new CarModel(
        carData.carName,
        carData.carModel,
        carData.carPricePerDay,
        carData.carCompany,
        carData.carImage,
        carData.carNumber,
        carData.carLocation,
        carData.isAvailable,
        carData.isDeleted
      );

      document.getElementById('car-image').style.backgroundImage = `url(${car.carImage})`;
      document.getElementById('car-name').textContent = car.carName;
      document.getElementById('car-model').textContent = car.carModel;
      document.getElementById('car-price').textContent = `$${car.carPricePerDay} per day`;
      document.getElementById('car-company').textContent = car.carCompany;
      document.getElementById('car-location').textContent = car.carLocation;
      document.getElementById('car-number').textContent = car.carNumber;

      const isAdmin = await checkIfAdmin();
      if (isAdmin) {
        // document.getElementById('user-actions').style.display = 'none';
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error getting car document:", error);
  }
});

async function checkIfAdmin() {
  const user = auth.currentUser;
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.isAdmin === true;
      }
    } catch (error) {
      console.error("Error getting user document:", error);
    }
  }
  return false;
}

document.getElementById('reserve-button').addEventListener('click', () => {
  const carName = document.getElementById('car-name').textContent;
  const carModel = document.getElementById('car-model').textContent;
  const carPrice = document.getElementById('car-price').textContent;
  const carCompany = document.getElementById('car-company').textContent;
  const carNumber = document.getElementById('car-number').textContent;

  const params = new URLSearchParams({
      name: carName,
      model: carModel,
      price: carPrice,
      company: carCompany,
      number: carNumber
  }).toString();

  window.location.href = `reservation.html?${params}`;
});
