import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [commentText, setCommentText] = useState({});
  const [users, setUsers] = useState([]);
  const { user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get("/posts/feed");
        setPosts(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users/all");
        setUsers(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    try {
      const { data } = await API.post("/posts", { text });
      setPosts([data, ...posts]);
      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (postId) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.put(`/posts/like/${postId}`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const { data } = await API.post(`/posts/comment/${postId}`, {
        text: commentText[postId],
      });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: [...data] } : p
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = async (targetUser) => {
    const isFollowing = currentUser?.following?.some(
      (f) =>
        (typeof f === "object" ? f._id : f).toString() ===
        targetUser._id.toString()
    );
    try {
      if (isFollowing) {
        await API.put(`/users/unfollow/${targetUser._id}`);
        setCurrentUser({
          ...currentUser,
          following: currentUser.following.filter(
            (f) =>
              (typeof f === "object" ? f._id : f).toString() !==
              targetUser._id.toString()
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
    <div className="max-w-5xl mx-auto mt-6 p-4 flex gap-6">
      <div className="flex-1">
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <textarea
            className="w-full border p-2 rounded mb-2 resize-none"
            rows={3}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:scale-105 transition"
            onClick={handlePost}
          >
            Post
          </button>
        </div>

        {posts.map((post) => {
          const liked = post.likes?.some(
            (id) => id.toString() === currentUser?._id?.toString()
          );
          const isOwner =
            post.user?._id?.toString() === currentUser?._id?.toString();

          return (
            <div key={post._id} className="bg-white p-4 rounded-xl shadow mb-4">

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm cursor-pointer"
                    onClick={() => navigate(`/profile/${post.user?._id}`)}
                  >
                    {post.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${post.user?._id}`)}
                    >
                      {post.user?.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-gray-300 hover:text-red-500 transition text-lg"
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <p className="text-gray-700 mb-3">{post.text}</p>

              <button
                className={`mb-3 text-sm font-medium transition hover:scale-110 ${
                  liked ? "text-red-500" : "text-gray-400"
                }`}
                onClick={() => handleLike(post._id)}
              >
                {liked ? "❤️" : "🤍"} {post.likes?.length || 0} Likes
              </button>

              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 border p-2 rounded text-sm"
                  placeholder="Write a comment..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText({ ...commentText, [post._id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleComment(post._id);
                  }}
                />
                <button
                  className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200 transition"
                  onClick={() => handleComment(post._id)}
                >
                  Send
                </button>
              </div>

              <div className="space-y-1">
                {(post.comments || []).map((c) => (
                  <div key={c._id} className="text-sm bg-gray-50 rounded px-3 py-1">
                    <strong>
                      {typeof c.user === "object" ? c.user.name : c.user}
                    </strong>: {c.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-72 shrink-0">
        <div className="bg-white p-4 rounded-xl shadow sticky top-6">
          <h3 className="text-lg font-bold mb-4">Discover People</h3>

          {users.length === 0 && (
            <p className="text-gray-400 text-sm">No users found</p>
          )}

          {users.map((u) => {
            const isFollowing = currentUser?.following?.some(
              (f) =>
                (typeof f === "object" ? f._id : f).toString() ===
                u._id.toString()
            );
            return (
              <div key={u._id} className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/profile/${u._id}`)}
                >
                  <div className="w-9 h-9 bg-purple-500 text-white flex items-center justify-center rounded-full text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">
                      {u.followers?.length || 0} followers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(u)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                    isFollowing
                      ? "bg-red-100 text-red-500 hover:bg-red-200"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Feed;