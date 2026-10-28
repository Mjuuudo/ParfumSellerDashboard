import { Type } from "class-transformer";
import { IsIn, IsInt, IsISO8601, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";


export const ORDER_STATUSES = ['PENDING', 'COMFIRMED', 'DELIVERD', 'CANCELLED'] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

// Query string of GET /api/order (every filter optional).
export class OrderListQueryDto {

    @IsOptional()
    @IsIn(ORDER_STATUSES)
    status?: OrderStatusValue;

    // Orders created on/after this date (ISO, e.g. 2026-10-01).
    @IsOptional()
    @IsISO8601()
    from?: string;

    // Orders created on/before the END of this date (ISO).
    @IsOptional()
    @IsISO8601()
    to?: string;

    // Matches the order id, the customer's name or phone number.
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

}


export const OPERATION_TYPES = ['CONSUMPTION', 'REVERSAL'] as const;

// Query string of GET /api/decant-operation (every filter optional).
export class DecantOperationQueryDto {

    @IsOptional()
    @IsIn(OPERATION_TYPES)
    type?: (typeof OPERATION_TYPES)[number];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    bottleId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    orderId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    parfumId?: number;

}
