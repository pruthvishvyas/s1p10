import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function FullPageSpinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  height:"100vh", background:"var(--color-bg)" }}>
      <div style={{ width:40, height:40, border:"3px solid var(--color-border)",
                    borderTop:"3px solid var(--color-primary)",
                    borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, checking } = useAuth()
  if (checking) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}