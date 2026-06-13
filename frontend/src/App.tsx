import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import React from "react"
import LoginPage from "./pages/LoginPage"
import ChangesPage from "./pages/ChangesPage"
import NewChangePage from "./pages/NewChangePage"
import SystemsPage from "./pages/SystemsPage"
import ProfilePage from "./pages/ProfilePage"
import RegisterPage from "./pages/RegisterPage"
import RolesPage from "./pages/RolesPage"
import UsersPage from "./pages/UsersPage"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  return token ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  return !token ? <>{children}</> : <Navigate to="/changes" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/changes" element={<PrivateRoute><ChangesPage /></PrivateRoute>} />
        <Route path="/changes/new" element={<PrivateRoute><NewChangePage /></PrivateRoute>} />
        <Route path="/systems" element={<PrivateRoute><SystemsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/roles" element={<PrivateRoute><RolesPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App