import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import { jwtDecode } from "jwt-decode";
import Header from "../../Components/Header/Header";

import blob1 from "../../Assets/login-page/blob1.svg";
import blob2 from "../../Assets/login-page/blob2.svg";
import blob3 from "../../Assets/login-page/blob3.svg";
import blob4 from "../../Assets/login-page/blob4.svg";
import blob11 from "../../Assets/login-page/blob11.svg";
import signinImage from "../../Assets/login-page/signin-image.png";

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      try {
        const decodedUser = jwtDecode(token);

        secureLocalStorage.setItem("auth_token", JSON.stringify(token));
        secureLocalStorage.setItem("profile", JSON.stringify(decodedUser));

        toast.success("Login successful!");
        navigate("/profile", { replace: true });
      } catch {
        toast.error("Invalid token. Please log in again.");
        navigate("/signin", { replace: true });
      }
    }
  }, [location, navigate]);

  function handleGoogleLogin() {
    window.open(`${process.env.REACT_APP_SERVER_URL}/auth/google`, "_self");
  }

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">

      {/* HEADER */}
      <Header />

      {/* BACKGROUND BLOBS */}
      <img
        src={blob2}
        alt=""
        className="absolute top-0 right-0 h-full opacity-40 pointer-events-none"
      />

      <img
        src={blob1}
        alt=""
        className="absolute bottom-0 right-[18%] w-[260px] opacity-50 pointer-events-none"
      />

      <img
        src={blob3}
        alt=""
        className="absolute left-[40%] top-[20%] w-[250px] opacity-40 pointer-events-none"
      />

      <img
        src={blob4}
        alt=""
        className="absolute bottom-0 left-0 w-[240px] opacity-40 pointer-events-none"
      />

      <img
        src={blob11}
        alt=""
        className="absolute top-0 right-[200px] w-[260px] opacity-50 pointer-events-none"
      />

      {/* MAIN GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* LEFT IMAGE */}
        <div className="hidden lg:flex items-center  justify-center ">
          <div className="rounded-2xl overflow-hidden w-[600px] mb-[30px]  ml-[15px] shadow-2xl max-w-[750px] h-[600px]">
            <img
              src={signinImage}
              alt="Sign In Illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="flex items-center mr-[5px] ml-[5px] justify-center ">

          <div className=" flex flex-col items-center justify-center w-full max-w-[500px]  h-[350px] max-h-[500px] bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-10 text-center border border-gray-200">

            <h1 className="text-4xl font-bold mb-7">
              Welcome back!
            </h1>

            <p className="text-gray-500 mb-10 text-large">
              Sign in using your VIT credentials
            </p>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-[#8DB255] hover:bg-[#7da64a] text-white font-semibold py-5 rounded-2xl transition duration-200 shadow-md"
            >
              Sign in with Google
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default SignIn;