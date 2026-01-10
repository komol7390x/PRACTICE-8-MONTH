import { Update, Start, On, Ctx, Command, Help } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { OnModuleInit } from '@nestjs/common';
import { TokenService } from 'src/infrastructure/token/Token';
import { Roles } from 'src/common/enum/roles.enum';

interface BotSession {
    step?: 'FIRST_NAME' | 'LAST_NAME' | 'PHONE';
    firstName?: string;
    lastName?: string;
}

@Update()
export class BotUpdate implements OnModuleInit {
    constructor(
        private readonly botService: BotService,
        private readonly tokenService: TokenService,
    ) { }

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
            await ctx.reply(`👤 Profilingiz:\n\nTgId: ${user.tgId}\nTgUsername: ${user.tgUsername}\nIsm: ${user.firstName}\nFamiliya: ${user.lastName}\nTel: ${user.phoneNumber}`);
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
            const tokenPayload = {
                id: user.id,
                role: Roles.STUDENT,
                isActive: user.isActive
            };
            const token = await this.tokenService.accessToken(tokenPayload);

            const message = await ctx.reply(
                "✅ Ro'yxatdan o'tdingiz!\n🚀 Ilova yuklanmoqda...",
                Markup.inlineKeyboard([
                    [Markup.button.webApp(
                        '🚀 Ilovani ochish (Ngrok)',
                        `https://cataractal-unperiphrastic-catherina.ngrok-free.dev/telegram/student-schedule?token=${token}`
                    )]
                ])
            );

            setTimeout(async () => {
                if (!ctx.chat?.id) return;

                try {
                    await ctx.telegram.editMessageText(
                        ctx.chat.id, // Endi bu yerda xato bo'lmaydi
                        message.message_id,
                        undefined,
                        "⚠️ Agar yuqoridagi havola ishlamasa, lokal havoladan foydalaning:",
                        Markup.inlineKeyboard([
                            [Markup.button.webApp(
                                '🚀 Ilovani ochish (Ngrok)',
                                `https://cataractal-unperiphrastic-catherina.ngrok-free.dev/telegram/student-schedule?token=${token}`
                            )],
                            [Markup.button.webApp(
                                '🏠 Ilovani ochish (Localhost)',
                                `http://localhost:5050/telegram/student-schedule?token=${token}`
                            )]
                        ])
                    );
                } catch (error) {
                    console.log("Xabarni tahrirlashda xato yoki xabar allaqachon o'chirilgan");
                }
            }, 5000);
        }

        ctx.session = { step: 'FIRST_NAME' };

        await ctx.reply(
            "📝 Ro'yxatdan o'tish uchun ismingizni yuboring 🙂",
            Markup.keyboard([
                [Markup.button.text(ctx.from.first_name)],
            ]).resize().oneTime(),
        );
    }

    @On('text')
    async onText(@Ctx() ctx: Context & { session: BotSession }) {
        if (!ctx.message || !('text' in ctx.message) || !ctx.session) return;

        const text = ctx.message.text.trim();

        // 1. ISMNI QABUL QILISH
        if (ctx.session.step === 'FIRST_NAME') {
            if (text.length < 2) {
                await ctx.reply("❌ Ism juda qisqa. Iltimos, ismingizni to'liq yuboring:");
                return;
            }
            ctx.session.firstName = text;
            ctx.session.step = 'LAST_NAME';
            await ctx.reply(
                "👤 Endi familiyangizni yuboring:",
                Markup.keyboard([
                    [Markup.button.text(ctx.from?.last_name ?? 'Familiyam yo\'q')],
                ]).resize().oneTime(),
            );
            return;
        }

        if (ctx.session.step === 'LAST_NAME') {
            if (!text || text.length < 3) {
                await ctx.reply("❌ Familiya kamida 3 ta harf bo'lishi kerak:");
                return;
            }
            ctx.session.lastName = text;
            ctx.session.step = 'PHONE';
            await ctx.reply(
                "📞 Telefon raqamingizni yuboring",
                Markup.keyboard([
                    [Markup.button.contactRequest('📲 Telefon raqamni yuborish')],
                ]).resize().oneTime(),
            );
            return;
        }
    }

    @On('contact')
    async onContact(@Ctx() ctx: Context & { session: BotSession }) {
        if (!ctx.message || !('contact' in ctx.message) || !ctx.from) return;

        const contact = ctx.message.contact;

        if (contact.user_id !== ctx.from.id) {
            await ctx.reply("❗ Iltimos, o'zingizning raqamingizni yuboring");
            return;
        }

        const existingUser = await this.botService.findByTelegramId(String(ctx.from.id));

        let result: any;
        if (existingUser) {
            result = existingUser;
        } else {
            const student: CreateBotDto = {
                tgId: String(ctx.from.id),
                firstName: ctx.session?.firstName || ctx.from.first_name,
                lastName: ctx.session?.lastName || '',
                phoneNumber: contact.phone_number,
                tgUsername: String(ctx.from.username || ''),
            };
            result = await this.botService.createUser(student);
        }

        const tokenPayload = {
            id: result.id,
            role: Roles.STUDENT,
            isActive: result.isActive
        };
        const token = await this.tokenService.accessToken(tokenPayload);

        ctx.session = {};

        const message = await ctx.reply(
            "✅ Ro'yxatdan o'tdingiz!\n🚀 Ilova yuklanmoqda...",
            Markup.inlineKeyboard([
                [Markup.button.webApp(
                    '🚀 Ilovani ochish (Ngrok)',
                    `https://cataractal-unperiphrastic-catherina.ngrok-free.dev/telegram/student-schedule?token=${token}`
                )]
            ])
        );

        setTimeout(async () => {
            if (!ctx.chat?.id) return;

            try {
                await ctx.telegram.editMessageText(
                    ctx.chat.id, // Endi bu yerda xato bo'lmaydi
                    message.message_id,
                    undefined,
                    "⚠️ Agar yuqoridagi havola ishlamasa, lokal havoladan foydalaning:",
                    Markup.inlineKeyboard([
                        [Markup.button.webApp(
                            '🚀 Ilovani ochish (Ngrok)',
                            `https://cataractal-unperiphrastic-catherina.ngrok-free.dev/telegram/student-schedule?token=${token}`
                        )],
                        [Markup.button.webApp(
                            '🏠 Ilovani ochish (Localhost)',
                            `http://localhost:5050/telegram/student-schedule?token=${token}`
                        )]
                    ])
                );
            } catch (error) {
                console.log("Xabarni tahrirlashda xato yoki xabar allaqachon o'chirilgan");
            }
        }, 5000);
    }
}