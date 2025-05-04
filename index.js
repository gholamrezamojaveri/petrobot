require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');

registerFont('./Vazir.ttf', { family: 'Vazir' });

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;

let baseRate = null; // نرخ پایه دلار به تومان

bot.command('setrate', async (ctx) => {
  if (ctx.from.id.toString() !== OWNER_ID) {
    return ctx.reply('⛔ فقط مدیر مجاز به وارد کردن نرخ پایه است.');
  }

  const input = ctx.message.text.split(' ')[1];
  if (!input || isNaN(input)) {
    return ctx.reply('❗ لطفاً نرخ پایه دلار را به‌صورت عدد وارد کنید. مثال: /setrate 86500');
  }

  baseRate = parseInt(input);
  await ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);
  await generateAndSendImage(ctx);
});

async function generateAndSendImage(ctx) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fa-IR');
  const dateStr = now.toLocaleDateString('fa-IR');

  try {
    // نرخ‌های جهانی بر حسب USD (از xe.com یا ثابت)
    const globalRates = {
      "EUR": 1.13015,
      "AED": 3.6725,
      "GBP": 1.31,
      "TRY": 0.032,
      "CNY": 0.14,
      "AUD": 0.66,
      "CAD": 0.75,
      "USDT": 1.0
    };

    // محاسبه نرخ به تومان
    const computedRates = {};
    for (const [symbol, usdRate] of Object.entries(globalRates)) {
      computedRates[symbol] = Math.round(usdRate * baseRate);
    }

    // نرخ فرضی طلا و سکه (می‌توان به منابع زنده وصل کرد)
    const goldRates = {
      "انس طلا": "3,241",
      "طلای ۱۸ عیار": "6,798,000",
      "مثقال طلا": "29,480,000",
      "سکه امامی": "76,600,000",
      "نیم سکه": "45,800,000",
      "ربع سکه": "26,800,000",
      "سکه گرمی": "13,800,000"
    };

    const canvas = createCanvas(1080, 1080);
    const ctx2 = canvas.getContext('2d');

    // پس‌زمینه سفید
    ctx2.fillStyle = '#fff';
    ctx2.fillRect(0, 0, canvas.width, canvas.height);

    // عنوان ستون‌ها
    ctx2.fillStyle = '#000';
    ctx2.font = 'bold 36px Vazir';
    ctx2.fillText('📊 نرخ ارز', 100, 80);
    ctx2.fillText('📊 نرخ طلا و سکه', 650, 80);

    // ارزها
    ctx2.font = '28px Vazir';
    let y1 = 150;
    for (const [symbol, irr] of Object.entries(computedRates)) {
      ctx2.fillText(`${symbol}: ${irr.toLocaleString()} تومان`, 100, y1);
      y1 += 45;
    }

    // طلا و سکه
    let y2 = 150;
    for (const [label, val] of Object.entries(goldRates)) {
      ctx2.fillText(`${label}: ${val} تومان`, 650, y2);
      y2 += 45;
    }

    // تاریخ و ساعت
    ctx2.font = '24px Vazir';
    ctx2.fillText(`📅 ${dateStr}   ⏰ ${timeStr}`, 360, 960);

    // لوگو
    try {
      const logo = await loadImage('./logo.png');
      ctx2.drawImage(logo, 900, 20, 150, 60);
    } catch (e) {
      console.warn('⚠️ لوگو بارگذاری نشد:', e.message);
    }

    // امضا
    ctx2.font = '20px Vazir';
    ctx2.fillStyle = '#666';
    ctx2.fillText('📎 تهیه شده توسط PetroBot | @moneypetro', 280, 1000);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('final.png', buffer);

    await ctx.telegram.sendPhoto(CHANNEL_ID, { source: buffer }, {
      caption: '📡 نرخ رسمی ارز و طلا - با محاسبه خودکار بر اساس دلار پایه'
    });

  } catch (err) {
    console.error(err);
    ctx.reply(`❌ خطا در ایجاد یا ارسال تصویر: ${err.message}`);
  }
}

bot.launch();
