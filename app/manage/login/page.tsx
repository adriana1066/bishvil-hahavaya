export default function AdminLoginPage() {
  return (
    <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f1e8", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <form action="/api/admin/login" method="post" style={{ width: "min(420px, 100%)", background: "white", padding: "32px", borderRadius: "24px", boxShadow: "0 18px 50px rgba(52,38,20,.12)" }}>
        <h1 style={{ marginTop: 0 }}>כניסה לחדר הניהול</h1>
        <p>הקלידי את הסיסמה הקבועה שלך.</p>
        <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: 700 }}>סיסמה</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required style={{ width: "100%", boxSizing: "border-box", padding: "14px", border: "1px solid #b9aa94", borderRadius: "12px", fontSize: "18px" }} />
        <button type="submit" style={{ width: "100%", marginTop: "18px", padding: "14px", border: 0, borderRadius: "12px", background: "#4d3b28", color: "white", fontSize: "18px", fontWeight: 700, cursor: "pointer" }}>כניסה</button>
      </form>
    </main>
  );
}
