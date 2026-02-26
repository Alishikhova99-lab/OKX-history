const statusNode = document.getElementById('status')
const outputNode = document.getElementById('output')
const authBtn = document.getElementById('authBtn')

const setStatus = (value) => {
  if (statusNode) {
    statusNode.textContent = value
  }
}

const setOutput = (value) => {
  if (outputNode) {
    outputNode.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  }
}

const webApp = window.Telegram?.WebApp
if (webApp) {
  webApp.ready()
  webApp.expand()
  setStatus('Telegram WebApp подключен')
} else {
  setStatus('Telegram WebApp не найден (тест в браузере)')
}

const initData = webApp?.initData ?? ''
setOutput({ hasInitData: Boolean(initData), initDataLength: initData.length })

authBtn?.addEventListener('click', async () => {
  try {
    const response = await fetch('/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
    const data = await response.json()
    setOutput({ status: response.status, data })
  } catch (error) {
    setOutput({ error: String(error) })
  }
})
