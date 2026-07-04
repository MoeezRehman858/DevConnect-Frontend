import { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const animationStyles = `
  @keyframes popUp {
    0%   { opacity: 0; transform: scale(0.92) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .card-pop         { animation: popUp    0.5s ease both; }
  .animate-fadeInUp { animation: fadeInUp 0.4s ease both; }
`;

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      navigate("/feed");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="card-pop w-full max-w-md mx-4 rounded-2xl p-8"
          style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>

          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-2xl font-bold text-white mb-1">DevConnect</h1>
            <p className="text-sm" style={{ color: "#64748b" }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Email</label>
              <input type="email"
                className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm transition-all duration-200"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
                placeholder="you@example.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Password</label>
              <input type="password"
                className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm transition-all duration-200"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
                placeholder="••••••••"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90 active:scale-95"
                style={{ background: "#6366f1" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <p className="text-sm mt-6 animate-fadeInUp" style={{ color: "#64748b", animationDelay: "0.5s" }}>
            Don't have an account?{" "}
            <span className="font-medium cursor-pointer" style={{ color: "#6366f1" }}
              onClick={() => navigate("/register")}>Create one</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
