import React from 'react';

const AuthContext = React.createContext(null);

function FullPageSpinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--color-bg)' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--color-border)', borderTop:'3px solid var(--color-primary)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    // IMPORTANT: On Cloudflare, /cdn-cgi/access/get-identity is provided automatically.
    // Locally you MUST set VITE_DEV_AUTH=true in .env or this will loop infinitely.
    if (import.meta.env.VITE_DEV_AUTH === 'true') {
      setUser({ email: 'dev@local', name: 'Dev User' });
      setChecking(false);
      return;
    }
    fetch('/cdn-cgi/access/get-identity')
      .then(r => r.ok ? r.json() : Promise.reject('not authenticated'))
      .then(identity => { setUser(identity); setChecking(false); })
      .catch(() => {
        window.location.href = '/cdn-cgi/access/login' + window.location.pathname;
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking }}>
      {checking ? <FullPageSpinner /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);