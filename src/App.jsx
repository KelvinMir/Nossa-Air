import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { CheckInPage } from './pages/CheckInPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PortalPage } from './pages/PortalPage'
import { ReservationPage } from './pages/ReservationPage'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background font-sans font-extrabold text-forest-dark">
        Carregando portal Nossa Air...
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/check-in" element={<CheckInPage />} />
      <Route path="/reserva/:locator" element={<ReservationPage />} />
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <PortalPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
