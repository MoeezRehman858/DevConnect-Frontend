import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDropdown(false); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await API.get(`/users/search?q=${query}`);
        setResults(data); setShowDropdown(true);
      } catch (err) { console.log(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (userId) => {
    setShowDropdown(false); setQuery("");
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="sticky top-0 z-50 px-6 py-3 flex justify-between items-center"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 20px rgba(102,126,234,0.4)" }}>

      <h1 className="text-2xl font-black text-white cursor-pointer tracking-tight hover:scale-105 transition"
        onClick={() => navigate("/feed")}>
        Dev<span style={{ color: "#fbbf24" }}>Connect</span> ⚡
      </h1>

      {user && (
        <div className="flex items-center gap-4">
          <div className="relative" ref={searchRef}>
            <div className="flex items-center rounded-full px-4 py-2 gap-2"
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <span className="text-white opacity-70">🔍</span>
              <input type="text"
                className="bg-transparent outline-none text-white text-sm w-44"
                placeholder="Search developers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowDropdown(true)} />
            </div>
            {showDropdown && (
              <div className="absolute top-12 left-0 w-72 rounded-2xl overflow-hidden z-50"
                style={{ background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(102,126,234,0.2)" }}>
                {results.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4 text-center">No users found</p>
                ) : results.map((u) => (
                  <div key={u._id} onClick={() => handleSelect(u._id)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer transition">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.followers?.length || 0} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div onClick={() => navigate(`/profile/${user._id}`)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition hover:scale-110"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "white",
              boxShadow: "0 4px 12px rgba(251,191,36,0.4)" }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <button onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-bold transition hover:scale-105"
            style={{ background: "rgba(255,255,255,0.2)", color: "white",
              border: "1px solid rgba(255,255,255,0.4)" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;