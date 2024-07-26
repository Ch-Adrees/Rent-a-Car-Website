import { auth, db, signInWithEmailAndPassword, sendPasswordResetEmail, doc, getDoc, setDoc, updateDoc } from './firebase_config.js';

function showErrorDialog(message) {
    const dialog = document.getElementById('error-dialog');
    const errorMessage = document.getElementById('error-message');
    if (dialog && errorMessage) {
        errorMessage.textContent = message;
        dialog.style.display = 'block';
    }
}

function hideErrorDialog() {
    const dialog = document.getElementById('error-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

document.querySelector('.close-button')?.addEventListener('click', hideErrorDialog);

function handleAuthError(error) {
    console.error('FirebaseAuthException code:', error.code);

    switch (error.code) {
        case 'auth/invalid-email':
            document.getElementById('email-error').textContent = 'The email address is not valid.';
            break;
        case 'auth/user-not-found':
            document.getElementById('email-error').textContent = 'User not found. Please check your credentials.';
            break;
        case 'auth/wrong-password':
            document.getElementById('password-error').textContent = 'Incorrect password. Please try again.';
            break;
        case 'auth/user-disabled':
            showErrorDialog('This account has been disabled. Please contact support.');
            break;
        case 'auth/too-many-requests':
            showErrorDialog('Too many attempts. Please try again later.');
            break;
        case 'auth/operation-not-allowed':
            showErrorDialog('This sign-in method is not allowed. Please contact support.');
            break;
        case 'auth/weak-password':
            document.getElementById('password-error').textContent = 'The password is too weak. Please choose a stronger password.';
            break;
        case 'auth/email-already-in-use':
            showErrorDialog('This email is already in use. Please use a different email.');
            break;
        case 'auth/account-exists-with-different-credential':
            showErrorDialog('An account already exists with the same email address but different sign-in credentials. Please use a different sign-in method.');
            break;
        case 'auth/invalid-credential':
            showErrorDialog('The supplied auth credential is incorrect, malformed, or has expired.');
            break;
        case 'auth/invalid-verification-code':
            showErrorDialog('The verification code is invalid.');
            break;
        case 'auth/invalid-verification-id':
            showErrorDialog('The verification ID is invalid.');
            break;
        case 'auth/invalid-login-credentials':
            showErrorDialog('Invalid login credentials. Please check your email and password.');
            break;
        default:
            showErrorDialog('An undefined error occurred. Please try again.');
    }
}

// Sign-in with email and password
document.getElementById('signin-form')?.addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Clear previous error messages
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';

    // Check for internet connection
    if (!navigator.onLine) {
        showErrorDialog('Internet connection is unstable or unavailable.');
        return;
    }

    // Disable form and show loading indicator
    disableForm(true);
    signInWithEmailAndPassword(auth, email, password)
        .then(async userCredential => {
            const user = userCredential.user;
            if (user) {
                // Special check for admin login
                if (email === 'alizayn865@gmail.com' && password === '123456') {
                    window.location.href = 'admin.html';
                    return;
                }

                const userDoc = doc(db, 'users', user.uid);
                const docSnapshot = await getDoc(userDoc);

                if (!docSnapshot.exists()) {
                    await setDoc(userDoc, { email: user.email}); // Default isAdmin to false
                }
                await updateDoc(userDoc, { isLoggedIn: true });

                if (!user.emailVerified) {
                    showErrorDialog('Please verify your email.');
                } else {
                    const userData = docSnapshot.data();
                    localStorage.setItem('user', JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        isLoggedIn: true
                    }));

                    if (userData.isAdmin) {
                        window.location.href = 'admin.html'; // Redirect to admin home screen
                    } else {
                        window.location.href = 'homepage.html'; // Redirect to user home screen
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error signing in:', error);
            if (error.code) {
                handleAuthError(error);
            } else {
                showErrorDialog('Failed to sign in. Please try again later.');
            }
        })
        .finally(() => {
            // Re-enable form
            disableForm(false);
        });
});

// Reset password
document.getElementById('forgot-password')?.addEventListener('click', function () {
    const email = document.getElementById('email').value;
    if (email) {
        // Disable form and show loading indicator
        disableForm(true);

        sendPasswordResetEmail(auth, email)
            .then(() => {
                showErrorDialog('Password reset email sent.');
            })
            .catch(error => {
                console.error('Error sending password reset email:', error);
                if (error.code) {
                    handleAuthError(error);
                } else {
                    showErrorDialog('Error: ' + error.message);
                }
            })
            .finally(() => {
                // Re-enable form
                disableForm(false);
            });
    } else {
        showErrorDialog('Please enter your email to reset password.');
    }
});

function disableForm(disable) {
    const formElements = document.querySelectorAll('input, button');
    formElements.forEach(element => {
        element.disabled = disable;
    });
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        if (disable) {
            loadingIndicator.style.display = 'block';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }
}
