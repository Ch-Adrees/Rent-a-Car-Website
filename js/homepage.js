import { db, collection, query, where, getDocs, getDoc, doc } from "./firebase_config.js";
import { Components } from "../Components/componets.js";

document.addEventListener("DOMContentLoaded", async function () {
    const allCars = await Components.getAllCarsFromFirebase();
    Components.createCars(allCars, "user");

    document.getElementById("search-button").addEventListener("click", async function () {
        const location = document.querySelector("select.custom-select").value.toLowerCase();
        const carName = document.getElementById("car-name").value;
        const pickupDate = document.querySelector("#pickup-datetime").value;

        // Show loader
        document.getElementById("loader").style.display = "block";
        document.getElementById("cars-container").innerHTML = ""; // Clear previous results

        const filteredCars = await searchCars(location, carName, pickupDate);
        
        // Hide loader
        document.getElementById("loader").style.display = "none";

        if (filteredCars.length === 0) {
            // Show no results message
            document.getElementById("no-results").style.display = "block";
        } else {
            // Hide no results message
            document.getElementById("no-results").style.display = "none";
            Components.createCars(filteredCars, "user");
        }
    });
});

async function searchCars(location, carName, pickupDate) {
    let carQuery = collection(db, "cars");
    let constraints = [];
    constraints.push(where("isDeleted", "==", false));

    if (location) {
        constraints.push(where("carLocation", "==", location));
    }

    if (carName) {
        constraints.push(where("carName", ">=", carName));
        constraints.push(where("carName", "<=", carName + '\uf8ff'));
    }

    if (constraints.length > 0) {
        carQuery = query(carQuery, ...constraints);
    }

    const snapshot = await getDocs(carQuery);
    let cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (pickupDate) {
        const selectedPickupDate = new Date(pickupDate).toISOString().split('T')[0]; // Get only the date part

        // Create a new array to store the cars that are available on the selected date
        let availableCars = [];

        for (let car of cars) {
            const reservationsRef = collection(db, `cars/${car.id}/reservations`);
            const reservationsSnapshot = await getDocs(reservationsRef);

            // Check if reservations subcollection exists
            if (reservationsSnapshot.empty) {
                // If no reservations exist, the car is available
                availableCars.push(car);
            } else {
                let isAvailable = true;

                for (let reservationDoc of reservationsSnapshot.docs) {
                    const reservation = reservationDoc.data();
                    const reservationPickupDate = reservation.pickupDateTime.toDate().toISOString().split('T')[0];
                    const reservationDropDate = reservation.dropoffDateTime.toDate().toISOString().split('T')[0];

                    if (selectedPickupDate >= reservationPickupDate && selectedPickupDate <= reservationDropDate) {
                        isAvailable = false;
                        break;
                    }
                }

                if (isAvailable) {
                    availableCars.push(car);
                }
            }
        }

        return availableCars;
    }

    return cars;
}
