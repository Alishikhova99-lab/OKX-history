import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../services/api'

export const ApiRegisterPage = () => {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedApi = apiKey.trim()
    const trimmedSecret = secretKey.trim()

    if (!trimmedApi || !trimmedSecret) {
      setError('Оба поля обязательны')
      return
    }

    setLoading(true)
    setError('')

    try {
      await registerApi({ apiKey: trimmedApi, secretKey: trimmedSecret })
      setApiKey('')
      setSecretKey('')
      navigate('/overview', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="screen px-6">
      <div className="mx-auto max-w-[420px] pt-8">
        <h1 className="text-2xl font-semibold">Подключение к OKX</h1>
        <p className="mt-2 text-sm text-[#9aa3b2]">Введите API ключи (read-only)</p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            className="glass number h-14 rounded-[24px] px-5 outline-none"
          />

          <div className="glass flex h-14 items-center rounded-[24px] px-5">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Secret Key"
              className="number h-full w-full bg-transparent outline-none"
            />
            <button
              type="button"
              className="text-xs text-[#9aa3b2]"
              onClick={() => setShowSecret((prev) => !prev)}
            >
              {showSecret ? 'Hide' : 'Show'}
            </button>
          </div>

          {error ? <div className="rounded-2xl border border-[#ea394380] bg-[#ea39431a] p-3 text-sm text-[#ea3943]">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-14 rounded-[24px] bg-[#4f8cff] font-semibold disabled:opacity-70"
          >
            {loading ? 'Подключение...' : 'Подключить'}
          </button>
        </form>
      </div>
    </section>
  )
}
