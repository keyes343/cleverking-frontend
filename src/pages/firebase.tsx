import firebase from 'firebase';

let firebaseConfig = {
    apiKey: "AIzaSyB16tpFO2yo3vkjtFffIhwUawG20G0l8qA",
    authDomain: "cleverkings-e3eaf.firebaseapp.com",
    projectId: "cleverkings-e3eaf",
    storageBucket: "cleverkings-e3eaf.appspot.com",
    messagingSenderId: "1071774445158",
    appId: "1:1071774445158:web:f1631a13ff2d4967e8c7a7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;
