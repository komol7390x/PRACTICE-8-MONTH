import { Update, Start, On, Ctx, Command, Help } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { OnModuleInit } from '@nestjs/common';

interface BotSession {
    step?: 'FIRST_NAME' | 'LAST_NAME' | 'PHONE';
    firstName?: string;
    lastName?: string;
}

@Update()
export class BotUpdate implements OnModuleInit {
    constructor(private readonly botService: BotService) { }
    async onModuleInit() {
        console.log('🚀 Bot menyusi o\'rnatilmoqda...');
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        await ctx.reply(
            "📚 **Botdan foydalanish bo'yicha qo'llanma:**\n\n" +
            "/start - Botni qayta ishga tushirish\n" +
            "/help - Yordam olish\n" +
            "/profile - Mening profilim\n\n" +
            "Muammo yuzaga kelsa, adminga murojaat qiling."
        );
    }

    @Command('profile')
    async onProfile(@Ctx() ctx: Context) {
        if (!ctx.from) return;
        const user = await this.botService.findByTelegramId(String(ctx.from.id));

        if (user) {
            await ctx.reply(`
                👤 Profilingiz:\n\nTgId: ${user.id}\nTgUsername: ${user.tgUsername}\nIsm: ${user.firstName}\nFamiliya: ${user.lastName}\nTel: ${user.phoneNumber}`)

                ;
        } else {
            await ctx.reply("Siz hali ro'yxatdan o'tmagansiz. /start buyrug'ini bosing.");
        }
    }

    @Start()
    async onStart(@Ctx() ctx: Context & { session: BotSession }) {
        if (!ctx.from) return;

        const telegramId = String(ctx.from.id);
        const user = await this.botService.findByTelegramId(telegramId);

        if (user) {
            await ctx.reply(
                "📚 **Botdan foydalanish bo'yicha qo'llanma:**\n\n" +
                "/help - Yordam olish\n" +
                "/profile - Mening profilim\n\n" +
                "Muammo yuzaga kelsa, adminga murojaat qiling."
            );
            await ctx.reply(
                'Pastdagi tugma orqali ilovaga kiring:',
                Markup.inlineKeyboard([
                    [Markup.button.webApp('🚀 Ilovani ochish', 'https://twa-demo.netlify.app/')]
                ])
            );
            return
        }

        // Sessionni xavfsiz yaratish
        ctx.session = { step: 'FIRST_NAME' };

        await ctx.reply(
            "📝 Ismingizni yuboring 🙂",
            Markup.keyboard([
                [Markup.button.text(ctx.from.first_name)],
            ]).resize().oneTime(),
        );
        return
    }

    @On('text')
    async onText(@Ctx() ctx: Context & { session: BotSession }) {
        if (!ctx.message || !('text' in ctx.message)) return;

        // 1. Session mavjudligini tekshirish
        if (!ctx.session) ctx.session = {};

        const text = ctx.message.text.trim();

        // 2. ISMNI QABUL QILISH
        if (ctx.session.step === 'FIRST_NAME') {
            if (text.length < 2) {
                await ctx.reply("❌ Ism juda qisqa. Iltimos, ismingizni to'liq yuboring:");
                return
            }

            ctx.session.firstName = text;
            ctx.session.step = 'LAST_NAME';

            await ctx.reply(
                "👤 Endi familiyangizni yuboring:",
                Markup.keyboard([
                    [Markup.button.text(ctx.from?.last_name ?? 'Familiyam yo\'q')],
                ]).resize().oneTime(),
            );
            return
        }

        // 3. FAMILIYANI QABUL QILISH
        if (ctx.session.step === 'LAST_NAME') {
            // Agar matn bo'sh bo'lsa yoki juda qisqa bo'lsa
            if (!text || text.length < 3 || text === "Familiyam yo'q") {
                await ctx.reply(
                    "❌ Familiya xato kiritildi. Iltimos, familiyangizni kamida 3 ta harfda yozing:"
                );
                return
            }

            ctx.session.lastName = text;
            ctx.session.step = 'PHONE';

            await ctx.reply(
                "📞 Telefon raqamingizni yuboring",
                Markup.keyboard([
                    [Markup.button.contactRequest('📲 Telefon raqamni yuborish')],
                ]).resize().oneTime(),
            );
            return
        }
    }

    @On('contact')
    async onContact(@Ctx() ctx: Context & { session: BotSession }) {
        if (!ctx.message || !('contact' in ctx.message) || !ctx.from) return;

        const contact = ctx.message.contact;

        if (contact.user_id !== ctx.from.id) {
            ctx.reply("❗ Iltimos, o'zingizning raqamingizni yuboring");
            return
        }

        const exists = await this.botService.findByPhone(contact.phone_number);
        if (exists) {
            ctx.reply("❗ Bu telefon raqami allaqachon ro'yxatdan o'tgan");
            return
        }


        // Xavfsiz saqlash (Optional chaining bilan)
        const student: CreateBotDto = {
            tgId: String(ctx.from.id),
            firstName: ctx.session?.firstName || ctx.from.first_name,
            lastName: ctx.session?.lastName || '',
            phoneNumber: contact.phone_number,
            tgUsername: String(ctx.from.username),
        };
        await this.botService.create(student);

        ctx.session = {}; // Sessionni tozalash

        await ctx.reply("✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!", Markup.removeKeyboard());

    }
}