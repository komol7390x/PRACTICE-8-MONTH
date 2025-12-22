import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { LanguageLevel, TeacherSort, TeacherStatus } from "../enum/teacher-enum";

export function ApiPagination() {
    return applyDecorators(
        ApiQuery({ name: 'search', required: false, type: String }),
        ApiQuery({ name: 'page', required: false, type: Number }),
        ApiQuery({ name: 'limit', required: false, type: Number }),
        ApiQuery({ name: 'lang', required: false, type: String }),
        
        ApiQuery({ name: 'level', required: false, enum: LanguageLevel }),
        ApiQuery({ name: 'status', required: false, enum: TeacherStatus }),
        ApiQuery({ name: 'sort', required: false, enum: TeacherSort }),

    )
}