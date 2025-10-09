"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  useEffect(() => {
    document.body.style.color = "#fff";
  }, []);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "verification" | "completed">("email");
  const [timeRemaining, setTimeRemaining] = useState(0);

  // countdown timer for code expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining > 0 && step === "verification") {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setStep("email");
            setError("Verification code expired. Please start over.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, step]);

  // Start signup (send OTP)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Signup API error:", result);
        throw new Error(result.error || "Failed to send verification code");
      }

      setStep("verification");
      setMessage("Verification code sent to your email. Please enter it below.");
      setTimeRemaining(300); // 5 minutes
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Verifying with:", { email: email.trim(), code: verificationCode.trim() });
      
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: verificationCode.trim(), password }),
      });

      const result = await response.json();
      console.log("Verify response:", result);
      
      if (!response.ok) {
        console.error("Verification failed:", result);
        throw new Error(result.error || "Verification failed");
      }

      setStep("completed");
      setMessage("Signup completed successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset flow
  const handleStartOver = () => {
    setStep("email");
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setError("");
    setMessage("");
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="auth-container">
      <h1>Sign Up</h1>

      {step === "email" && (
        <form onSubmit={handleSignup} className="form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="input"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            className="input"
          />

          {loading && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "12px 0",
              gap: "8px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#10b981"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "loading-pulse 1.5s ease-in-out infinite"
                }}></div>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "loading-pulse 1.5s ease-in-out infinite 0.2s"
                }}></div>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "loading-pulse 1.5s ease-in-out infinite 0.4s"
                }}></div>
              </div>
              <div style={{
                width: "120px",
                height: "3px",
                background: "#e5e7eb",
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative"
              }}>
                <div style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981, #34d399, #10b981)",
                  backgroundSize: "200% 100%",
                  animation: "loading-progress 2s ease-in-out infinite",
                  borderRadius: "2px"
                }}></div>
              </div>
              <span style={{
                fontSize: "13px",
                color: "#10b981",
                fontWeight: "500",
                animation: "loading-text-pulse 1.8s ease-in-out infinite"
              }}>
                Sending verification code...
              </span>
            </div>
          )}

          <button type="submit" disabled={loading} className="button">
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>
      )}

      {step === "verification" && (
        <form onSubmit={handleVerifyCode} className="form">
          <p>A verification code was sent to <strong>{email}</strong></p>

          <input
            type="text"
            placeholder="6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            required
            disabled={loading}
            className="input"
          />
          {timeRemaining > 0 && <small>Code expires in: {formatTime(timeRemaining)}</small>}

          <button type="submit" disabled={loading || timeRemaining === 0} className="button">
            {loading ? "Verifying..." : "Complete Signup"}
          </button>

          <button type="button" onClick={handleStartOver} className="button" disabled={loading}>
            Start Over
          </button>
        </form>
      )}

      {step === "completed" && (
        <div className="fireworks-container" style={{ textAlign: "center", padding: "2rem", position: "relative" }}>
          {/* Left side fireworks */}
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework-sparkle"></div>
          <div className="firework-sparkle"></div>

          {/* Right side fireworks */}
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework-sparkle"></div>
          <div className="firework-sparkle"></div>

          <h3 style={{ color: "#111", margin: "0 0 16px", position: "relative", zIndex: 10 }}>🎉 Account created successfully!</h3>
          <div className="loading-spinner small"></div>
          <p style={{ color: "#555", margin: "16px 0 0", position: "relative", zIndex: 10 }}>Redirecting to login...</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {message && !error && <p style={{ color: "green" }}>✅ {message}</p>}

      {step !== "completed" && (
        <p style={{ marginTop: "12px", textAlign: "center", color: "#000", fontSize: "14px" }}>
          Already have an account? <a href="/login" style={{ color: "#3b0764", textDecoration: "none" }}>Login</a>
        </p>
      )}
    </div>
  );
}
