import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Splash from "@/screens/Splash";

/**
 * Root entry. Shows splash for ~1.5s, then either:
 *  - redirects to /dashboard if a session exists
 *  - redirects to /auth otherwise
 */
const Index = () => {
  const { session, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!splashDone || loading) return <Splash />;
  return <Navigate to={session ? "/dashboard" : "/auth"} replace />;
};

export default Index;
