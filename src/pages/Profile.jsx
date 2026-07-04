import { useEffect, useState, useContext, useRef } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
      try { const { data } = await API.get(`/users/${id}`); setProfileUser(data); }
      catch (err) { console.log(err); }
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
    } catch (err) { console.log(err); alert("Upload failed."); }
    finally { setUploading(false); }
  };

  const openEdit = () => {
    setEditForm({ name: profileUser.name || "", email: profileUser.email || "",
      bio: profileUser.bio || "", skills: profileUser.skills?.join(", ") || "" });
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
        setCurrentUser({ ...currentUser, following: currentUser.following.filter(
          (f) => (typeof f === "object" ? f._id : f).toString() !== profileUser._id.toString()
        )});
        setProfileUser({ ...profileUser, followers: profileUser.followers.filter(
          (f) => (typeof f === "object" ? f._id : f).toString() !== currentUser._id.toString()
        )});
      } else {
        await API.put(`/users/follow/${profileUser._id}`);
        setCurrentUser({ ...currentUser, following: [...(currentUser.following || []), profileUser._id] });
        setProfileUser({ ...profileUser, followers: [...(profileUser.followers || []), currentUser._id] });
      }
    } catch (err) { console.log(err); }
  };

  if (!profileUser) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
      <p className="text-sm" style={{ color: "#64748b" }}>Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: "#0f172a" }}>
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>

          <div className="h-28" style={{ background: "#334155" }} />

          <div className="px-6 pb-6">
            <div className="relative -mt-10 mb-4 inline-block">
              {profileUser.profilePicture ? (
                <img src={profileUser.profilePicture} alt={profileUser.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                  style={{ border: "3px solid #1e293b" }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "#6366f1", border: "3px solid #1e293b" }}>
                  {profileUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwnProfile && (
                <>
                  <button onClick={() => fileInputRef.current.click()} disabled={uploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs transition hover:opacity-80"
                    style={{ background: "#334155", border: "2px solid #1e293b" }}>
                    {uploading ? "..." : "Edit"}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePictureUpload} className="hidden" />
                </>
              )}
            </div>

            <h2 className="text-xl font-bold text-white">{profileUser.name}</h2>
            <p className="text-sm mb-3" style={{ color: "#64748b" }}>{profileUser.email}</p>

            {profileUser.bio && <p className="text-sm mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>{profileUser.bio}</p>}

            {profileUser.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {profileUser.skills.map((skill, i) => (
                  <span key={i} className="text-xs font-medium px-3 py-1 rounded-lg"
                    style={{ background: "#0f172a", color: "#6366f1", border: "1px solid #334155" }}>
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
                <div key={label} className="px-4 py-3 rounded-xl text-center"
                  style={{ background: "#0f172a", border: "1px solid #334155" }}>
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
                </div>
              ))}
            </div>

            {!isOwnProfile ? (
              <button onClick={handleFollow}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: isFollowing ? "#334155" : "#6366f1" }}>
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            ) : (
              <button onClick={openEdit}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-80"
                style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" }}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {showEdit && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="w-full max-w-md mx-4 rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <h3 className="text-lg font-bold text-white mb-5">Edit Profile</h3>

              {[
                { label: "Name", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
              ].map(({ label, key, type }) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>{label}</label>
                  <input type={type}
                    className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm transition"
                    style={{ background: "#0f172a", border: "1px solid #334155" }}
                    value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                    onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
                </div>
              ))}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Bio</label>
                <textarea className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm resize-none transition"
                  style={{ background: "#0f172a", border: "1px solid #334155" }}
                  rows={3} placeholder="Tell people about yourself..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                  onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                  Skills <span style={{ color: "#475569" }}>(comma separated)</span>
                </label>
                <input className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm transition"
                  style={{ background: "#0f172a", border: "1px solid #334155" }}
                  placeholder="React, Node.js, MongoDB..."
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                  onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80"
                  style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: "#6366f1" }}>
                  Save Changes
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
