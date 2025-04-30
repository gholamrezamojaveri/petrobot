const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

let baseRate = null;

bot.start((ctx) => {
  ctx.reply('سلام! این ربات برای مدیریت نرخ ارز آماده‌ست.');
});

bot.command('setrate', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length !== 2 || isNaN(parts[1])) {
    return ctx.reply('❌ فرمت صحیح: /setrate 93000');
  }
  baseRate = Number(parts[1]);
  ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);
  sendExchangeImage();
});

async function sendExchangeImage() {
  if (!baseRate) return;

  const canvas = createCanvas(800, 650);
  const ctx = canvas.getContext('2d');

  // پس‌زمینه سفید
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // تیتر
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('📊 نرخ ارز امروز', 300, 50);

  // تاریخ شمسی از time.ir
  let shamsiDate = '';
  try {
    const timeRes = await axios.get('https://time.ir');
    const match = timeRes.data.match(/<span id="ctl00_cphTopRight_ucMiniToday_lblShamsiDate"[^>]*>(.*?)<\/span>/);
    if (match) {
      shamsiDate = match[1];
    }
  } catch (error) {
    shamsiDate = 'تاریخ نامشخص';
  }

  ctx.font = '20px sans-serif';
  ctx.fillText(`📅 ${shamsiDate}`, 300, 90);

  // نرخ دلار
  ctx.font = 'bold 26px sans-serif';
  ctx.fillStyle = '#222';
  ctx.fillText(`🇺🇸 دلار: ${baseRate.toLocaleString()} تومان`, 100, 150);

  // نرخ ارزهای دیگر با ضریب دلار
  const currencies = [
    ['🇪🇺 یورو', 1.07],
    ['🇬🇧 پوند', 1.25],
    ['🇦🇪 درهم', 0.27],
    ['🇹🇷 لیر ترکیه', 0.03],
    ['🇨🇳 یوان چین', 0.14],
    ['🇦🇺 دلار استرالیا', 0.65],
    ['🇨🇦 دلار کانادا', 0.73],
    ['⚫ بیت‌کوین', 6203100000000 / baseRate]
  ];

  let y = 200;
  ctx.font = '22px sans-serif';
  currencies.forEach(([name, ratio]) => {
    const value = Math.round(baseRate * ratio).toLocaleString();
    ctx.fillText(`${name}: ${value} تومان`, 100, y);
    y += 40;
  });

  // ذخیره و ارسال
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('exchange.png', buffer);

  try {
    await bot.telegram.sendPhoto(process.env.CHANNEL_ID, { source: 'exchange.png' }, {
      caption: '📢 ارسال شده با ربات مدیریت PetroBot'
    });
  } catch (err) {
    console.error('❌ خطا در ارسال تصویر:', err.message);
  }
}

bot.launch();
