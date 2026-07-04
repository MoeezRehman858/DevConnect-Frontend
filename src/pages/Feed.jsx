import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
      try { const { data } = await API.get("/posts/feed"); setPosts(data); }
      catch (error) { console.log(error); }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try { const { data } = await API.get("/users/all"); setUsers(data); }
      catch (error) { console.log(error); }
    };
    fetchUsers();
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    try {
      const { data } = await API.post("/posts", { text });
      setPosts([data, ...posts]); setText("");
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
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p)));
    } catch (error) { console.log(error); }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const { data } = await API.post(`/posts/comment/${postId}`, { text: commentText[postId] });
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: [...data] } : p)));
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
        setCurrentUser({ ...currentUser, following: currentUser.following.filter(
          (f) => (typeof f === "object" ? f._id : f).toString() !== targetUser._id.toString()
        )});
      } else {
        await API.put(`/users/follow/${targetUser._id}`);
        setCurrentUser({ ...currentUser, following: [...(currentUser.following || []), targetUser._id] });
      }
    } catch (err) { console.log(err); }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "#0f172a" }}>
      <div className="max-w-5xl mx-auto flex gap-6">

        <div className="flex-1">
          <div className="rounded-2xl p-5 mb-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <textarea
              className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none outline-none transition"
              style={{ background: "#0f172a", border: "1px solid #334155" }}
              rows={3} placeholder="What's on your mind?"
              value={text} onChange={(e) => setText(e.target.value)}
              onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
              onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
            <div className="flex justify-end mt-3">
              <button onClick={handlePost}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "#6366f1" }}>Post</button>
            </div>
          </div>

          {posts.map((post) => {
            const liked = post.likes?.some((id) => id.toString() === currentUser?._id?.toString());
            const isOwner = post.user?._id?.toString() === currentUser?._id?.toString();
            const showComments = openComments[post._id];
            return (
              <div key={post._id} className="rounded-2xl p-5 mb-4"
                style={{ background: "#1e293b", border: "1px solid #334155" }}>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${post.user?._id}`)}>
                    {post.user?.profilePicture ? (
                      <img src={post.user.profilePicture} className="w-9 h-9 rounded-xl object-cover"
                        style={{ border: "1px solid #334155" }} />
                    ) : (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: "#6366f1" }}>
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{post.user?.name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button onClick={() => handleDelete(post._id)}
                      className="text-sm transition hover:opacity-70" style={{ color: "#475569" }}>Delete</button>
                  )}
                </div>

                <p className="text-sm mb-4 leading-relaxed" style={{ color: "#cbd5e1" }}>{post.text}</p>
                <div className="mb-4" style={{ height: "1px", background: "#334155" }} />

                <div className="flex items-center gap-3">
                  <button onClick={() => handleLike(post._id)}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition hover:opacity-80"
                    style={{
                      background: liked ? "#4f1d96" : "#0f172a",
                      color: liked ? "#a78bfa" : "#64748b",
                      border: `1px solid ${liked ? "#6d28d9" : "#334155"}`
                    }}>
                    {liked ? "Liked" : "Like"} {post.likes?.length || 0}
                  </button>
                  <button onClick={() => setOpenComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition hover:opacity-80"
                    style={{ background: "#0f172a", color: "#64748b", border: "1px solid #334155" }}>
                    Comments {post.comments?.length || 0}
                  </button>
                </div>

                {showComments && (
                  <div className="mt-4">
                    <div className="flex gap-2 mb-3">
                      <input
                        className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none transition"
                        style={{ background: "#0f172a", border: "1px solid #334155" }}
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                        onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                        onBlur={(e) =>  e.target.style.border = "1px solid #334155"} />
                      <button onClick={() => handleComment(post._id)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white transition hover:opacity-90"
                        style={{ background: "#6366f1" }}>Send</button>
                    </div>
                    <div className="space-y-2">
                      {(post.comments || []).map((c) => (
                        <div key={c._id} className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "#334155" }}>
                            {(typeof c.user === "object" ? c.user.name : "U")?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 px-3 py-2 rounded-xl text-sm"
                            style={{ background: "#0f172a", border: "1px solid #334155" }}>
                            <span className="font-semibold text-xs" style={{ color: "#6366f1" }}>
                              {typeof c.user === "object" ? c.user.name : c.user}
                            </span>
                            <span className="ml-2" style={{ color: "#94a3b8" }}>{c.text}</span>
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

        <div className="w-64 shrink-0">
          <div className="rounded-2xl p-4 sticky top-20" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <h3 className="text-sm font-semibold text-white mb-4">People to follow</h3>
            {users.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#64748b" }}>No users found</p>}
            {users.map((u) => {
              const isFollowing = currentUser?.following?.some(
                (f) => (typeof f === "object" ? f._id : f).toString() === u._id.toString()
              );
              return (
                <div key={u._id} className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#334155" }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{u.followers?.length || 0} followers</p>
                    </div>
                  </div>
                  <button onClick={() => handleFollow(u)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                    style={isFollowing
                      ? { background: "#0f172a", color: "#64748b", border: "1px solid #334155" }
                      : { background: "#6366f1", color: "white" }}>
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
