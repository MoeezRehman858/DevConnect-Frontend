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
    <div className="sticky top-0 z-50 flex justify-between items-center px-6 py-4"
      style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>

      <h1 className="text-lg font-bold cursor-pointer text-white" onClick={() => navigate("/feed")}>
        Dev<span style={{ color: "#6366f1" }}>Connect</span>
      </h1>

      {user && (
        <div className="flex items-center gap-4">
          <div className="relative" ref={searchRef}>
            <input type="text"
              className="px-4 py-2 rounded-xl text-sm outline-none text-white"
              style={{ background: "#0f172a", border: "1px solid #334155", width: "200px", transition: "border 0.2s" }}
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={(e) => { e.target.style.border = "1px solid #6366f1"; query.trim() && setShowDropdown(true); }}
              onBlur={(e) => e.target.style.border = "1px solid #334155"} />

            {showDropdown && (
              <div className="absolute top-11 left-0 w-64 rounded-xl overflow-hidden z-50"
                style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
                {results.length === 0 ? (
                  <p className="text-sm p-4 text-center" style={{ color: "#64748b" }}>No users found</p>
                ) : results.map((u) => (
                  <div key={u._id} onClick={() => handleSelect(u._id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition"
                    style={{ borderBottom: "1px solid #334155" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: "#6366f1" }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{u.followers?.length || 0} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div onClick={() => navigate(`/profile/${user._id}`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer transition hover:opacity-80"
            style={{ background: "#6366f1", color: "white" }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <button onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
            style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;
