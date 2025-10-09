"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";

export default function LoginPage() {
  useEffect(() => {
    document.body.style.color = "#fff";
  }, []);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid login credentials");
      } else if (session) {
        // redirect user once logged in
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />
        {error && <p style={{ color: "red", fontSize: "14px", margin: "8px 0 0 0", textAlign: "center" }}>{error}</p>}
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "12px", textAlign: "center", color: "#000", fontSize: "14px" }}>
        Don’t have an account? <a href="/signup" style={{ color: "#3b0764", textDecoration: "none" }}>Sign up</a>
      </p>
    </div>
  );
}
