import { getDocs, addDoc, getDoc, query, collection, where, doc, db, auth, setDoc, Timestamp } from '../js/firebase_config.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    const params = new URLSearchParams(window.location.search);
    document.getElementById('car-name').value = params.get('name');
    document.getElementById('car-model').value = params.get('model');
    document.getElementById('car-number').value = params.get('number');
    document.getElementById('car-price').value = params.get('price');
    document.getElementById('car-company').value = params.get('company');

    $('#pickup-datetime').datetimepicker({
        icons: {
            time: 'fa fa-clock',
            date: 'fa fa-calendar',
            up: 'fa fa-arrow-up',
            down: 'fa fa-arrow-down'
        }
    });
    $('#dropoff-datetime').datetimepicker({
        icons: {
            time: 'fa fa-clock',
            date: 'fa fa-calendar',
            up: 'fa fa-arrow-up',
            down: 'fa fa-arrow-down'
        },
        useCurrent: false //Important! See issue #1075
    });
    $("#pickup-datetime").on("change.datetimepicker", function (e) {
        $('#dropoff-datetime').datetimepicker('minDate', e.date);
        updateTotalPrice();
    });
    $("#dropoff-datetime").on("change.datetimepicker", function (e) {
        $('#pickup-datetime').datetimepicker('maxDate', e.date);
        updateTotalPrice();
    });

    $('#driver').on('change', updateTotalPrice);

    document.getElementById('payment-method').addEventListener('change', function() {
        const selectedMethod = this.value;
        document.querySelectorAll('#payment-forms > div').forEach(form => {
            form.classList.add('d-none');
        });
        if (selectedMethod) {
            document.getElementById(`${selectedMethod}-form`).classList.remove('d-none');
        }
    });

    document.getElementById('reservation-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const fields = ['pickup-location', 'driver', 'payment-method'];
        let allFieldsFilled = true;
        fields.forEach(fieldId => {
            const fieldElement = document.getElementById(fieldId);
            if (!fieldElement.value || fieldElement.value.trim() === '') {
                fieldElement.classList.add('is-invalid');
                allFieldsFilled = false;
            } else {
                fieldElement.classList.remove('is-invalid');
            }
        });

        if (!allFieldsFilled) {
            alert('Please fill out all the required fields.');
            return;
        }

        const reservationDetails = {
            carName: document.getElementById('car-name').value,
            carModel: document.getElementById('car-model').value,
            carNumber: document.getElementById('car-number').value,
            carPrice: document.getElementById('car-price').value,
            carCompany: document.getElementById('car-company').value,
            pickupLocation: document.getElementById('pickup-location').value,
            driver: document.getElementById('driver').value,
            paymentMethod: document.getElementById('payment-method').value,
            pickupDateTime: $('#pickup-datetime').datetimepicker('viewDate').toDate(),
            dropoffDateTime: $('#dropoff-datetime').datetimepicker('viewDate').toDate(),
            totalPrice: parseFloat(document.getElementById('total-price').value.replace(/\D/g, '')),
        };

        if (!reservationDetails.pickupDateTime || !reservationDetails.dropoffDateTime) {
            alert('Please provide valid pickup and drop-off dates and times.');
            return;
        }

        try {
            const carQuery = query(collection(db, 'cars'), where('carName', '==', reservationDetails.carName));
            const carQuerySnapshot = await getDocs(carQuery);

            if (!carQuerySnapshot.empty) {
                const carDoc = carQuerySnapshot.docs[0]; // Assuming the first matching document
                const carRef = carDoc.ref;
                
                const reservationsQuery = query(
                    collection(carRef, 'reservations'),
                    where('pickupDateTime', '<=', reservationDetails.dropoffDateTime),
                    where('dropoffDateTime', '>=', reservationDetails.pickupDateTime)
                );

                const querySnapshot = await getDocs(reservationsQuery);

                if (querySnapshot.empty) {
                    await addReservation(reservationDetails, carRef);
                    await addUserReservation(reservationDetails);
                } else {
                    alert('Car is already reserved for the selected time slot.');
                }
            } else {
                alert('Car not found.');
            }
        } catch (error) {
            console.error('Error fetching car details or reservations:', error);
            alert('An error occurred while processing your request. Please try again later.');
        }
    });

    function updateTotalPrice() {
        const carPrice = parseFloat(document.getElementById('car-price').value.replace(/\D/g, ''));
        const driver = document.getElementById('driver').value;
        const pickupDateTime = $('#pickup-datetime').datetimepicker('viewDate');
        const dropoffDateTime = $('#dropoff-datetime').datetimepicker('viewDate');
        
        let totalPrice = 0;
        let days = 0;
        
        if (pickupDateTime && dropoffDateTime) {
            days = dropoffDateTime.diff(pickupDateTime, 'days');
            totalPrice += days * carPrice;
            // if (driver === 'with-driver') {
            //     totalPrice += 1000 * (days || 1); // If days is 0, charge for one day
            // }
        }
        
        if (driver === 'with-driver') {
            totalPrice += 1000 * (days || 1); // If days is 0, charge for one day
        }

        document.getElementById('total-price').value = `$${totalPrice}`;
    }


    async function addReservation(reservationDetails, carRef) {
        try {
            const reservationsCollection = collection(carRef, 'reservations');
            const reservationRef = doc(reservationsCollection);
            const pickupDateTime = Timestamp.fromDate(reservationDetails.pickupDateTime);
            const dropoffDateTime = Timestamp.fromDate(reservationDetails.dropoffDateTime);

            await setDoc(reservationRef, {
                pickupLocation: reservationDetails.pickupLocation,
                pickupDateTime: pickupDateTime,
                dropoffDateTime: dropoffDateTime,
                totalPrice: reservationDetails.totalPrice,
                driver: reservationDetails.driver,
                userId: auth.currentUser?.uid || null, 
            });
            alert('Car Reserved Successfully!');
        } catch (error) {
            console.error('Error adding reservation:', error);
            alert('An error occurred while adding the reservation. Please try again later.');
        }
    }

    async function addUserReservation(reservationDetails) {
        try {
            const userId = auth.currentUser?.uid || null;
            if (userId) {
                const userDocRef = doc(db, 'users', userId);
                const userReservationsCollection = collection(userDocRef, 'reservations');
                const userReservationRef = doc(userReservationsCollection);
                const pickupDateTime = Timestamp.fromDate(reservationDetails.pickupDateTime);
                const dropoffDateTime = Timestamp.fromDate(reservationDetails.dropoffDateTime);

                await setDoc(userReservationRef, {
                    carName: reservationDetails.carName,
                    carModel: reservationDetails.carModel,
                    carNumber: reservationDetails.carNumber,
                    carPrice: reservationDetails.carPrice,
                    carCompany: reservationDetails.carCompany,
                    pickupLocation: reservationDetails.pickupLocation,
                    pickupDateTime: pickupDateTime,
                    dropoffDateTime: dropoffDateTime,
                    totalPrice: reservationDetails.totalPrice,
                    driver: reservationDetails.driver,
                    paymentMethod: reservationDetails.paymentMethod,
                });
            }
        } catch (error) {
            console.error('Error adding reservation to user:', error);
        }
    }
});
