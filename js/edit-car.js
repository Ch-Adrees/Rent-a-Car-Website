import { CarModel } from "../models/car-model.js";
import {
  collection,
  db,
  ref,
  uploadBytes,
  getDownloadURL,
  addDoc,
  storage,
  uploadBytesResumable,
} from "../js/firebase_config.js";
import { Components } from "../Components/componets.js";

const button = document.getElementById("submit");

function makeobjectOfCar() {
  const carName = document.getElementById("carName").value;
//   console.log(carName);
  const carModel = document.getElementById("carModel").value;
//   console.log(carModel);

  const carPricePerDay = document.getElementById("carPricePerDay").value;
 // console.log(carPricePerDay);

  const carCompany = document.getElementById("carCompany").value;
 // console.log(carCompany);

  const carLocation = document.getElementById("carLocation").value;
 // console.log(carLocation);

  const carNumber = document.getElementById("carNumber").value;
 // console.log(carNumber);

  const carImage = document.getElementById("fileInput").files[0];
 // console.log(carImage);

  const car=new CarModel(carName,carModel,carPricePerDay,carCompany,carImage,carNumber,carLocation,true,false);
 console.log("Car data before Compilation",car);

  // Log the car object to the console
  

  return car;
}

const carForm = document.getElementById("carForm");
carForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the default form submission
  button.innerHTML = "Loading......";
  const car = makeobjectOfCar();
  console.log("After Compilation",car);
  storeCarInfirebase(car);
 
  // getAllCarsFromFirebase();
  //carForm.reset();
});

async function storeCarInfirebase(car) {
  try {
   const imageUrl= await Components.uploadImageToFirebase(car.carImage,car.carImage.type,ref,uploadBytes,getDownloadURL,car.carNumber,uploadBytesResumable);
    console.log(imageUrl);

    //  Components.uploadFile(car.carImage,storage);
    const carData = {
      carName: car.carName,
      carModel: car.carModel,
      carCompany: car.carCompany,
      carPricePerDay: car.carPricePerDay,
      carLocation: car.carLocation,
      carNumber: car.carNumber,
      carImage: imageUrl,
      isDeleted: car.isDeleted,
      isAvailable: car.isAvailable,
    };
    

    await addDoc(collection(db, "cars"), carData);
    button.innerHTML = "Submit";
    console.log(carData);
    alert("car has been Stored Successfully");
  } catch (error) {
    console.error("Error storing Car :", error);
    alert("Error Entering Car:", error);
  }
}
