require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const channelId = process.env.CHANNEL_ID;
const ownerId = process.env.OWNER_ID;
let baseRate = null;

bot.start((ctx) => {
  ctx.reply('سلام! این ربات برای مدیریت نرخ ارز آماده‌ست.');
});

bot.command('setrate', async (ctx) => {
  if (ctx.from.id.toString() !== ownerId) return;

  const input = ctx.message.text.split(' ')[1];
  if (!input || isNaN(input)) {
    return ctx.reply('❌ لطفاً عدد نرخ را درست وارد کن: /setrate 91000');
  }

  baseRate = parseInt(input);
  ctx.reply(`✅ نرخ پایه ثبت شد: ${baseRate.toLocaleString()} تومان`);

  const rates = await fetchXERates();
  const converted = convertRates(rates, baseRate);
  const message = formatMessage(converted);

  await bot.telegram.sendMessage(channelId, message, { parse_mode: 'HTML' });
});

async function fetchXERates() {
  const symbols = ['EUR', 'GBP', 'AED', 'TRY', 'CNY', 'AUD', 'CAD'];
  const results = {};

  for (const sym of symbols) {
    try {
      const url = `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${sym}&To=USD`;
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);
      const text = $('p.result__BigRate-sc-1bsijpp-1').first().text();
      const rate = parseFloat(text.replace(/[^0-9.]/g, ''));
      results[sym] = rate;
    } catch (e) {
      results[sym] = null;
    }
  }

  results['BTC'] = 66700000;
  results['USD'] = 1;
  return results;
}

function convertRates(rates, base) {
  const converted = {};
  for (const key in rates) {
    if (rates[key]) {
      converted[key] = Math.round(rates[key] * base);
    } else {
      converted[key] = 'نامشخص';
    }
  }
  return converted;
}

function formatMessage(r) {
  return `
📊 <b>نرخ ارز امروز</b>
--------------------------------
💵 دلار: ${r.USD.toLocaleString()} تومان
💶 یورو: ${r.EUR.toLocaleString()} تومان
💷 پوند: ${r.GBP.toLocaleString()} تومان
🇦🇪 درهم امارات: ${r.AED.toLocaleString()} تومان
🇹🇷 لیر ترکیه: ${r.TRY.toLocaleString()} تومان
🇨🇳 یوان چین: ${r.CNY.toLocaleString()} تومان
🇦🇺 دلار استرالیا: ${r.AUD.toLocaleString()} تومان
🇨🇦 دلار کانادا: ${r.CAD.toLocaleString()} تومان
🪙 بیت‌کوین: ${r.BTC.toLocaleString()} تومان
--------------------------------
⏱ ارسال شده با ربات مدیریتی PetroBot
  `.trim();
}

bot.launch();
