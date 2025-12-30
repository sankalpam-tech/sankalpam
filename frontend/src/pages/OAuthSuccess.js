import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;        // 🔑 wait for /auth/me

    if (user) {
      navigate("/");    // or "/"
    } else {
      navigate("/signin");
    }
  }, [user, loading, navigate]);

  return <p>Signing you in with Google...</p>;
};

export default OAuthSuccess;
