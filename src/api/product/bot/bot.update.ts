import { Update, Start, On, Ctx, Command, Help } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { OnModuleInit } from '@nestjs/common';
import { TokenService } from 'src/infrastructure/token/Token';
import { Roles } from 'src/common/enum/roles.enum';
import { appConfig } from 'src/config';

interface BotSession {
    step?: 'FIRST_NAME' | 'LAST_NAME' | 'PHONE';
    firstName?: string;
    lastName?: string | null;
}

@Update()
export class BotUpdate implements OnModuleInit {
    private readonly lastBotMessageIdsByChat = new Map<number, number[]>();

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

    private async cleanupPreviousBotMessages(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const ids = this.lastBotMessageIdsByChat.get(chatId) || [];
        if (!ids.length) return;

        for (const mid of ids) {
            try {
                await ctx.telegram.deleteMessage(chatId, mid);
            } catch {
                // ignore
            }
        }

        this.lastBotMessageIdsByChat.delete(chatId);
    }

    private trackBotMessage(ctx: Context, messageId: number) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const prev = this.lastBotMessageIdsByChat.get(chatId) || [];
        this.lastBotMessageIdsByChat.set(chatId, [...prev, messageId]);
    }

    private async sendStudentWebApp(ctx: Context, token: string) {
        await this.cleanupPreviousBotMessages(ctx);

        const message = await ctx.reply(
            "✅ Ro'yxatdan o'tdingiz!\n🚀 Ilova yuklanmoqda...",
            Markup.inlineKeyboard([
                [Markup.button.webApp(
                    '🚀 Ilovani ochish',
                    `${appConfig.FRONT.URL}/tgb?token=${token}`
                )]
            ])
        );

        if (message && typeof (message as any).message_id === 'number') {
            this.trackBotMessage(ctx, (message as any).message_id);
        }
    }

    @Start()
    async onStart(@Ctx() ctx: Context & { session: BotSession }) {
        if (!ctx.from) return;

        const telegramId = String(ctx.from.id);

        const user = await this.botService.findByTelegramId(telegramId);

        if (user) {
            if (user.isActive === false) {
                await this.cleanupPreviousBotMessages(ctx);
                const msg = await ctx.reply('⛔ You are blocked');
                if (msg && typeof (msg as any).message_id === 'number') {
                    this.trackBotMessage(ctx, (msg as any).message_id);
                }
                return;
            }

            const tokenPayload = {
                id: user.id,
                role: Roles.STUDENT,
                isActive: user.isActive
            };
            const token = await this.tokenService.accessToken(tokenPayload);

            await this.sendStudentWebApp(ctx, token);
            return;
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
                    [Markup.button.text("Familiyam yo'q")], // Tugma matni
                ]).resize().oneTime(),
            );
            return;
        }

        // 2. FAMILIYANI QABUL QILISH
        if (ctx.session.step === 'LAST_NAME') {
            if (text === "Familiyam yo'q") {
                ctx.session.lastName = null; 
            } else {
                if (text.length < 3) {
                    await ctx.reply("❌ Familiya kamida 3 ta harf bo'lishi kerak:");
                    return;
                }
                ctx.session.lastName = text;
            }

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

        if (result.isActive === false) {
            await this.cleanupPreviousBotMessages(ctx);
            const msg = await ctx.reply('⛔ You are blocked');
            if (msg && typeof (msg as any).message_id === 'number') {
                this.trackBotMessage(ctx, (msg as any).message_id);
            }
            return;
        }

        await this.sendStudentWebApp(ctx, token);
        return;
    }
}
