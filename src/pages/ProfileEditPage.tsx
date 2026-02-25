import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../services/api'
import type { ProfileData } from '../types/models'

export const ProfileEditPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const data = await getProfile()
      setProfile(data)
      setName(data.name)
      setSelectedAvatar(data.avatar)
    }

    load()
  }, [])

  const handleChooseAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const onSave = async () => {
    if (!profile) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await updateProfile({ name, username: profile.username, avatar: selectedAvatar })
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <section className="screen px-4">
        <div className="mx-auto h-64 max-w-[460px] animate-pulse rounded-[28px] bg-[#282828]" />
      </section>
    )
  }

  return (
    <section className="min-h-dvh bg-[#1c1c1c]">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#232323] px-4 py-4">
        <button type="button" onClick={() => navigate('/profile')} className="text-[1.2rem] font-medium text-[#9ca4b2]">
          Назад
        </button>

        <h1 className="text-[1.35rem] font-semibold text-white">Изменить профиль</h1>

        <button type="button" onClick={onSave} disabled={saving} className="text-[1.2rem] font-semibold text-[#e4e9f2] disabled:opacity-55">
          {saving ? '...' : 'Готово'}
        </button>
      </header>

      <div className="mx-auto max-w-[460px] px-4 pb-8 pt-6">
        <article className="profile-hero rounded-[28px] border border-white/10 px-5 pb-8 pt-8 text-center">
          <div className="relative mx-auto h-[132px] w-[132px]">
            <img
              src={selectedAvatar || '/default-avatar.svg'}
              alt={profile.name}
              className="h-full w-full rounded-full object-cover"
              style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}
            />
            <button type="button" onClick={handleChooseAvatar} className="profile-glass-btn absolute bottom-0 right-0 grid h-11 w-11 place-items-center rounded-full text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15.7 4.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4L9 19H5v-4l10.7-10.7Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          </div>

          <h2 className="mt-5 text-[2.15rem] font-semibold leading-none text-white">{name || profile.name}</h2>
        </article>

        <div className="mt-6 grid gap-4">
          <label className="profile-input-wrap rounded-[24px] p-[18px]">
            <p className="text-[0.95rem] text-[#9aa3b2]">Имя</p>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="profile-input-field mt-2 w-full bg-transparent text-[1.7rem] leading-none text-white outline-none"
              placeholder="Введите имя"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-center text-sm text-[#ff6c7b]">{error}</p> : null}
      </div>
    </section>
  )
}
