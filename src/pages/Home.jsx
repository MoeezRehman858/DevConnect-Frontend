import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">

      <h1 className="text-4xl font-bold mb-4 animate-bounce">
        DevConnect 
      </h1>

      <p className="mb-6 text-lg">
        Connect with developers around the world
      </p>

      <div className="flex gap-4">
        <button
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:scale-105 transition"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>

    </div>
  );
}

export default Home;