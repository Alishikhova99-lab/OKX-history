import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteApi, getProfile, syncData } from '../services/api'
import type { ProfileData } from '../types/models'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = async () => {
    const data = await getProfile()
    setProfile(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const refresh = async () => {
    setSyncing(true)
    await syncData()
    await load()
    setSyncing(false)
  }

  const removeApi = async () => {
    await deleteApi()
    navigate('/api-register', { replace: true })
  }

  if (loading || !profile) {
    return (
      <section className="screen px-4 pb-32">
        <div className="mx-auto h-64 max-w-[460px] animate-pulse rounded-[28px] bg-[#282828]" />
      </section>
    )
  }

  return (
    <section className="screen px-4 pb-32">
      <div className="mx-auto max-w-[460px] space-y-3">
        <article className="profile-hero rounded-[28px] border border-white/10 px-5 pb-8 pt-4 text-center">
          <div className="mb-7 flex justify-end">
            <button type="button" onClick={() => navigate('/profile-edit')} className="profile-glass-btn h-10 rounded-[20px] px-6 text-base font-semibold text-white">
              Изменить
            </button>
          </div>

          <img
            src={profile.avatar}
            alt={profile.name}
            className="mx-auto mb-4 h-[116px] w-[116px] rounded-full object-cover"
            style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}
          />
          <h1 className="text-[2.05rem] font-semibold leading-none text-white">{profile.name}</h1>
        </article>

        <article className="profile-panel rounded-[24px] p-[18px] text-sm">
          <div className="flex justify-between">
            <span className="text-[#9aa3b2]">API status</span>
            <span className={`inline-flex items-center gap-2 ${profile.apiConnected ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
              {profile.apiConnected ? <span className="h-2.5 w-2.5 rounded-full bg-[#16c784]" /> : <span className="h-2.5 w-2.5 rounded-full bg-[#ea3943]" />}
              {profile.apiConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-[#9aa3b2]">API key</span>
            <span className="number">{profile.maskedApi}</span>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <span className="text-[#9aa3b2]">Последняя синхронизация</span>
            <span className="number text-right">{new Date(profile.lastSync).toLocaleString()}</span>
          </div>
        </article>

        <button type="button" onClick={refresh} disabled={syncing} className="h-12 w-full rounded-[20px] bg-[linear-gradient(135deg,#4F8CFF,#6C63FF)] text-sm font-semibold text-white disabled:opacity-70">
          {syncing ? 'Синхронизация...' : 'Обновить данные'}
        </button>

        <button
          type="button"
          onClick={removeApi}
          className="h-12 w-full rounded-[20px] border border-[rgba(255,80,80,0.5)] bg-[rgba(255,0,0,0.05)] text-sm font-semibold text-[#FF4D4F]"
        >
          Удалить API
        </button>
      </div>
    </section>
  )
}
