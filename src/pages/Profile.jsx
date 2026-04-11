import { useEffect, useState, useContext, useRef } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Profile() {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", email: "", bio: "", skills: ""
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/users/${id}`);
        setProfileUser(data);
      } catch (err) {
        console.log(err);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const isFollowing = currentUser?.following?.some(
    (f) => (typeof f === "object" ? f._id : f).toString()
      === profileUser?._id?.toString()
  );

  const isOwnProfile =
    currentUser?._id?.toString() === profileUser?._id?.toString();

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("token", currentUser.token);

      const { data } = await API.post("/users/upload-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileUser({ ...profileUser, profilePicture: data.profilePicture });

      const updatedUser = { ...currentUser, profilePicture: data.profilePicture };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (err) {
      console.log(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = () => {
    setEditForm({
      name:   profileUser.name   || "",
      email:  profileUser.email  || "",
      bio:    profileUser.bio    || "",
      skills: profileUser.skills?.join(", ") || "",
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    try {
      const skillsArray = editForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const { data } = await API.put("/users/profile", {
        name:   editForm.name,
        email:  editForm.email,
        bio:    editForm.bio,
        skills: skillsArray,
        token:  currentUser.token,
      });

      setProfileUser({ ...profileUser, ...data });
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowEdit(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await API.put(`/users/unfollow/${profileUser._id}`);
        setCurrentUser({
          ...currentUser,
          following: currentUser.following.filter(
            (f) => (typeof f === "object" ? f._id : f).toString()
              !== profileUser._id.toString()
          ),
        });
        setProfileUser({
          ...profileUser,
          followers: profileUser.followers.filter(
            (f) => (typeof f === "object" ? f._id : f).toString()
              !== currentUser._id.toString()
          ),
        });
      } else {
        await API.put(`/users/follow/${profileUser._id}`);
        setCurrentUser({
          ...currentUser,
          following: [...(currentUser.following || []), profileUser._id],
        });
        setProfileUser({
          ...profileUser,
          followers: [...(profileUser.followers || []), currentUser._id],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!profileUser) return (
    <p className="text-center mt-10 text-gray-400">Loading...</p>
  );

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white p-6 rounded-xl shadow">

      <div className="relative w-20 h-20 mb-4">
        {profileUser.profilePicture ? (
          <img
            src={profileUser.profilePicture}
            alt={profileUser.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
          />
        ) : (
          <div className="w-20 h-20 bg-blue-500 text-white text-2xl flex items-center justify-center rounded-full">
            {profileUser.name?.charAt(0).toUpperCase()}
          </div>
        )}

        {isOwnProfile && (
          <>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-900 transition"
              title="Change profile picture"
            >
              {uploading ? "..." : "📷"}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePictureUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      <h2 className="text-2xl font-bold">{profileUser.name}</h2>
      <p className="text-gray-500 text-sm">{profileUser.email}</p>

      {profileUser.bio && (
        <p className="text-gray-700 mt-3">{profileUser.bio}</p>
      )}

      {profileUser.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {profileUser.skills.map((skill, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-6 mt-4">
        <p><b>{profileUser.followers?.length || 0}</b> Followers</p>
        <p><b>{profileUser.following?.length || 0}</b> Following</p>
      </div>

      {!isOwnProfile ? (
        <button
          onClick={handleFollow}
          className={`mt-4 px-4 py-2 rounded text-white transition ${
            isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      ) : (
        <button
          onClick={openEdit}
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Edit Profile
        </button>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>

            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input className="w-full border p-2 rounded mb-3" value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />

            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input className="w-full border p-2 rounded mb-3" value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />

            <label className="block text-sm text-gray-600 mb-1">Bio</label>
            <textarea className="w-full border p-2 rounded mb-3 resize-none" rows={3}
              placeholder="Tell people about yourself..." value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />

            <label className="block text-sm text-gray-600 mb-1">
              Skills <span className="text-gray-400">(comma separated)</span>
            </label>
            <input className="w-full border p-2 rounded mb-4"
              placeholder="React, Node.js, MongoDB..." value={editForm.skills}
              onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEdit(false)}
                className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;