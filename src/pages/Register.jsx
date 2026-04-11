import { useState, useContext } from "react"; // ✅ useContext add kiya
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ✅ import add kiya

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // ✅ setUser properly liya

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/register", form);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data); // ✅ ab error nahi aayega
      navigate("/feed"); // ✅ feed pe bheja
    } catch (error) {
      alert(error.response?.data?.message || error.message); // ✅ safe error
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-purple-500 to-pink-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full bg-purple-500 text-white py-2 rounded hover:scale-105 transition">
          Register
        </button>

        <p className="text-sm mt-3 text-center">
          Already have an account?{" "}
          <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;