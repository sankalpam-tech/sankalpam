import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", {
        withCredentials: true,
      })
      .then((res) => {
        login(res.data.user);   // 🔑 STORE USER
        navigate("/profile");
      })
      .catch(() => {
        navigate("/signin");
      });
  }, [login, navigate]);

  return <p>Signing you in with Google...</p>;
};

export default OAuthSuccess;
