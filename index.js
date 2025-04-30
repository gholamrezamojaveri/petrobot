require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createCanvas, registerFont } = require('canvas');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;

let baseRate = null;

bot.command('setrate', async (ctx) => {
  if (ctx.from.id.toString() !== OWNER_ID) return ctx.reply('شما مجاز نیستید.');

  const input = ctx.message.text.split(' ')[1];
  if (!input || isNaN(input)) return ctx.reply('فرمت صحیح: /setrate 93000');

  baseRate = parseInt(input);
  ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);

  try {
    const timeRes = await axios.get('https://time.ir/');
    const dateMatch = timeRes.data.match(/<span id="ctl00_cphTopRight_ucMiniToday_lblShamsiDate"[^>]*>(.*?)<\/span>/);
    const dateText = dateMatch ? dateMatch[1] : 'تاریخ نامشخص';

    const rates = {
      "🇺🇸 دلار": baseRate,
      "🇪🇺 یورو": Math.round(baseRate * 1.1),
      "🇬🇧 پوند": Math.round(baseRate * 1.31),
      "🇦🇪 درهم امارات": Math.round(baseRate * 0.27),
      "🇹🇷 لیر ترکیه": Math.round(baseRate * 0.032),
      "🇨🇳 یوان چین": Math.round(baseRate * 0.14),
      "🇦🇺 دلار استرالیا": Math.round(baseRate * 0.66),
      "🇨🇦 دلار کانادا": Math.round(baseRate * 0.75),
      "🪙 بیت‌کوین": 6203100000000
    };

    const canvas = createCanvas(1080, 1080);
    const ctx2d = canvas.getContext('2d');

    ctx2d.fillStyle = '#ffffff';
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);

    registerFont('Vazirmatn-Regular.ttf', { family: 'Vazir' });
    ctx2d.font = '36px Vazir';
    ctx2d.fillStyle = '#000000';
    ctx2d.fillText(`📊 نرخ ارز امروز`, 60, 60);
    ctx2d.font = '28px Vazir';
    ctx2d.fillText(`📅 ${dateText}`, 60, 100);

    let y = 160;
    for (const [label, val] of Object.entries(rates)) {
      ctx2d.fillText(`${label}: ${val.toLocaleString()} تومان`, 80, y);
      y += 50;
    }

    ctx2d.font = '24px Vazir';
    ctx2d.fillText('🌀 PetroMoney | @dreamofroseMENA', 60, 1040);

    const buffer = canvas.toBuffer('image/png');
    await ctx.telegram.sendPhoto(CHANNEL_ID, { source: buffer }, { caption: '📡 ارسال خودکار نرخ ارز' });

  } catch (err) {
    console.error(err);
    ctx.reply('❌ خطا در دریافت اطلاعات یا ارسال تصویر.');
  }
});

bot.launch();
