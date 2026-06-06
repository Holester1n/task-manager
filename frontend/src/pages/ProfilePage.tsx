import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { getSystems, getSubscriptions, subscribe, unsubscribe } from "../api/systems"
import { getUsers, changeRole } from "../api/auth"
import type { System, User } from "../types"
import client from "../api/client"

export default function ProfilePage() {
  const user = useCurrentUser()
  const [chatId, setChatId] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [systems, setSystems] = useState<System[]>([])
  const [subscribedIds, setSubscribedIds] = useState<number[]>([])
  const [users, setUsers] = useState<User[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadSystems()
  }, [])

  useEffect(() => {
    if (user?.role === "admin") {
      getUsers().then(setUsers)
    }
  }, [user])

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

  const handleRoleChange = async (user_id: number, role: string) => {
    await changeRole(user_id, role)
    getUsers().then(setUsers)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/changes")} className="text-gray-400 hover:text-white transition">← Назад</button>
          <h1 className="text-2xl font-bold">Профиль</h1>
        </div>

        {user && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <p><span className="text-gray-400">Имя:</span> {user.name}</p>
            <p className="mt-1"><span className="text-gray-400">Email:</span> {user.email}</p>
            <p className="mt-1">
              <span className="text-gray-400">Роль:</span>{" "}
              <span className={user.role === "admin" ? "text-yellow-400" : "text-gray-300"}>
                {user.role === "admin" ? "👑 Админ" : "Пользователь"}
              </span>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">Telegram:</span>{" "}
              {user.telegram_chat_id
                ? <span className="text-green-400">✅ Подключён</span>
                : <span className="text-red-400">❌ Не подключён</span>
              }
            </p>
          </div>
        )}

        {!user?.telegram_chat_id && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h3 className="font-semibold mb-2">Подключить Telegram</h3>
            <p className="text-gray-400 text-sm mb-4">Найди бота в Telegram, напиши /start и вставь сюда полученный chat_id</p>
            {success && <p className="text-green-400 text-sm mb-3">Telegram подключён! Обнови страницу.</p>}
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <div className="flex gap-2">
              <input
                placeholder="Твой chat_id"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 outline-none text-sm flex-1"
              />
              <button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm transition">Подключить</button>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-2">Подписки на системы</h3>
          <p className="text-gray-400 text-sm mb-4">Получай уведомления об изменениях в выбранных системах</p>
          {systems.map((system) => (
            <div key={system.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
              <span className="text-sm">{system.name}</span>
              <button
                onClick={() => handleToggleSubscription(system.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  subscribedIds.includes(system.id)
                    ? "bg-red-600/20 hover:bg-red-600/40 text-red-400"
                    : "bg-green-600/20 hover:bg-green-600/40 text-green-400"
                }`}
              >
                {subscribedIds.includes(system.id) ? "Отписаться" : "Подписаться"}
              </button>
            </div>
          ))}
        </div>

        {user?.role === "admin" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold mb-4">👑 Управление пользователями</h3>
            {users.map((u) => (
              <div key={u.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none"
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Админ</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}