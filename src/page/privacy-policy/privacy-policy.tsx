export const PrivacyPolicy = () => {
    const date = new Date()
    return (
        <div>
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-shield w-8 h-8 text-white" aria-hidden="true">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z">
                                </path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Maxfiylik Siyosati</h1>
                        <p className="text-gray-600 mt-5">Oxirgi yangilanish: {date.toString().split('GMT')[0]}</p>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-xl mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users w-5 h-5 text-blue-600" aria-hidden="true">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2">
                                    </path>
                                    <path d="M16 3.128a4 4 0 0 1 0 7.744">
                                    </path>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87">
                                    </path>
                                    <circle cx="9" cy="7" r="4">
                                    </circle>
                                </svg>1. Kirish</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>"Full-stack online course" platformasi sizning shaxsiy ma'lumotlaringizni qanday to'playdi, ishlatadi va himoya qiladi haqida ma'lumot beradi. Biz sizning maxfiyligingizni qadrlaymiz va ma'lumotlaringizni xavfsiz saqlashga sodiqmiz.</p>
                            <p>Ushbu platforma orqali o'qituvchilar va o'quvchilar o'rtasida darslar tashkil qilinadi, Google Calendar integratsiyasi, Telegram bot va Payme to'lov tizimlari ishlatiladi.</p>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-2xl py-6 mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-database w-5 h-5 text-green-600" aria-hidden="true">
                                    <ellipse cx="12" cy="5" rx="9" ry="3">
                                    </ellipse>
                                    <path d="M3 5V19A9 3 0 0 0 21 19V5">
                                    </path>
                                    <path d="M3 12A9 3 0 0 0 21 12">
                                    </path>
                                </svg>2. Qanday Ma'lumotlar To'planadi</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">O'qituvchilar uchun:</h3>
                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                    <li>Ism, familiya</li>
                                    <li>Email manzil</li>
                                    <li>Telefon raqami</li>
                                    <li>Profil rasmi</li>
                                    <li>Bio va tajriba ma'lumotlari</li>
                                    <li>Portfolio video havolasi</li>
                                    <li>To'lov karta raqami (faqat to'lovlar uchun)</li>
                                    <li>O'qitiladigan til</li>
                                    <li>Google hisob ma'lumotlari (Google Calendar integratsiyasi uchun)</li>
                                    <li>Google Calendar access token va refresh token</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">O'quvchilar uchun:</h3>
                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                    <li>Telegram ID</li>
                                    <li>Ism, familiya</li>
                                    <li>Telefon raqami</li>
                                    <li>Email manzil (ixtiyoriy)</li>
                                    <li>Telegram username</li>
                                    <li>Avatar rasmi</li>
                                    <li>Til kodi</li>
                                    <li>Vaqt mintaqasi</li>
                                    <li>Bio (ixtiyoriy)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">Darslar haqida ma'lumot:</h3>
                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                    <li>Dars boshlanish va tugash vaqti</li>
                                    <li>Dars narxi</li>
                                    <li>Dars holati (mavjud, band, bekor qilingan)</li>
                                    <li>Google Meet havolasi</li>
                                    <li>Google Calendar event ID</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">To'lov ma'lumotlari:</h3>
                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                    <li>Tranzaksiya ID</li>
                                    <li>To'lov summasi</li>
                                    <li>To'lov holati</li>
                                    <li>To'lov vaqti</li>
                                    <li>Payme tranzaksiya ma'lumotlari</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl  py-6 shadow-2xl mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar w-5 h-5 text-purple-600" aria-hidden="true">
                                    <path d="M8 2v4">
                                    </path>
                                    <path d="M16 2v4">
                                    </path>
                                    <rect width="18" height="18" x="3" y="4" rx="2">
                                    </rect>
                                    <path d="M3 10h18">
                                    </path>
                                </svg>3. Ma'lumotlar Qanday Ishlatiladi</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Platforma funksiyalarini ta'minlash (darslar tashkil qilish, band qilish, boshqarish)</li>
                                <li>Google Calendar bilan integratsiya (darslarni avtomatik yaratish va boshqarish)</li>
                                <li>Telegram bot orqali bildirishnomalar yuborish</li>
                                <li>To'lov jarayonlarini amalga oshirish (Payme integratsiyasi)</li>
                                <li>Foydalanuvchilar bilan aloqa o'rnatish</li>
                                <li>Xizmat sifatini yaxshilash</li>
                                <li>Xavfsizlikni ta'minlash va firibgarlikni oldini olish</li>
                                <li>Qonuniy talablarga rioya qilish</li>
                            </ul>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-xl py-6 mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock w-5 h-5 text-red-600" aria-hidden="true">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2">
                                    </rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4">
                                    </path>
                                </svg>4. Uchinchi Tomon Xizmatlari</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Biz quyidagi uchinchi tomon xizmatlaridan foydalanamiz. Ular o'z maxfiylik siyosatlariga ega:</p>
                            <div className="space-y-4 mt-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar w-4 h-4" aria-hidden="true">
                                            <path d="M8 2v4">
                                            </path>
                                            <path d="M16 2v4">
                                            </path>
                                            <rect width="18" height="18" x="3" y="4" rx="2">
                                            </rect>
                                            <path d="M3 10h18">
                                            </path>
                                        </svg>Google Calendar API</h4>
                                    <p className="text-sm">Darslarni Google Calendar'da yaratish va boshqarish uchun. Google'ning maxfiylik siyosati: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a>
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-message-square w-4 h-4" aria-hidden="true">
                                            <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z">
                                            </path>
                                        </svg>Telegram Bot API</h4>
                                    <p className="text-sm">O'quvchilar bilan aloqa va bildirishnomalar yuborish uchun. Telegram'ning maxfiylik siyosati: <a href="https://telegram.org/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://telegram.org/privacy</a>
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-credit-card w-4 h-4" aria-hidden="true">
                                            <rect width="20" height="14" x="2" y="5" rx="2">
                                            </rect>
                                            <line x1="2" x2="22" y1="10" y2="10">
                                            </line>
                                        </svg>Payme Merchant API</h4>
                                    <p className="text-sm">To'lovlarni qabul qilish uchun. Payme'ning maxfiylik siyosati: <a href="https://payme.uz/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://payme.uz/privacy</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-xl py-6  mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock w-5 h-5 text-indigo-600" aria-hidden="true">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2">
                                    </rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4">
                                    </path>
                                </svg>5. Ma'lumotlarni Saqlash va Xavfsizlik</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Biz sizning ma'lumotlaringizni xavfsiz saqlash uchun quyidagi choralarni ko'ramiz:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Ma'lumotlar shifrlangan PostgreSQL ma'lumotlar bazasida saqlanadi</li>
                                <li>Parollar bcrypt algoritmi bilan shifrlangan</li>
                                <li>JWT tokenlar xavfsiz HTTP-only cookie'larda saqlanadi</li>
                                <li>HTTPS protokoli orqali barcha ma'lumotlar uzatiladi</li>
                                <li>Muntazam xavfsizlik tekshiruvlari o'tkaziladi</li>
                                <li>Faqat autorizatsiya qilingan xodimlar ma'lumotlarga kirish huquqiga ega</li>
                            </ul>
                            <p className="text-sm text-gray-600 mt-4">
                                <strong>Eslatma:</strong> Internetda mutlaq xavfsizlik mavjud emas. Biz sizning ma'lumotlaringizni himoya qilishga harakat qilamiz, lekin to'liq xavfsizlikni kafolatlay olmaymiz.</p>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-xl py-6  mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users w-5 h-5 text-teal-600" aria-hidden="true">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2">
                                    </path>
                                    <path d="M16 3.128a4 4 0 0 1 0 7.744">
                                    </path>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87">
                                    </path>
                                    <circle cx="9" cy="7" r="4">
                                    </circle>
                                </svg>6. Foydalanuvchi Huquqlari</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Siz quyidagi huquqlarga egasiz:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>
                                    <strong>Kirish huquqi:</strong> O'zingizning shaxsiy ma'lumotlaringizga kirish</li>
                                <li>
                                    <strong>Tuzatish huquqi:</strong> Noto'g'ri ma'lumotlarni tuzatish</li>
                                <li>
                                    <strong>O'chirish huquqi:</strong> O'zingizning ma'lumotlaringizni o'chirishni so'rash</li>
                                <li>
                                    <strong>Cheklash huquqi:</strong> Ma'lumotlaringizni ishlatishni cheklash</li>
                                <li>
                                    <strong>Ma'lumotlarni ko'chirish huquqi:</strong> Ma'lumotlaringizni boshqa xizmatga ko'chirish</li>
                                <li>
                                    <strong>E'tiroz bildirish huquqi:</strong> Ma'lumotlaringizni ishlatishga e'tiroz bildirish</li>
                            </ul>
                            <p className="mt-4">Ushbu huquqlardan foydalanish uchun biz bilan bog'laning:
                                <a href="mailto:privacy@helpmehelpyou.uz" className="text-blue-600 hover:underline">privacy@helpmehelpyou.uz</a>
                            </p>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl  py-6 shadow-xl mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold">7. Cookie'lar va Tracking Texnologiyalari</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Biz quyidagi cookie'lardan foydalanamiz:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>
                                    <strong>Zaruriy cookie'lar:</strong> Platforma ishlashi uchun zarur</li>
                                <li>
                                    <strong>Autentifikatsiya cookie'lari:</strong> Sizning sessiyangizni saqlash uchun</li>
                                <li>
                                    <strong>Xavfsizlik cookie'lari:</strong> Xavfsizlikni ta'minlash uchun</li>
                            </ul>
                            <p className="text-sm text-gray-600 mt-4">Biz reklama yoki tracking cookie'laridan foydalanmaymiz.</p>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-xl py-6  mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold">8. Ma'lumotlarni Saqlash Muddati</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Biz sizning ma'lumotlaringizni quyidagi muddatlar davomida saqlaymiz:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Faol foydalanuvchilar: Hisobingiz faol bo'lguncha</li>
                                <li>To'lov ma'lumotlari: Qonuniy talablarga muvofiq (kamida 5 yil)</li>
                                <li>Dars tarixi: Hisobingiz o'chirilguncha</li>
                            </ul>
                            <p className="mt-4">Hisobingizni o'chirishni so'rasangiz, biz ma'lumotlaringizni 30 kun ichida o'chiramiz, agar qonuniy talablar boshqa muddatni talab qilmasa.</p>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-xl py-6 mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold">9. O'zgarishlar</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Biz ushbu maxfiylik siyosatini vaqt-vaqti bilan yangilashimiz mumkin. Muhim o'zgarishlar haqida sizni email orqali xabardor qilamiz yoki platformada bildirishnoma ko'rsatamiz.</p>
                            <p>Oxirgi yangilanish sanasi sahifaning yuqori qismida ko'rsatilgan.</p>
                        </div>
                    </div>
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shadow-xl py-6 mb-6">
                        <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                            <div data-slot="card-title" className="leading-none font-semibold">10. Biz Bilan Bog'lanish</div>
                        </div>
                        <div data-slot="card-content" className="px-6 space-y-4 text-gray-700">
                            <p>Maxfiylik siyosati yoki ma'lumotlaringiz bilan bog'liq savollaringiz bo'lsa, biz bilan bog'laning:</p>
                            <div className="space-y-2">
                                <p>
                                    <strong>Email:</strong> <a href="mailto:privacy@helpmehelpyou.uz" className="text-blue-600 hover:underline">privacy@helpmehelpyou.uz</a>
                                </p>
                                <p>
                                    <strong>Veb-sayt:</strong> <a href="https://helpmehelpyou.uz" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://helpmehelpyou.uz</a>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-8 p-6 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg">
                        <p className="text-gray-700">Ushbu maxfiylik siyosatini o'qib chiqganingiz uchun tashakkur! Agar savollaringiz bo'lsa, biz bilan bog'laning.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

