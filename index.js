const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

let baseRate = null;

bot.start((ctx) => {
  ctx.reply('سلام! این ربات برای مدیریت نرخ ارز طراحی شده است.');
});

bot.command('setrate', async (ctx) => {
  const input = ctx.message.text.split(' ')[1];
  const userId = ctx.message.from.id.toString();

  if (userId !== process.env.OWNER_ID) {
    ctx.reply('شما مجاز به استفاده از این دستور نیستید.');
    return;
  }

  if (!input || isNaN(Number(input))) {
    ctx.reply('لطفاً یک عدد معتبر وارد کنید.');
    return;
  }

  baseRate = Number(input);
  ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);

  try {
    const timeRes = await axios.get('https://time.ir', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const dateMatch = timeRes.data.match(/<span id="ctl00_cphTopRight_ucMiniToday_lblShamsiDate"[^>]*>(.*?)<\/span>/);
    const shamsiDate = dateMatch ? dateMatch[1].trim() : 'تاریخ نامشخص';

    const canvas = createCanvas(800, 1000);
    const ctx2 = canvas.getContext('2d');

    registerFont('fonts/Vazir-Bold.ttf', { family: 'Vazir' });

    ctx2.fillStyle = '#fff';
    ctx2.fillRect(0, 0, canvas.width, canvas.height);

    ctx2.fillStyle = '#000';
    ctx2.font = 'bold 36px Vazir';
    ctx2.fillText('📊 نرخ ارز امروز', 280, 70);

    ctx2.font = '28px Vazir';
    ctx2.fillText(`📅 ${shamsiDate}`, 280, 120);

    const rates = [
      { name: 'دلار 🇺🇸', value: baseRate },
      { name: 'یورو 🇪🇺', value: 'نامشخص' },
      { name: 'پوند 🇬🇧', value: 'نامشخص' },
      { name: 'درهم امارات 🇦🇪', value: 'نامشخص' },
      { name: 'لیر ترکیه 🇹🇷', value: 'نامشخص' },
      { name: 'یوان چین 🇨🇳', value: 'نامشخص' },
      { name: 'دلار استرالیا 🇦🇺', value: 'نامشخص' },
      { name: 'دلار کانادا 🇨🇦', value: 'نامشخص' },
      { name: 'بیت‌کوین ⚫', value: '6,203,100,000,000' }
    ];

    rates.forEach((item, i) => {
      ctx2.fillText(`${item.name}: ${item.value} تومان`, 100, 200 + i * 60);
    });

    ctx2.fillText('📤 ارسال شده با ربات مدیریتی PetroBot', 180, 900);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('exchange.png', buffer);

    await bot.telegram.sendPhoto(process.env.CHANNEL_ID, {
      source: buffer
    }, {
      caption: '📌 نرخ روز ارز توسط ربات PetroBot'
    });
  } catch (err) {
    console.error(err);
    ctx.reply('❌ خطا در دریافت اطلاعات یا ارسال تصویر.');
  }
});

bot.launch();
