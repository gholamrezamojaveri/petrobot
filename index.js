require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createCanvas, registerFont, loadImage } = require('canvas');
const axios = require('axios');
const fs = require('fs');

registerFont('./Vazir.ttf', { family: 'Vazir' });

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

  // زمان فعلی از تلگرام
  const now = new Date(ctx.message.date * 1000);
  const dateStr = now.toLocaleDateString('fa-IR');
  const timeStr = now.toLocaleTimeString('fa-IR');

  // نرخ‌های محاسبه‌ای ارز
  const currencyRates = {
    "🇺🇸 دلار": baseRate,
    "🇪🇺 یورو": Math.round(baseRate * 1.1),
    "🇬🇧 پوند": Math.round(baseRate * 1.31),
    "🇦🇪 درهم": Math.round(baseRate * 0.27),
    "🇹🇷 لیر": Math.round(baseRate * 0.032),
    "🇨🇳 یوان": Math.round(baseRate * 0.14),
    "🇦🇺 دلار استرالیا": Math.round(baseRate * 0.66),
    "🇨🇦 دلار کانادا": Math.round(baseRate * 0.75),
    "💵 تتر": baseRate
  };

  // نرخ فرضی طلا و سکه (در نسخه کامل میشه از سایت واقعی گرفت)
  const goldRates = {
    "انس طلا": "3,222",
    "مثقال طلا": "30,476,000",
    "طلای ۱۸ عیار": "7,035,400",
    "طلای ۲۴ عیار": "9,379,600",
    "سکه امامی": "82,300,000",
    "سکه بهار": "74,000,000",
    "نیم سکه": "51,900,000",
    "ربع سکه": "27,000,000",
    "سکه گرمی": "14,000,000"
  };

  const canvas = createCanvas(1080, 1080);
  const ctx2 = canvas.getContext('2d');

  // پس‌زمینه سفید
  ctx2.fillStyle = '#fff';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

  // عنوان‌ها
  ctx2.fillStyle = '#000';
  ctx2.font = 'bold 40px Vazir';
  ctx2.fillText('📊 نرخ ارز', 100, 100);
  ctx2.fillText('📊 نرخ طلا و سکه', 620, 100);

  // رسم جدول نرخ ارز
  let y = 170;
  ctx2.font = '28px Vazir';
  for (const [label, value] of Object.entries(currencyRates)) {
    ctx2.fillStyle = '#000';
    ctx2.fillText(`${label}: ${value.toLocaleString()} تومان`, 100, y);
    y += 50;
  }

  // رسم جدول نرخ طلا و سکه
  y = 170;
  for (const [label, value] of Object.entries(goldRates)) {
    ctx2.fillStyle = '#000';
    ctx2.fillText(`${label}: ${value} تومان`, 620, y);
    y += 50;
  }

  // درج تاریخ و زمان
  ctx2.fillStyle = '#000';
  ctx2.font = '24px Vazir';
  ctx2.fillText(`📅 ${dateStr}   ⏰ ${timeStr}`, 350, 950);

  // نوشته نهایی پایین تصویر
  ctx2.font = '20px Vazir';
  ctx2.fillStyle = '#666';
  ctx2.fillText('📎 تهیه و تنظیم توسط PetroMoney | @moneypetro', 270, 990);

  // درج لوگو در بالا سمت راست
  try {
    const logo = await loadImage('./logo.png');
    ctx2.drawImage(logo, 880, 20, 160, 60);
  } catch (err) {
    console.log("⚠️ لوگو بارگذاری نشد:", err.message);
  }

  // تبدیل تصویر به بافر و ارسال
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('output.png', buffer);

  try {
    await ctx.telegram.sendPhoto(CHANNEL_ID, {
      source: buffer
    }, {
      caption: '📡 گزارش تصویری نرخ ارز و طلا - PetroBot'
    });
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ خطا در ارسال تصویر: ${err.message}`);
  }
});

bot.launch();
