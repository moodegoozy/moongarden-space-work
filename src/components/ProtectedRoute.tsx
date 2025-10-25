import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuth = localStorage.getItem("adminAuth") === "true"
  return isAuth ? <>{children}</> : <Navigate to="/admin" replace />
}
