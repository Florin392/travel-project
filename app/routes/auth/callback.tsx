import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { account } from "~/appwrite/client";
import { storeUserData } from "~/appwrite/auth";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const userId = searchParams.get("userId");
        const secret = searchParams.get("secret");

        if (!userId || !secret) {
          throw new Error("Missing OAuth parameters");
        }

        // Create session from the OAuth token
        await account.createSession({userId, secret});

        // Store user data
        const userData = await storeUserData();

        // Redirect based on user role
        if (userData?.status === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          // Regular users go to home page
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/sign-in", { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-gray-600 mt-2">Please wait</p>
      </div>
    </div>
  );
};

export default AuthCallback;
