import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignup, setIsSignup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500 text-2xl font-bold">
            O
          </div>

          <h1 className="text-3xl font-bold">
            OpportuNest
          </h1>

          <p className="mt-2 text-slate-400">
            Discover. Connect. Grow.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <h2 className="text-2xl font-bold">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {isSignup
              ? "Join OpportuNest and discover your next opportunity."
              : "Sign in to continue to your dashboard."}
          </p>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-500 py-3 font-semibold transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create Account"
                  : "Sign In"}
            </button>

          </form>

          {/* Switch */}
          <div className="mt-6 text-center text-sm text-slate-400">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="ml-2 font-semibold text-purple-400 hover:text-purple-300"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </div>

        </div>

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-300"
        >
          ← Back to OpportuNest
        </button>

      </div>
    </div>
  );
}