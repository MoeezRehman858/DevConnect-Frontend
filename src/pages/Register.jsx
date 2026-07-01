import { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/register", form);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      navigate("/feed");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.9)",
    border: "2px solid transparent",
    transition: "all 0.3s"
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)" }}>
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #fff 0%, #fce7f3 100%)" }}>
            <span className="text-2xl font-black"
              style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              DC
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Join DevConnect!</h1>
          <p className="text-white opacity-70 mt-1">Connect with developers worldwide</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", type: "text", key: "name", placeholder: "John Doe" },
            { label: "Email", type: "email", key: "email", placeholder: "you@example.com" },
            { label: "Password", type: "password", key: "password", placeholder: "••••••••" }
          ].map(({ label, type, key, placeholder }) => (
            <div key={key}>
              <label className="block text-white text-sm font-medium mb-2 opacity-90">{label}</label>
              <input type={type}
                className="w-full px-4 py-3 rounded-xl outline-none text-gray-800 font-medium"
                style={inputStyle}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                onFocus={(e) => e.target.style.border = "2px solid #f9a8d4"}
                onBlur={(e) => e.target.style.border = "2px solid transparent"} />
            </div>
          ))}
          <button type="submit"
            className="w-full py-3 rounded-xl font-bold text-white text-lg mt-2 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", boxShadow: "0 10px 30px rgba(102,126,234,0.4)" }}>
            Create Account 🚀
          </button>
        </form>
        <p className="text-center text-white opacity-80 mt-6 text-sm">
          Already have an account?{" "}
          <span className="font-bold cursor-pointer underline hover:text-yellow-300 transition"
            onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default Register;