import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register, login } from "../api/auth"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError("Заполни все поля")
      return
    }
    try {
      await register(name, email, password)
      const token = await login(email, password)
      localStorage.setItem("token", token.access_token)
      navigate("/changes")
    } catch {
      setError("Ошибка регистрации — возможно email уже занят")
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h1>Регистрация</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSubmit}>Зарегистрироваться</button>
        <button onClick={() => navigate("/login")}>Уже есть аккаунт → Войти</button>
      </div>
    </div>
  )
}