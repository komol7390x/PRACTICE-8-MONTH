import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { StudentStatus } from "../enum/student-status";
import { StudentSort } from "../enum/student-sort";

export function ApiPagination() {
    return applyDecorators(
        ApiQuery({ name: 'search', required: false, type: String }),
        ApiQuery({ name: 'status', required: false, enum: StudentStatus }),
        ApiQuery({ name: 'page', required: false, type: Number }),
        ApiQuery({ name: 'limit', required: false, type: Number }),
        ApiQuery({ name: 'sort', required: false, enum: StudentSort })
    )
}