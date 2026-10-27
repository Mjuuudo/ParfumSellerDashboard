import { IsNotEmpty, IsString,IsInt, Min, IsPositive, IsDefined, IsBoolean } from "class-validator"


export class BottleCreationDto{

    @IsInt()
    @IsPositive()
    stockBatchId: number

}