import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  getDocs,
  query,
  doc,
  setDoc,
  getDoc,
  getFirestore,
  Timestamp,
  updateDoc,
  collection,
  where,
} from "firebase/firestore";

import { auth } from "./firebase.js";

/* ========== REVIEW CLASS DECLARATION =========== */

export default class Review {
  constructor(title, body, rating, user, createdAt, diningHall, uid) {
    this.title = title;
    this.body = body;
    this.rating = rating;
    this.user = user;
    this.createdAt = createdAt;
    this.diningHall = diningHall;
    this.uid = uid;
  }
}

/* ========== HELPER FUNCTIONS =========== */

export const readableDate = (dateParam) => {
  var dateString = dateParam.toString();
  var dateArr = dateString.split(" ");
  var date = `${dateArr[1]} ${dateArr[2]}, ${dateArr[3]}`;
  var timeArr = dateArr[4].substring(0, 5).split(":");
  var subscript = timeArr[0] < 12 ? "AM" : "PM";
  var hourNum = (timeArr[0] % 12 < 10 ? "0" : "") + (timeArr[0] % 12);
  var time = `${hourNum}:${timeArr[1]}`;
  return `${time} ${subscript} - ${date}`;
};

export function diningPeriod(diningTime) {
  const hour = diningTime.substring(0, 2);
  const period = diningTime.substring(6, 8);
  var mealPeriod;
  /* covering even non-period times to account for late reviews */
  if (hour >= 7 && hour < 11 && period === "AM") {
    mealPeriod = "B";
  } else if ((hour >= 11 && period === "AM") || (hour < 5 && period === "PM")) {
    mealPeriod = "L";
  } else if (hour >= 5 && hour < 9 && period === "PM") {
    mealPeriod = "D";
  } else {
    mealPeriod = "ED";
  }
  const date = diningTime.substring(12);
  return mealPeriod + date;
}

/* ========== GETTING REVIEW FUNCTIONS =========== */

export async function createReview(review) {
  review.id = "id" + new Date().getTime();
  const time = readableDate(Timestamp.now().toDate());
  const db = getFirestore();
  try {
    await setDoc(doc(db, "reviews", review.id), {
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      diningHall: review.diningHall,
      user: review.name,
      uid: review.uid,
      createdAt: time,
    });
    const docRef = doc(db, "users", review.uid);
    const docSnap = await getDoc(docRef);
    await updateDoc(doc(db, "users", review.uid), {
      reviews: [...docSnap.data().reviews, review.id],
    });
    addLastDining(review.uid, time);
    return true;
  } catch (error) {

  }
}

export async function getReviews() {
  const db = getFirestore();
  const reviews = [];
  const querySnapshot = await getDocs(collection(db, "reviews"));
  querySnapshot.forEach((doc) => {
    reviews.push(
      new Review(
        doc.data().title,
        doc.data().body,
        doc.data().rating,
        doc.data().user,
        doc.data().createdAt,
        doc.data().diningHall
      )
    );
  });
  return reviews;
}

export async function getUserReviews(uid) {
  const db = getFirestore();
  const reviews = [];
  const querySnapshot = await getDocs(collection(db, "reviews"));
  querySnapshot.forEach((doc) => {
    if (doc.data().uid === uid) {
      reviews.push(
        new Review(
          doc.data().title,
          doc.data().body,
          doc.data().rating,
          doc.data().user,
          doc.data().createdAt,
          doc.data().diningHall
        )
      );
    }
  });
  return reviews;
}

export async function getHallReviews(hall) {
  const db = getFirestore();
  const reviews = [];
  const querySnapshot = await getDocs(collection(db, "reviews"));
  querySnapshot.forEach((doc) => {
    if (doc.data().diningHall === hall) {
      reviews.push(
        new Review(
          doc.data().title,
          doc.data().body,
          doc.data().rating,
          doc.data().user,
          doc.data().createdAt,
          doc.data().diningHall
        )
      );
    }
  });
  return reviews;
}

export async function getRatingReviews(rating) {
  const db = getFirestore();
  const reviews = [];
  const querySnapshot = await getDocs(collection(db, "reviews"));
  querySnapshot.forEach((doc) => {
    if (doc.data().rating === rating) {
      reviews.push(
        new Review(
          doc.data().title,
          doc.data().body,
          doc.data().rating,
          doc.data().user,
          doc.data().createdAt,
          doc.data().diningHall
        )
      );
    }
  });
  return reviews;
}

/* ========== MEAL TRACKING FUNCTIONS =========== */

export async function createDining(location, uid) {
  let id = "id" + new Date().getTime();
  const db = getFirestore();
  try {
    await setDoc(doc(db, "dining", id), {
      uid: uid,
      diningHall: location,
      createdAt: readableDate(Timestamp.now().toDate()),
    });
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    await updateDoc(doc(db, "users", uid), {
      dining: [...docSnap.data().dining, id],
    });
  } catch (error) {
    console.log(error);
  }
  try {
    const docRef = doc(db, "diningTotals", location);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(doc(db, "diningTotals", location), {
        total: 1,
      });
    } else {
      await updateDoc(doc(db, "diningTotals", location), {
        total: docSnap.data().total + 1,
      });
    }
    return true;
  } catch (error) {
  }
}

export async function getUserMeals(uid) {
  const db = getFirestore();
  const meals = [];
  const querySnapshot = await getDocs(collection(db, "dining"));
  querySnapshot.forEach((doc) => {
    if (doc.data().uid === uid) {
      meals.push({
        location: doc.data().diningHall,
        createdAt: doc.data().createdAt,
      });
    }
  });
  return meals;
}

export async function getDiningTotals() {
  const db = getFirestore();
  const meals = [];
  const querySnapshot = await getDocs(collection(db, "diningTotals"));
  querySnapshot.forEach((doc) => {
    meals.push({
      location: doc.id,
      total: doc.data().total,
    });
  });
  return meals;
}
/* ========== USER SIGN-IN FUNCTIONS =========== */
/* inspired by https://blog.logrocket.com/user-authentication-firebase-react-apps/ */

export async function googleSignIn() {
  const googleProvider = new GoogleAuthProvider();
  const db = getFirestore();
  try {
    const account = await signInWithPopup(auth, googleProvider);
    const user = account.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
        bio: "",
        dining: [],
        reviews: [],
        image: user.photoURL,
        favDining1: "",
        favDining2: "",
        lastDining: "",
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

export async function emailSignIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

export async function emailRegister(name, email, password) {
  const db = getFirestore();
  try {
    const account = await createUserWithEmailAndPassword(auth, email, password);
    const user = account.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
      bio: "",
      dining: [],
      reviews: [],
      image: "",
      favDining1: "",
      favDining2: "",
      lastDining: "",
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

export function logout() {
  signOut(auth);
}

/* ========== ACCESSING USER DETAILS FUNCTIONS =========== */

export async function getUsers(uid) {
  const db = getFirestore();
  const userRef = collection(db, "users");
  var userDetails = {};
  const q = query(userRef, where("uid", "==", uid));
  const qSnapshot = await getDocs(q);
  qSnapshot.forEach((doc) => {
    userDetails = { ...doc.data() };
  });
  return userDetails;
}

export async function editBio(uid, newBio) {
  if (!newBio) {
    return;
  }
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    bio: newBio,
  });
}

export async function editUserImage(uid, newImage) {
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    image: newImage,
  });
}

export async function editFavDining(uid, newDiningHall, id) {
  if (!newDiningHall) {
    return;
  }
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  if (id === 1) {
    await updateDoc(userRef, {
      favDining1: newDiningHall,
    });
  } else if (id === 2) {
    await updateDoc(userRef, {
      favDining2: newDiningHall,
    });
  }
}

export async function addReviews(uid, reviewID) {
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  const userDetails = getUsers(uid);
  var reviewArr = userDetails.reviews;
  reviewArr.push(reviewID);
  await updateDoc(userRef, {
    reviews: reviewArr,
  });
}

export async function addLastDining(uid, diningTime) {
  /* process the timestring */
  /* time string in format HH:MM [AP]M -- Month Day, Year */
  const fullDiningTime = diningPeriod(diningTime);
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    lastDining: fullDiningTime,
  });
}
