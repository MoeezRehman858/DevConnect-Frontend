import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function DiscoverUsers() {
  const [users, setUsers] = useState([]);
  const { user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users/all");
        setUsers(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  const handleFollow = async (targetUser) => {
    const isFollowing = currentUser?.following?.some(
      (f) => (typeof f === "object" ? f._id : f).toString() === targetUser._id.toString()
    );

    try {
      if (isFollowing) {
        await API.put(`/users/unfollow/${targetUser._id}`);
        setCurrentUser({
          ...currentUser,
          following: currentUser.following.filter(
            (f) => (typeof f === "object" ? f._id : f).toString() !== targetUser._id.toString()
          ),
        });
      } else {
        await API.put(`/users/follow/${targetUser._id}`);
        setCurrentUser({
          ...currentUser,
          following: [...(currentUser.following || []), targetUser._id],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-lg font-bold mb-3">👥 Discover People</h3>

      {users.length === 0 && (
        <p className="text-gray-500 text-sm">No users found</p>
      )}

      {users.map((u) => {
        const isFollowing = currentUser?.following?.some(
          (f) => (typeof f === "object" ? f._id : f).toString() === u._id.toString()
        );

        return (
          <div key={u._id} className="flex items-center justify-between mb-3">

            {/* Avatar + Name */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/profile/${u._id}`)}
            >
              <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm">
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-xs text-gray-500">{u.followers?.length || 0} followers</p>
              </div>
            </div>

            {/* Follow Button */}
            <button
              onClick={() => handleFollow(u)}
              className={`text-sm px-3 py-1 rounded text-white transition ${
                isFollowing ? "bg-red-400 hover:bg-red-500" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>

          </div>
        );
      })}
    </div>
  );
}

export default DiscoverUsers;