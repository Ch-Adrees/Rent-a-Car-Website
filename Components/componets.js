import {
  collection,
  db,
  query,
  where,
  getDocs,
  storage,
  updateDoc,
  uploadBytesResumable,
} from "../js/firebase_config.js";
import { CarModel } from "../models/car-model.js";

export class Components {
  static async getAllCarsFromFirebase() {
    const carsCollection = collection(db, "cars");
    const carQuery = query(carsCollection, where("isDeleted", "==", false));
    const carSnapshot = await getDocs(carQuery);
    const carList = carSnapshot.docs.map((doc) => {
      const data = doc.data();
      return new CarModel(
        data.carName,
        data.carModel,
        data.carPricePerDay,
        data.carCompany,
        data.carImage,
        data.carNumber,
        data.carLocation,
        data.isAvailable,
        data.isDeleted
      );
    });
    console.log(carList);

    return carList;
  }

  static createCar(car, userType) {
    const card = document.createElement("div");
    card.className = "card";
    if (userType == "user") {
      card.style.cursor = "pointer";
      card.onclick = () => {
        window.location.href = `car_details.html?carNumber=${car.carNumber}`;
      };
    }

    if (userType == "admin") {
      //delete button
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.innerHTML = '<i class="bx bx-trash"></i>';
      deleteButton.onclick = () => {
        card.remove();
        this.deleteCar(car.carNumber);
      };
      card.appendChild(deleteButton);
    }
    // Image
    const img = document.createElement("img");
    img.src = car.carImage;
    img.alt = car.carName;
    card.appendChild(img);

    // Card body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Title
    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = car.carName;
    cardBody.appendChild(cardTitle);

    // Model
    const cardModel = document.createElement("p");
    cardModel.className = "card-text";
    cardModel.textContent = `Model: ${car.carModel}`;
    cardBody.appendChild(cardModel);

    // Price
    const cardPricePerDay = document.createElement("p");
    cardPricePerDay.className = "card-text bold-text";
    cardPricePerDay.textContent = `Price: $${car.carPricePerDay} per day`;

    // Company
    const cardCompany = document.createElement("p");
    cardCompany.className = "card-text";
    cardCompany.textContent = `Company: ${car.carCompany}`;
    cardBody.appendChild(cardCompany);
    //car Location
    const cardLocation = document.createElement("p");
    cardLocation.className = "card-text";
    cardLocation.textContent = `Location: ${car.carLocation}`;
    cardBody.appendChild(cardLocation);
    //car number
    const carNumber = document.createElement("p");
    carNumber.className = "card-text";
    carNumber.textContent = `Car Number: ${car.carNumber}`;
    cardBody.appendChild(carNumber);
    cardBody.appendChild(cardPricePerDay);
    card.appendChild(cardBody);

    const editButtonContainer = document.createElement("div");
    editButtonContainer.className = "edit-button-container";
    // Edit button
    const editButton = document.createElement("button");
    editButton.className = "edit-button";
    editButton.id = "edit-button";
    if (userType == "admin") {
      editButton.textContent = "Edit";
    } else {
      editButton.textContent = "Reserve Car";
    }
    editButtonContainer.appendChild(editButton);
    // Add card body to card

    card.appendChild(editButtonContainer);

    editButton.onclick = () => {
      this.buttonOnClick(userType, car.carPricePerDay, car.carNumber);
    };

    return card;
  }

  static createCars(carList, userType) {
    let carContainer = "car-container";
    if (userType == "user") {
      carContainer = "cars-container";
    } else {
      carContainer = "car-container";
    }
    const container = document.getElementById(carContainer);
    container.innerHTML = ""; // Clear previous content

    carList.forEach((car) => {
      const card = Components.createCar(car, userType);
      container.appendChild(card);
    });
  }
  // Function to Upload the Image in the Firebase
  // Get the file input element

  // Function to upload the file to Firebase
  static async readFileAndUpload(
    file,
    ref,
    uploadBytes,
    getDownloadURL,
    carNumber
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;

          const imageUrl = await Components.uploadImageToFirebase(
            base64String,
            file.name,
            file.type,
            ref,
            uploadBytes,
            getDownloadURL,
            carNumber
          );
          resolve(imageUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
  static async uploadImageToFirebase(
    file,
    fileType,
    ref,
    uploadBytes,
    getDownloadURL,
    carNumber,
    uploadBytesResumable
  ) {
    try {
      const storageRef = ref(storage, "Images/" + carNumber);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: fileType,
      });
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.log("Error Uploading File ", error);
      throw error;
    }
  }

  static async getAllCarsForUser() {
    const carsCollection = collection(db, "cars");
    const carQuery = query(
      carsCollection,
      where("isDeleted", "==", false),
      where("isAvailable", "==", true)
    );
    const carSnapshot = await getDocs(carQuery);
    const carList = carSnapshot.docs.map((doc) => {
      const data = doc.data();
      return new CarModel(
        data.carName,
        data.carModel,
        data.carPricePerDay,
        data.carCompany,
        data.carImage,
        data.carNumber,
        data.carLocation,
        data.isAvailable,
        data.isDeleted
      );
    });
    console.log(carList);

    return carList;
  }

  static async deleteCar(carNumber) {
    const carsCollection = collection(db, "cars");
    const carQuery = query(carsCollection, where("carNumber", "==", carNumber));
    try {
      const querySnapshot = await getDocs(carQuery);
      querySnapshot.forEach(async (doc) => {
        // Update the document where carNumber matches
        await updateDoc(doc.ref, { isDeleted: true });
        console.log(`Car with carNumber ${carNumber} marked as deleted.`);
        alert("Deleted Successfully");
      });
    } catch (error) {
      console.error("Error marking car as deleted:", error);
      throw error;
    }
  }

  static buttonOnClick(userType, carPricePerDay, carNumber) {
    if (userType == "user") {
      window.location.href = "reservation.html";
    } else {
      const sideBar = document.getElementById("sidebar");
      if (sideBar.style.right === "-250px") {
        sideBar.style.right = "0";
        const input = document.getElementById("edit-input");
        input.value = carPricePerDay;
        const saveBtn = document.getElementById("save-btn");
        saveBtn.onclick = () => {
          const newPrice = input.value;
          this.updatePrice(newPrice, carNumber);
        };
      } else {
        sideBar.style.right = "-250px";
      }
    }
  }

  static async updatePrice(carPricePerDay, carNumber) {
    const carsCollection = collection(db, "cars");
    const carQuery = query(carsCollection, where("carNumber", "==", carNumber));
    try {
      const querySnapshot = await getDocs(carQuery);
      querySnapshot.forEach(async (doc) => {
        // Update the document where carNumber matches
        await updateDoc(doc.ref, { carPricePerDay: carPricePerDay });
        console.log(`Car with carNumber ${carNumber} Updated .`);
        alert("updated  Successfully");
      });
    } catch (error) {
      console.log("Error:", error);
    }
  }

  static saveupdatedValue() {
    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener("click", async function () {
      await this.updatePrice(carPricePerDay, carNumber);
    });
  }
}
