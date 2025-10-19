function AdminDashboard() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0d0d0d",
      color: "white",
      padding: "48px"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "24px" }}>
        Admin Dashboard
      </h1>
      
      <div style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: "24px",
        borderRadius: "8px",
        marginBottom: "24px"
      }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
          Dashboard is Working
        </h2>
        <p style={{ color: "#9ca3af" }}>
          To manage your content, click Dashboard at the top of base44, then go to Data tab.
        </p>
      </div>

      <div style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: "24px",
        borderRadius: "8px"
      }}>
        <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>Quick Access</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <a href="/dashboard" style={{ color: "#60a5fa", textDecoration: "underline" }}>
            → Manage Articles
          </a>
          <a href="/dashboard" style={{ color: "#60a5fa", textDecoration: "underline" }}>
            → Manage Featured
          </a>
          <a href="/dashboard" style={{ color: "#60a5fa", textDecoration: "underline" }}>
            → Manage Advertisements
          </a>
          <a href="/dashboard" style={{ color: "#60a5fa", textDecoration: "underline" }}>
            → Manage Editorial Team
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;