import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      navigate("/feed");
    } catch (error) {
      alert(error.response?.data?.message || error.message); // ✅ fixed
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-400 to-purple-500 animate-fadeIn">
  <form
    onSubmit={handleSubmit}
    className="bg-white p-8 rounded-xl shadow-lg w-80 animate-fadeInUp transform transition duration-500 hover:scale-105"
  >
    <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

    <input
      className="w-full border p-2 mb-3 rounded focus:ring-2 focus:ring-blue-400 outline-none transition"
      placeholder="Email"
      onChange={(e) => setForm({ ...form, email: e.target.value })}
    />

    <input
      type="password"
      className="w-full border p-2 mb-4 rounded focus:ring-2 focus:ring-blue-400 outline-none transition"
      placeholder="Password"
      onChange={(e) => setForm({ ...form, password: e.target.value })}
    />

    <button className="w-full bg-blue-500 text-white py-2 rounded hover:scale-110 hover:bg-blue-600 transition duration-300">
      Login
    </button>

    <p className="text-sm mt-3 text-center">
      Don't have an account?{" "}
      <span
        className="text-blue-500 cursor-pointer hover:underline"
        onClick={() => navigate("/register")}
      >
        Register
      </span>
    </p>
  </form>
</div>
  );
}

export default Login;