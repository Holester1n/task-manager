import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { getSystems, getSubscriptions, subscribe, unsubscribe } from "../api/systems"
import type { System } from "../types"
import client from "../api/client"

export default function ProfilePage() {
  const user = useCurrentUser()
  const [chatId, setChatId] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [systems, setSystems] = useState<System[]>([])
  const [subscribedIds, setSubscribedIds] = useState<number[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadSystems()
  }, [])

  const loadSystems = async () => {
    const [allSystems, subs] = await Promise.all([
      getSystems(),
      getSubscriptions()
    ])
    setSystems(allSystems)
    setSubscribedIds(subs.subscribed_system_ids)
  }

  const handleConnect = async () => {
    if (!chatId) {
      setError("Введи chat_id")
      return
    }
    try {
      await client.post(`/users/telegram/connect?chat_id=${chatId}`)
      setSuccess(true)
      setError("")
    } catch {
      setError("Ошибка подключения")
    }
  }

  const handleToggleSubscription = async (system_id: number) => {
    if (subscribedIds.includes(system_id)) {
      await unsubscribe(system_id)
      setSubscribedIds(prev => prev.filter(id => id !== system_id))
    } else {
      await subscribe(system_id)
      setSubscribedIds(prev => [...prev, system_id])
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <button onClick={() => navigate("/changes")}>← Назад</button>
      <h1>Профиль</h1>

      {user && (
        <div style={{ marginBottom: "24px" }}>
          <p><b>Имя:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p>
            <b>Telegram:</b>{" "}
            {user.telegram_chat_id
              ? <span style={{ color: "green" }}>✅ Подключён</span>
              : <span style={{ color: "red" }}>❌ Не подключён</span>
            }
          </p>
        </div>
      )}

      {!user?.telegram_chat_id && (
        <>
          <h3>Подключить Telegram</h3>
          <p style={{ color: "#666" }}>
            Найдите бота в Telegram, напишите /start и вставьте сюда полученный chat_id
          </p>
          {success && <p style={{ color: "green" }}>Telegram подключён! Обнови страницу.</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              placeholder="Твой chat_id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
            <button onClick={handleConnect}>Подключить</button>
          </div>
        </>
      )}

      <h3 style={{ marginTop: "32px" }}>Подписки на системы</h3>
      <p style={{ color: "#666" }}>Получайте уведомления об изменениях в выбранных системах</p>

      {systems.map((system) => (
        <div key={system.id} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "8px"
        }}>
          <span>{system.name}</span>
          <button
            onClick={() => handleToggleSubscription(system.id)}
            style={{
              background: subscribedIds.includes(system.id) ? "#dc3545" : "#198754",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            {subscribedIds.includes(system.id) ? "Отписаться" : "Подписаться"}
          </button>
        </div>
      ))}
    </div>
  )
}