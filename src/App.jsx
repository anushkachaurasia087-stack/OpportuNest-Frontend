import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./components/Navbar"

import Dashboard from "./pages/Dashboard"
import Discover from "./pages/Discover"
import EventDetails from "./pages/EventDetails"
import TeamMatch from "./pages/TeamMatch"
import PrepCoach from "./pages/PrepCoach"
import Tracker from "./pages/Tracker"
import Profile from "./pages/Profile"
import Login from "./pages/login.jsx"
import ClaimChecker from "./pages/ClaimChecker";
import GreenImpact from "./pages/GreenImpact";
;

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <main className="ml-64 min-h-screen bg-slate-950">

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/discover"
            element={<Discover />}
          />

          <Route
            path="/event/:id"
            element={<EventDetails />}
          />

          <Route
            path="/team"
            element={<TeamMatch />}
          />

          <Route
            path="/prep"
            element={<PrepCoach />}
          />

          <Route
            path="/tracker"
            element={<Tracker />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route 
          path="/login" 
          element={<Login />} 
          />
          <Route
           path="/claim-checker"
           element={<ClaimChecker />}
          />

          <Route path="/green-impact" element={<GreenImpact />} />

        
          

        </Routes>

      </main>

    </BrowserRouter>
  )
}

export default App