import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
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

function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [commentText, setCommentText] = useState({});
  const [users, setUsers] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const { user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get("/posts/feed");
        setPosts(data);
      } catch (error) { console.log(error); }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users/all");
        setUsers(data);
      } catch (error) { console.log(error); }
    };
    fetchUsers();
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    try {
      const { data } = await API.post("/posts", { text });
      setPosts([data, ...posts]);
      setText("");
    } catch (error) { console.log(error); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) { console.log(error); }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.put(`/posts/like/${postId}`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p))
      );
    } catch (error) { console.log(error); }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const { data } = await API.post(`/posts/comment/${postId}`, {
        text: commentText[postId],
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: [...data] } : p))
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) { console.log(error); }
  };

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
    } catch (err) { console.log(err); }
  };

  return (
    <div className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #fdf2f8 50%, #f0fdf4 100%)" }}>
      <div className="max-w-5xl mx-auto flex gap-6">
        <div className="flex-1">
          <div className="rounded-3xl p-6 mb-6"
            style={{ background: "white", boxShadow: "0 10px 40px rgba(102,126,234,0.12)",
              border: "1px solid rgba(102,126,234,0.1)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: getGradient(currentUser?.name) }}>
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-gray-700">{currentUser?.name}</p>
            </div>
            <textarea
              className="w-full rounded-2xl px-4 py-3 text-gray-700 resize-none outline-none text-sm"
              style={{ background: "#f8f9ff", border: "2px solid transparent", transition: "border 0.3s" }}
              rows={3}
              placeholder="Share something with the dev community... 💡"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={(e) => e.target.style.border = "2px solid #a78bfa"}
              onBlur={(e) => e.target.style.border = "2px solid transparent"} />
            <div className="flex justify-end mt-3">
              <button onClick={handlePost}
                className="px-6 py-2 rounded-full text-white font-bold text-sm transition hover:scale-105"
                style={{ background: "linear-gradient(135deg, #667eea, #764ba2)",
                  boxShadow: "0 4px 15px rgba(102,126,234,0.4)" }}>
                Post ✨
              </button>
            </div>
          </div>

          {posts.map((post) => {
            const liked = post.likes?.some((id) => id.toString() === currentUser?._id?.toString());
            const isOwner = post.user?._id?.toString() === currentUser?._id?.toString();
            const showComments = openComments[post._id];
            return (
              <div key={post._id} className="rounded-3xl p-6 mb-4 transition hover:shadow-xl"
                style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(102,126,234,0.08)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${post.user?._id}`)}>
                    {post.user?.profilePicture ? (
                      <img src={post.user.profilePicture}
                        className="w-10 h-10 rounded-full object-cover"
                        style={{ border: "2px solid #a78bfa" }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: getGradient(post.user?.name) }}>
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-800 hover:text-purple-600 transition text-sm">
                        {post.user?.name}
                      </h4>
                      <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button onClick={() => handleDelete(post._id)}
                      className="text-gray-300 hover:text-red-400 transition text-lg">🗑️</button>
                  )}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{post.text}</p>
                <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, #e0e7ff, transparent)" }} />
                <div className="flex items-center gap-4">
                  <button onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition hover:scale-105"
                    style={{
                      background: liked ? "linear-gradient(135deg, #ff6b6b, #ff8e8e)" : "#f8f9ff",
                      color: liked ? "white" : "#9ca3af",
                      boxShadow: liked ? "0 4px 12px rgba(255,107,107,0.3)" : "none"
                    }}>
                    {liked ? "❤️" : "🤍"} {post.likes?.length || 0}
                  </button>
                  <button
                    onClick={() => setOpenComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition hover:scale-105"
                    style={{ background: "#f8f9ff", color: "#9ca3af" }}>
                    💬 {post.comments?.length || 0}
                  </button>
                </div>
                {showComments && (
                  <div className="mt-4">
                    <div className="flex gap-2 mb-3">
                      <input
                        className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
                        style={{ background: "#f8f9ff", border: "2px solid transparent", transition: "border 0.3s" }}
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                        onFocus={(e) => e.target.style.border = "2px solid #a78bfa"}
                        onBlur={(e) => e.target.style.border = "2px solid transparent"} />
                      <button onClick={() => handleComment(post._id)}
                        className="px-4 py-2 rounded-full text-white text-sm font-bold transition hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                        Send
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(post.comments || []).map((c) => (
                        <div key={c._id} className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: getGradient(typeof c.user === "object" ? c.user.name : "") }}>
                            {(typeof c.user === "object" ? c.user.name : "U")?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 px-3 py-2 rounded-2xl text-sm" style={{ background: "#f8f9ff" }}>
                            <strong className="text-purple-600 text-xs">
                              {typeof c.user === "object" ? c.user.name : c.user}
                            </strong>
                            <span className="text-gray-600 ml-2">{c.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-72 shrink-0">
          <div className="rounded-3xl p-5 sticky top-24"
            style={{ background: "white", boxShadow: "0 10px 40px rgba(102,126,234,0.12)",
              border: "1px solid rgba(102,126,234,0.1)" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                <span className="text-white text-sm">👥</span>
              </div>
              <h3 className="font-black text-gray-800">Discover People</h3>
            </div>
            {users.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No users found</p>}
            {users.map((u) => {
              const isFollowing = currentUser?.following?.some(
                (f) => (typeof f === "object" ? f._id : f).toString() === u._id.toString()
              );
              return (
                <div key={u._id} className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: getGradient(u.name) }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.followers?.length || 0} followers</p>
                    </div>
                  </div>
                  <button onClick={() => handleFollow(u)}
                    className="text-xs px-3 py-1.5 rounded-full font-bold transition hover:scale-105"
                    style={isFollowing
                      ? { background: "#fff0f0", color: "#ef4444", border: "1px solid #fecaca" }
                      : { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white",
                          boxShadow: "0 4px 10px rgba(102,126,234,0.3)" }}>
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;