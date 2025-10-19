import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function AffiliateLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const affiliates = await base44.entities.Affiliate.list();
      const affiliate = affiliates.find(a => a.email === email && a.password === password);

      if (affiliate) {
        if (affiliate.status !== "approved") {
          setError("Your affiliate account is pending approval");
          setLoading(false);
          return;
        }

        sessionStorage.setItem("affiliate_user", JSON.stringify(affiliate));
        window.location.href = "/affiliatedashboard";
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0d0d0d",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e8dc85bfc3cf36edee27d2/2ec706ef8_EthiquelogotransparentW.png"
            alt="Éthique"
            style={{ height: "80px", marginBottom: "30px", display: "block", marginLeft: "auto", marginRight: "auto" }}
          />
          <h1 style={{ fontSize: "32px", fontWeight: "300", color: "white", marginBottom: "10px", margin: "0 0 10px 0" }}>
            Affiliate Login
          </h1>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0" }}>
            Access your affiliate dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "white", fontSize: "14px", marginBottom: "10px", fontWeight: "500" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              style={{
                width: "100%",
                padding: "14px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "white",
                fontSize: "16px",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "white", fontSize: "14px", marginBottom: "10px", fontWeight: "500" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "14px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "white",
                fontSize: "16px",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "14px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "white",
              color: "black",
              padding: "16px",
              fontSize: "14px",
              textTransform: "uppercase",
              fontWeight: "700",
              border: "2px solid white",
              borderRadius: "0px",
              letterSpacing: "2px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}