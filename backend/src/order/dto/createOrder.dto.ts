import { Type } from "class-transformer";
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from "class-validator";
import { SELLING_TYPES, type SellingType } from "../order.allocation.js";


// One line of the order. The price is NOT sent: the backend reads it from the perfume.
export class OrderItemInputDto {

    @IsInt()
    @IsPositive()
    parfumId: number;

    @IsIn(SELLING_TYPES)
    sellingType: SellingType;

    @IsInt()
    @Min(1)
    @Max(1000)
    quantity: number;

}


// Body of POST /api/order.
export class OrderCreationDto {

    @IsInt()
    @IsPositive()
    customerId: number;

    // Defaults to the customer's address when left out.
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    deliveryAdress?: string;

    // In MAD, like every other price. Optional (no delivery fee).
    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryPrice?: number;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @ValidateNested({ each: true })
    @Type(() => OrderItemInputDto)
    items: OrderItemInputDto[];

}
