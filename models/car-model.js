export class CarModel {
  constructor(carName, carModel, carPricePerDay, carCompany, carImage, carNumber,carLocation,isAvailable,isDeleted) {
      this.carName = carName;
      this.carModel = carModel;
      this.carPricePerDay = carPricePerDay;
      this.carCompany = carCompany;
      this.carImage = carImage;
      this.carNumber = carNumber;
      this.carLocation=carLocation;
      this.isAvailable=isAvailable;
      this.isDeleted=isDeleted;
}
}
