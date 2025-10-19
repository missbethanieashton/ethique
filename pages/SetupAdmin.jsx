import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function SetupAdmin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const setupAdmin = async () => {
    setSubmitting(true);
    try {
      await base44.auth.updateMe({
        admin_role: "master_admin",
        admin_permissions: [
          "articles",
          "featured",
          "authors",
          "taxonomies",
          "carousels",
          "ads",
          "performance",
          "crm",
          "users",
          "editorial",
          "advertisers",
          "affiliates"
        ]
      });
      
      alert("Admin setup complete! You are now master_admin. Redirecting...");
      window.location.href = "/AdminDashboard";
    } catch (error) {
      alert("Error: " + error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0d0d0d" }}>
        <div style={{ color: "white" }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.admin_role && user.admin_role !== "none") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0d0d0d", padding: "24px" }}>
        <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", padding: "32px", borderRadius: "8px", textAlign: "center" }}>
          <h1 style={{ color: "white", fontSize: "28px", marginBottom: "16px" }}>Already Set Up</h1>
          <p style={{ color: "#9ca3af", marginBottom: "8px" }}>
            You already have admin access as: <strong>{user.admin_role}</strong>
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Email: {user.email}
          </p>
          <button
            onClick={() => window.location.href = "/AdminDashboard"}
            style={{
              padding: "12px 24px",
              backgroundColor: "white",
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0d0d0d", padding: "24px" }}>
      <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", padding: "32px", borderRadius: "8px" }}>
        <h1 style={{ color: "white", fontSize: "28px", marginBottom: "24px" }}>Admin Setup</h1>
        
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>Email</p>
          <p style={{ color: "white", padding: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>{user.email}</p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>Name</p>
          <p style={{ color: "white", padding: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>{user.full_name || "Not set"}</p>
        </div>

        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "24px" }}>
          Click below to set yourself up as the <strong>master admin</strong>. This will grant you full access to the admin dashboard.
        </p>

        <button
          onClick={setupAdmin}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: submitting ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          {submitting ? "Setting up..." : "Setup Master Admin"}
        </button>
      </div>
    </div>
  );
}