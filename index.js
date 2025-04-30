require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createCanvas } = require('canvas');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;

let baseRate = null;

bot.command('setrate', async (ctx) => {
  if (ctx.from.id.toString() !== OWNER_ID) {
    return ctx.reply('⛔ شما مجاز نیستید.');
  }

  const input = ctx.message.text.split(' ')[1];
  if (!input || isNaN(input)) {
    return ctx.reply('❗ لطفاً نرخ دلار را عددی وارد کنید. مثال: /setrate 93000');
  }

  baseRate = parseInt(input);
  ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);

  // گرفتن تاریخ و زمان از تلگرام
  const msgDate = new Date(ctx.message.date * 1000);
  const timeString = msgDate.toLocaleTimeString('fa-IR');
  const dateString = msgDate.toLocaleDateString('fa-IR');

  const rates = {
    "🇺🇸 دلار": baseRate,
    "🇪🇺 یورو": Math.round(baseRate * 1.1),
    "🇬🇧 پوند": Math.round(baseRate * 1.31),
    "🇦🇪 درهم": Math.round(baseRate * 0.27),
    "🇹🇷 لیر": Math.round(baseRate * 0.032),
    "🇨🇳 یوان": Math.round(baseRate * 0.14),
    "🇦🇺 دلار استرالیا": Math.round(baseRate * 0.66),
    "🇨🇦 دلار کانادا": Math.round(baseRate * 0.75),
    "🪙 بیت‌کوین": 6203100000000
  };

  const canvas = createCanvas(800, 1000);
  const ctx2 = canvas.getContext('2d');

  ctx2.fillStyle = '#fff';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

  ctx2.fillStyle = '#000';
  ctx2.font = 'bold 30px sans-serif';
  ctx2.fillText('📊 نرخ ارز امروز', 250, 60);
  ctx2.font = '24px sans-serif';
  ctx2.fillText(`📅 ${dateString} - ⏰ ${timeString}`, 180, 100);

  let y = 160;
  ctx2.font = '22px sans-serif';

  for (const [label, value] of Object.entries(rates)) {
    ctx2.fillText(`${label}: ${value.toLocaleString()} تومان`, 80, y);
    y += 40;
  }

  ctx2.font = '20px sans-serif';
  ctx2.fillText('📎 PetroBot | @dreamofroseMENA', 200, 950);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('exchange.png', buffer);

  try {
    await ctx.telegram.sendPhoto(CHANNEL_ID, {
      source: buffer
    }, {
      caption: '📡 نرخ روز با تاریخ دقیق - ارسال شده توسط PetroBot'
    });
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ خطا در ارسال: ${err.message}`);
  }
});

bot.launch();
