import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext); // ✅ sirf AuthContext — no local state

  return (
    <BrowserRouter>
      {user && <Navbar />}  {/* ✅ setUser pass karne ki zaroorat nahi */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;