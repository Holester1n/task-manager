import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import ChangesPage from "./pages/ChangesPage"
import NewChangePage from "./pages/NewChangePage"

function App() {
  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/changes/new" element={<NewChangePage />} />
        <Route path="*" element={<Navigate to={token ? "/changes" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App