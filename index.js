const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

let baseRate = null;

bot.start((ctx) => {
  ctx.reply('سلام! این ربات برای مدیریت نرخ ارز آماده‌ست.');
});

bot.command('setrate', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length === 2) {
    baseRate = parts[1];
    ctx.reply(`نرخ پایه ثبت شد: ${baseRate} تومان ✅`);

    const message = `📊 نرخ ارز امروز 🇮🇷\n------------------------------\n🇺🇸 دلار: ${baseRate} تومان\n🇪🇺 یورو: نامشخص تومان\n🇬🇧 پوند: نامشخص تومان\n🇦🇪 درهم امارات: نامشخص تومان\n🇹🇷 لیر ترکیه: نامشخص تومان\n🇨🇳 یوان چین: نامشخص تومان\n🇦🇺 دلار استرالیا: نامشخص تومان\n🇨🇦 دلار کانادا: نامشخص تومان\n⚫ بیت‌کوین: 6,203,100,000,000 تومان\n\n🕹 ارسال شده با ربات مدیریتی PetroBot`;

    ctx.telegram.sendMessage(process.env.CHANNEL_ID, message);
  } else {
    ctx.reply('فرمت صحیح دستور: /setrate 93000');
  }
});

bot.launch();
