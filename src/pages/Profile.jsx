import { useEffect, useState, useContext, useRef } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
];
const getGradient = (name) =>
  gradients[(name?.charCodeAt(0) || 0) % gradients.length];

function Profile() {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", bio: "", skills: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/users/${id}`);
        setProfileUser(data);
      } catch (err) { console.log(err); }
    };
    if (id) fetchUser();
  }, [id]);

  const isFollowing = currentUser?.following?.some(
    (f) => (typeof f === "object" ? f._id : f).toString() === profileUser?._id?.toString()
  );
  const isOwnProfile = currentUser?._id?.toString() === profileUser?._id?.toString();

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
    } finally { setUploading(false); }
  };

  const openEdit = () => {
    setEditForm({
      name: profileUser.name || "",
      email: profileUser.email || "",
      bio: profileUser.bio || "",
      skills: profileUser.skills?.join(", ") || "",
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    try {
      const skillsArray = editForm.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const { data } = await API.put("/users/profile", {
        name: editForm.name, email: editForm.email,
        bio: editForm.bio, skills: skillsArray, token: currentUser.token,
      });
      setProfileUser({ ...profileUser, ...data });
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowEdit(false);
    } catch (err) { console.log(err); }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await API.put(`/users/unfollow/${profileUser._id}`);
        setCurrentUser({ ...currentUser,
          following: currentUser.following.filter(
            (f) => (typeof f === "object" ? f._id : f).toString() !== profileUser._id.toString()
          ),
        });
        setProfileUser({ ...profileUser,
          followers: profileUser.followers.filter(
            (f) => (typeof f === "object" ? f._id : f).toString() !== currentUser._id.toString()
          ),
        });
      } else {
        await API.put(`/users/follow/${profileUser._id}`);
        setCurrentUser({ ...currentUser, following: [...(currentUser.following || []), profileUser._id] });
        setProfileUser({ ...profileUser, followers: [...(profileUser.followers || []), currentUser._id] });
      }
    } catch (err) { console.log(err); }
  };

  if (!profileUser) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #f5f7ff, #fdf2f8)" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse"
          style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }} />
        <p className="text-gray-400 font-medium">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #fdf2f8 50%, #f0fdf4 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.1)" }}>
          <div className="h-36 relative" style={{ background: getGradient(profileUser.name) }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)" }} />
          </div>
          <div className="bg-white px-8 pb-8">
            <div className="relative -mt-12 mb-4 inline-block">
              {profileUser.profilePicture ? (
                <img src={profileUser.profilePicture} alt={profileUser.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                  style={{ border: "4px solid white", boxShadow: "0 8px 24px rgba(102,126,234,0.3)" }} />
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
                  style={{ background: getGradient(profileUser.name),
                    border: "4px solid white", boxShadow: "0 8px 24px rgba(102,126,234,0.3)" }}>
                  {profileUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwnProfile && (
                <>
                  <button onClick={() => fileInputRef.current.click()} disabled={uploading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm transition hover:scale-110"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", boxShadow: "0 4px 12px rgba(102,126,234,0.4)" }}>
                    {uploading ? "⏳" : "📷"}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePictureUpload} className="hidden" />
                </>
              )}
            </div>
            <h2 className="text-2xl font-black text-gray-800">{profileUser.name}</h2>
            <p className="text-sm text-gray-400 mb-3">{profileUser.email}</p>
            {profileUser.bio && <p className="text-gray-600 mb-4 leading-relaxed">{profileUser.bio}</p>}
            {profileUser.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {profileUser.skills.map((skill, i) => (
                  <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ background: gradients[i % gradients.length], boxShadow: "0 2px 8px rgba(102,126,234,0.3)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-4 mb-5">
              {[
                { label: "Followers", value: profileUser.followers?.length || 0 },
                { label: "Following", value: profileUser.following?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center px-6 py-3 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #f5f7ff, #fdf2f8)" }}>
                  <p className="text-2xl font-black"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {value}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                </div>
              ))}
            </div>
            {!isOwnProfile ? (
              <button onClick={handleFollow}
                className="px-8 py-3 rounded-2xl font-bold text-white transition hover:scale-105 hover:shadow-xl"
                style={isFollowing
                  ? { background: "linear-gradient(135deg, #ff6b6b, #ff8e8e)", boxShadow: "0 6px 20px rgba(255,107,107,0.4)" }
                  : { background: "linear-gradient(135deg, #667eea, #764ba2)", boxShadow: "0 6px 20px rgba(102,126,234,0.4)" }}>
                {isFollowing ? "✕ Unfollow" : "+ Follow"}
              </button>
            ) : (
              <button onClick={openEdit}
                className="px-8 py-3 rounded-2xl font-bold transition hover:scale-105"
                style={{ background: "linear-gradient(135deg, #f5f7ff, #fdf2f8)", color: "#667eea", border: "2px solid #c4b5fd" }}>
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {showEdit && (
          <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-md mx-4 rounded-3xl p-8"
              style={{ background: "white", boxShadow: "0 30px 80px rgba(0,0,0,0.2)" }}>
              <h3 className="text-xl font-black text-gray-800 mb-6">✏️ Edit Profile</h3>
              {[
                { label: "Name", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
              ].map(({ label, key, type }) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>
                  <input type={type}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-gray-700 text-sm"
                    style={{ background: "#f8f9ff", border: "2px solid transparent", transition: "border 0.3s" }}
                    value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    onFocus={(e) => e.target.style.border = "2px solid #a78bfa"}
                    onBlur={(e) => e.target.style.border = "2px solid transparent"} />
                </div>
              ))}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600 mb-1">Bio</label>
                <textarea className="w-full px-4 py-3 rounded-2xl outline-none text-gray-700 text-sm resize-none"
                  style={{ background: "#f8f9ff", border: "2px solid transparent", transition: "border 0.3s" }}
                  rows={3} placeholder="Tell people about yourself..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  onFocus={(e) => e.target.style.border = "2px solid #a78bfa"}
                  onBlur={(e) => e.target.style.border = "2px solid transparent"} />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Skills <span className="text-gray-400 font-normal">(comma separated)</span>
                </label>
                <input className="w-full px-4 py-3 rounded-2xl outline-none text-gray-700 text-sm"
                  style={{ background: "#f8f9ff", border: "2px solid transparent", transition: "border 0.3s" }}
                  placeholder="React, Node.js, MongoDB..."
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  onFocus={(e) => e.target.style.border = "2px solid #a78bfa"}
                  onBlur={(e) => e.target.style.border = "2px solid transparent"} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-gray-500 transition hover:scale-105"
                  style={{ background: "#f8f9ff", border: "2px solid #e5e7eb" }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-3 rounded-2xl font-bold text-white transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", boxShadow: "0 6px 20px rgba(102,126,234,0.4)" }}>
                  Save Changes ✨
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;