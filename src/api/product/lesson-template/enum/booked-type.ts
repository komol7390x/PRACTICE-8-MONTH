export enum BookedLesson {
    AVAILABLE = 'available',   // O'qituvchi ochgan, hali bo'sh
    BOOKED = 'booked',         // Student sotib oldi, dars kutilmoqda
    COMPLETED = 'completed',   // Dars muvaffaqiyatli o'tildi (Pul ustozga o'tadi)
    CANCELLED = 'cancelled',   // Atkaz qilindi (Pul studentga qaytariladi)
    EXPIRED = 'expired'        // Muddati o'tib ketdi, hech kim sotib olmadi
}