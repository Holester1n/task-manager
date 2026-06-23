import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../api/auth"
import client from "../api/client"

export default function LoginPage() {
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem("serverUrl") || "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!serverUrl) {
      setError("Введите адрес сервера")
      return
    }
    localStorage.setItem("serverUrl", serverUrl)
    client.defaults.baseURL = serverUrl

    try {
      const token = await login(email, password)
      localStorage.setItem("token", token.access_token)
      navigate("/changes")
    } catch {
      setError("Неверный email или пароль")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Вход</h1>
        <p className="text-gray-400 mb-6">Change Tracker</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="url"
            placeholder="Адрес сервера (http://...)"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-3 transition"
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            Нет аккаунта? Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
}