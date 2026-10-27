import { IsNotEmpty, IsString,IsInt, Min, IsPositive, IsDefined, IsBoolean, IsOptional } from "class-validator"



export class StockUpdateDto{

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @IsOptional()
    parfumId?: number

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @IsOptional()
    quantity?: number

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @IsOptional()
    purchaseCostPerBottle?: number
}