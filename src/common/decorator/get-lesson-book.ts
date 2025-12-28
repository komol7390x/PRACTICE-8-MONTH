import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { BookedLesson } from 'src/api/product/lesson-template/enum/booked-type';
import { WeekDays } from 'src/api/product/lesson-template/enum/week-day';

export function ApiLessonFilters() {
    return applyDecorators(
        ApiQuery({
            name: 'status',
            enum: BookedLesson,
            required: false,
            description: "Dars holati",
        }),
        ApiQuery({
            name: 'weekday',
            enum: WeekDays,
            required: false,
            description: "Hafta kuni",
        }),
        ApiQuery({
            name: 'teacherId',
            type: Number,
            required: false,
            description: "O'qituvchi ID-si",
        }),
        ApiQuery({
            name: 'studentId',
            type: Number,
            required: false,
            description: "Talaba ID-si",
        }),
        ApiQuery({
            name: 'isPaid',
            type: Boolean,
            required: false,
            description: "O'qituvchi xizmat haqi to'langanmi?",
        }),
        ApiQuery({
            name: 'search',
            type: String,
            required: false,
            description: "ID yoki Dars nomi bo'yicha qidirish",
        }),
        ApiQuery({
            name: 'active',
            type: Boolean,
            required: false,
            description: "Dars active yoki yoq",
        }),

        ApiQuery({
            name: 'page',
            required: false,
            type: Number
        }),

        ApiQuery({
            name: 'limit',
            required: false,
            type: Number
        })
    );
}

export function ApiLessonFiltersTeacher() {
    return applyDecorators(
        ApiQuery({

            name: 'status',
            enum: BookedLesson,
            required: false,
            description: "Dars holati",
        }),
        ApiQuery({
            name: 'weekday',
            enum: WeekDays,
            required: false,
            description: "Hafta kuni",
        }),

        ApiQuery({
            name: 'isPaid',
            type: Boolean,
            required: false,
            description: "O'qituvchi xizmat haqi to'langanmi?",
        }),

        ApiQuery({
            name: 'search',
            type: String,
            required: false,
            description: "ID yoki Dars nomi bo'yicha qidirish",
        }),

        ApiQuery({
            name: 'page',
            required: false,
            type: Number
        }),

        ApiQuery({
            name: 'limit',
            required: false,
            type: Number
        })
    );
}

export function ApiLessonFiltersStudent() {
    return applyDecorators(
        ApiQuery({
            name: 'status',
            enum: BookedLesson,
            required: false,
            description: "Dars holati",
        }),
        ApiQuery({
            name: 'weekday',
            enum: WeekDays,
            required: false,
            description: "Hafta kuni",
        }),

        ApiQuery({
            name: 'search',
            type: String,
            required: false,
            description: "ID yoki Dars nomi bo'yicha qidirish",
        }),

        ApiQuery({
            name: 'page',
            required: false,
            type: Number
        }),

        ApiQuery({
            name: 'limit',
            required: false,
            type: Number
        })
    );
}