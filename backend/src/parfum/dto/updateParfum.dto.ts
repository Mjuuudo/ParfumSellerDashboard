import { IsNotEmpty, IsString,IsInt, Min, IsPositive, IsDefined, IsBoolean, IsOptional } from "class-validator"



export class ParfumUpdateDto{

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string


    @IsOptional()
    @IsInt()
    @IsDefined()
    @IsPositive()
    originalVolume?: number

    @IsOptional()
    @IsInt()
    @IsDefined()
    @IsPositive()
    completePrice?: number


    @IsOptional()
    @IsInt()
    @IsDefined()
    @IsPositive()
    decant10Price?: number

    @IsOptional()
    @IsInt()
    @IsDefined()
    @IsPositive()
    decant20Price?: number

    
}