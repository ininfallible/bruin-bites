import "./css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Splash from "./components/SplashScreen";
import { ThemeProvider } from "styled-components";

import { auth } from "./components/firebaseConfig/firebase.js";

import { venues } from "./components/VenueData.js";

/* yo that's a lotta pages */
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Review from "./pages/Review";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Venue from "./pages/Venue";
import EditProfile from "./pages/EditProfile";
import DiningHistory from "./pages/DiningHistory";

/* venue pages */
import VenuePage from "./pages/VenuePage";

const LightTheme = {
  padding: "0.25em 1em",
  pageBackground: "white",
  titleColor: "#dc658b",
  tagLineColor: "black",
};

const DarkTheme = {
  padding: "0.25em 1em",
  pageBackground: "#282c36",
  titleColor: "lightpink",
  tagLineColor: "lavender",
};

const themes = {
  light: LightTheme,
  dark: DarkTheme,
};

function App() {
  /* stateful variables */
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  /* on render, get the user details */
  useEffect(() => {
    const unlisten = auth.onAuthStateChanged(
      user => {
        user
          ? setUser(user)
          : setUser(null)
      }
    );
    return () => {
      unlisten();
    }
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <ThemeProvider theme={themes[theme]}>
        <Splash theme={theme} setTheme={setTheme} />
      </ThemeProvider>
      <Routes>
        <Route path="/" element={<Home user={user} />}></Route>
        <Route
          path="/reviews"
          element={<Review user={user} />}
        ></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/map" element={<Map user={user} />}></Route>
        <Route path="/signin" element={<SignIn />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/venue" element={<Venue />}></Route>
        <Route path="/edit-profile" element={<EditProfile googleAcc={user ? user.emailVerified : false}/>}></Route>
        <Route path="/dining-history" element={<DiningHistory />}></Route>
        <Route
          path="/deneve"
          element={<VenuePage diningData={venues[0]} user={user} />}
        ></Route>
        <Route
          path="/epicuria"
          element={<VenuePage diningData={venues[1]} user={user} />}
        ></Route>
        <Route
          path="/bruinplate"
          element={<VenuePage diningData={venues[2]} user={user} />}
        ></Route>
        <Route
          path="/feastatrieber"
          element={<VenuePage diningData={venues[3]} user={user} />}
        ></Route>
        <Route
          path="/rendezvous"
          element={<VenuePage diningData={venues[4]} user={user} />}
        ></Route>
        <Route
          path="/thestudy"
          element={<VenuePage diningData={venues[5]} user={user} />}
        ></Route>
        <Route
          path="/bruincafe"
          element={<VenuePage diningData={venues[6]} user={user} />}
        ></Route>
        <Route
          path="/thedrey"
          element={<VenuePage diningData={venues[7]} user={user} />}
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
