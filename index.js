const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const ownerId = process.env.OWNER_ID;
const channelId = process.env.CHANNEL_ID;

let baseRate = null;

bot.start((ctx) => {
  if (ctx.message.from.id.toString() !== ownerId) return;
  ctx.reply("سلام! این ربات برای مدیریت نرخ ارز آماده‌ست.");
});

bot.command("setrate", (ctx) => {
  if (ctx.message.from.id.toString() !== ownerId) return;

  const parts = ctx.message.text.split(" ");
  if (parts.length !== 2) {
    ctx.reply("فرمت درست دستور: /setrate 93000");
    return;
  }

  baseRate = parseInt(parts[1]);
  ctx.reply(`نرخ پایه ثبت شد: ${baseRate.toLocaleString()} تومان ✅`);

  const message = `
📊 نرخ ارز امروز 🇮🇷
-------------------------------
🇺🇸 دلار: ${baseRate.toLocaleString()} تومان
🇪🇺 یورو: نامشخص تومان
🇬🇧 پوند: نامشخص تومان
🇦🇪 درهم امارات: نامشخص تومان
🇹🇷 لیر ترکیه: نامشخص تومان
🇨🇳 یوان چین: نامشخص تومان
🇯🇵 ین ژاپن: نامشخص تومان
🇦🇺 دلار استرالیا: نامشخص تومان
🇨🇦 دلار کانادا: نامشخص تومان
🪙 بیت‌کوین: 6,203,100,000,000 تومان
🔄 ارسال شده با ربات مدیریتی PetroBot
`;

  bot.telegram.sendMessage(channelId, message);
});

bot.launch();
