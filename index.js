require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const { createCanvas, registerFont, loadImage } = require('canvas');

registerFont('./Vazir.ttf', { family: 'Vazir' });

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;

let baseRate = null;

bot.command('setrate', async (ctx) => {
  if (ctx.from.id.toString() !== OWNER_ID) {
    return ctx.reply('⛔ فقط مدیر ربات می‌تواند نرخ پایه را وارد کند.');
  }

  const input = ctx.message.text.split(' ')[1];
  if (!input || isNaN(input)) {
    return ctx.reply('❗ لطفاً نرخ دلار را به‌صورت عددی وارد کنید. مثال: /setrate 86500');
  }

  baseRate = parseInt(input);
  await ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);
  await generateImageAndSend(ctx);
});

async function generateImageAndSend(ctx) {
  try {
    // نرخ جهانی ارزها به دلار (از xe.com دستی به‌روز شده)
    const rates = {
      "یورو": 1.13015,
      "پوند": 1.31,
      "درهم": 3.6725,
      "لیر": 0.032,
      "یوان": 0.14,
      "دلار استرالیا": 0.66,
      "دلار کانادا": 0.75,
      "تتر": 1.0
    };

    const gold = {
      "انس طلا": "3,241",
      "طلای ۱۸ عیار": "6,798,000",
      "مثقال طلا": "29,480,000",
      "سکه امامی": "76,600,000",
      "نیم سکه": "45,800,000",
      "ربع سکه": "26,800,000",
      "سکه گرمی": "13,800,000"
    };

    const now = new Date();
    const time = now.toLocaleTimeString('fa-IR');
    const date = now.toLocaleDateString('fa-IR');

    const canvas = createCanvas(1080, 1080);
    const c = canvas.getContext('2d');

    c.fillStyle = '#f5f5f5';
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.font = 'bold 36px Vazir';
    c.fillStyle = '#000';
    c.fillText('نرخ ارز', 120, 80);
    c.fillText('نرخ طلا و سکه', 650, 80);

    c.font = '28px Vazir';
    let y = 150;
    for (const [key, value] of Object.entries(rates)) {
      const toman = Math.round(value * baseRate).toLocaleString();
      c.fillText(`${key}: ${toman} تومان`, 100, y);
      y += 45;
    }

    y = 150;
    for (const [key, value] of Object.entries(gold)) {
      c.fillText(`${key}: ${value} تومان`, 650, y);
      y += 45;
    }

    // زمان و تاریخ
    c.font = '24px Vazir';
    c.fillStyle = '#333';
    c.fillText(`📅 ${date}   ⏰ ${time}`, 360, 950);

    // لوگو
    try {
      const logo = await loadImage('./logo.png');
      c.drawImage(logo, 900, 30, 150, 60);
    } catch (e) {
      console.warn('لوگو بارگذاری نشد:', e.message);
    }

    c.font = '20px Vazir';
    c.fillStyle = '#777';
    c.fillText('📎 PetroBot | @moneypetro', 350, 1000);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('final.png', buffer);

    await ctx.telegram.sendPhoto(CHANNEL_ID, { source: buffer }, {
      caption: '📡 نرخ رسمی ارز و طلا بر اساس دلار پایه'
    });
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ خطا در ایجاد یا ارسال تصویر: ${err.message}`);
  }
}

bot.launch();
