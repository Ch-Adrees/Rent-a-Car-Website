import { auth, db, createUserWithEmailAndPassword, sendEmailVerification, collection, doc, setDoc } from './firebase_config.js';

document.getElementById('signupForm').addEventListener('submit', signUp);

function signUp(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    resetErrorMessages();

    if (!validateForm(fullName, email, password, confirmPassword)) {
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return sendEmailVerification(user).then(() => {
                // Use the correct Firestore methods to add user data
                const userDocRef = doc(collection(db, 'users'), user.uid);
                return setDoc(userDocRef, {
                    name: fullName.charAt(0).toUpperCase() + fullName.slice(1),
                    email: email
                });
            }).then(() => {
                alert("A verification email has been sent to your email address. Please verify to complete registration.");
                window.location.href = 'index.html';
            });
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
}

function validateForm(fullName, email, password, confirmPassword) {
    let valid = true;

    if (fullName.length === 0 || !/^[A-Z]/.test(fullName.charAt(0))) {
        document.getElementById('nameError').textContent = "Name must start with a capital letter.";
        valid = false;
    }
    if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = "Invalid email address.";
        valid = false;
    }
    if (password.length < 6) {
        document.getElementById('passwordError').textContent = "Password must be at least 6 characters long.";
        valid = false;
    }
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = "Passwords do not match.";
        valid = false;
    }

    return valid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function resetErrorMessages() {
    document.getElementById('nameError').textContent = "";
    document.getElementById('emailError').textContent = "";
    document.getElementById('passwordError').textContent = "";
    document.getElementById('confirmPasswordError').textContent = "";
    document.getElementById('errorMessage').textContent = "";
}

function togglePasswordVisibility(id) {
    const passwordField = document.getElementById(id);
    const toggleIcon = passwordField.nextElementSibling;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordField.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// Check if the script is correctly linked
console.log("signup.js is loaded.");
