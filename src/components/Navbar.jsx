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
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await API.get(`/users/search?q=${query}`);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (userId) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow relative">

      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/feed")}
      >
        DevConnect
      </h1>

      {user && (
        <div className="flex items-center gap-4">

          <div className="relative" ref={searchRef}>
            <input
              type="text"
              className="border rounded-full px-4 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Search developers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowDropdown(true)}
            />

            {showDropdown && (
              <div className="absolute top-10 left-0 w-72 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">

                {results.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4 text-center">
                    No users found
                  </p>
                ) : (
                  results.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => handleSelect(u._id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">
                          {u.followers?.length || 0} followers
                        </p>
                      </div>
                    </div>
                  ))
                )}

              </div>
            )}
          </div>

          <div
            onClick={() => navigate(`/profile/${user._id}`)}
            className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer hover:bg-blue-600 transition"
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>
      )}
    </div>
  );
}

export default Navbar;