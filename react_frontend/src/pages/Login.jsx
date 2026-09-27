export default function Login() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", height:"100vh",
                  background:"var(--color-bg)", gap:"var(--space-4)" }}>
      <span style={{ fontSize:"3rem" }}>🎯</span>
      <h1 style={{ fontFamily:"var(--font-heading)", color:"var(--color-text-primary)",
                   fontSize:"var(--text-2xl)", fontWeight:800, margin:0 }}>
        Influencer ROI Intelligence
      </h1>
      <p style={{ color:"var(--color-text-secondary)" }}>Redirecting to secure login...</p>
      <a href="/cdn-cgi/access/login/"
         style={{ color:"var(--color-primary)", fontSize:"var(--text-sm)" }}>
        Click here if not redirected
      </a>
    </div>
  )
}