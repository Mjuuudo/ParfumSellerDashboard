import { IsNotEmpty, IsString,IsInt, Min, IsPositive, IsDefined, IsBoolean } from "class-validator"



export class StockCreationDto{

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    parfumId: number

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    quantity: number

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    purchaseCostPerBottle: number
}