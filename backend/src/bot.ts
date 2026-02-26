import TelegramBot from 'node-telegram-bot-api'
import { env } from './config/env.js'

if (!env.telegramBotToken) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN for bot worker')
}

const bot = new TelegramBot(env.telegramBotToken, { polling: true })

const fallbackMiniAppUrl = env.backendPublicUrl ? `${env.backendPublicUrl.replace(/\/$/, '')}/miniapp` : ''
const candidateMiniAppUrl = env.frontendUrl || fallbackMiniAppUrl
const miniAppUrl = candidateMiniAppUrl.startsWith('https://') ? candidateMiniAppUrl : ''

bot.onText(/^\/start$/, async (message: TelegramBot.Message) => {
  const chatId = message.chat.id
  const text = miniAppUrl
    ? 'Bot is online. Tap the button below to open the Mini App.'
    : 'Bot is online. Configure HTTPS FRONTEND_URL or BACKEND_PUBLIC_URL.'

  if (!miniAppUrl) {
    await bot.sendMessage(chatId, text)
    return
  }

  await bot.sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: miniAppUrl } }]],
    },
  })
})

bot.on('polling_error', (error: Error) => {
  console.error('Telegram polling error:', error.message)
})

console.log('Telegram bot started')
