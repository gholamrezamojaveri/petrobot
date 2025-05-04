require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');

registerFont('./Vazir.ttf', { family: 'Vazir' }); // فونت فارسی

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
    return ctx.reply('❗ لطفاً نرخ دلار را به صورت عددی وارد کنید. مثال: /setrate 93000');
  }

  baseRate = parseInt(input);
  ctx.reply(`✅ نرخ پایه دلار ثبت شد: ${baseRate.toLocaleString()} تومان`);

  const rates_currency = [
    ["🇺🇸 دلار", baseRate],
    ["🇪🇺 یورو", Math.round(baseRate * 1.1)],
    ["🇬🇧 پوند", Math.round(baseRate * 1.31)],
    ["🇦🇪 درهم", Math.round(baseRate * 0.27)],
    ["🇹🇷 لیر", Math.round(baseRate * 0.032)],
    ["🇨🇳 یوان", Math.round(baseRate * 0.14)],
    ["🇦🇺 دلار استرالیا", Math.round(baseRate * 0.66)],
    ["🇨🇦 دلار کانادا", Math.round(baseRate * 0.75)],
    ["🪙 تتر", baseRate]
  ];

  const rates_gold = [
    ["انس طلا", "3,222"],
    ["مثقال طلا", "30,476,000"],
    ["طلای 18 عیار", "7,035,400"],
    ["طلای 24 عیار", "9,379,600"],
    ["سکه قدیم", "74,000,000"],
    ["سکه جدید", "82,300,000"],
    ["نیم سکه", "51,900,000"],
    ["ربع سکه", "27,000,000"],
    ["سکه گرمی", "14,000,000"]
  ];

  const canvas = createCanvas(1080, 1080);
  const ctx2 = canvas.getContext('2d');

  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

  ctx2.fillStyle = '#000';
  ctx2.font = 'bold 40px Vazir';
  ctx2.fillText('📊 نرخ ارز', 100, 100);
  ctx2.fillText('📊 نرخ طلا و سکه', 600, 100);

  ctx2.font = '28px Vazir';
  let y = 160;
  for (let [label, price] of rates_currency) {
    ctx2.fillStyle = parseInt(price) > baseRate ? 'green' : (parseInt(price) < baseRate ? 'red' : 'black');
    ctx2.fillText(`${label}: ${parseInt(price).toLocaleString()} تومان`, 100, y);
    y += 50;
  }

  y = 160;
  for (let [label, price] of rates_gold) {
    ctx2.fillStyle = 'black';
    ctx2.fillText(`${label}: ${price} تومان`, 600, y);
    y += 50;
  }

  const msgDate = new Date(ctx.message.date * 1000);
  const timeString = msgDate.toLocaleTimeString('fa-IR');
  const dateString = msgDate.toLocaleDateString('fa-IR');
  ctx2.font = '24px Vazir';
  ctx2.fillStyle = '#000';
  ctx2.fillText(`📅 ${dateString} | ⏰ ${timeString}`, 300, 950);

  ctx2.font = '20px Vazir';
  ctx2.fillStyle = '#888';
  ctx2.fillText('📎 PetroMoney | @moneypetro', 350, 990);

  try {
    const logo = await loadImage('./logo.png'); // لوگو در همین مسیر باید باشه
    ctx2.drawImage(logo, 870, 20, 150, 70);
  } catch (err) {
    console.log("⚠️ لوگو پیدا نشد یا بارگذاری نشد:", err.message);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('final_output.png', buffer);

  try {
    await ctx.telegram.sendPhoto(CHANNEL_ID, {
      source: buffer
    }, {
      caption: '📡 گزارش تصویری نرخ ارز و طلا - Petrobot'
    });
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ خطا در ارسال تصویر: ${err.message}`);
  }
});

bot.launch();
