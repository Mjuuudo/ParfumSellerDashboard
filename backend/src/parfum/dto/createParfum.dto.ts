import { IsNotEmpty, IsString,IsInt, Min, IsPositive, IsDefined, IsBoolean } from "class-validator"



export class ParfumCreationDto{

    @IsNotEmpty()
    @IsString()
    name: string


    @IsInt()
    @IsDefined()
    @IsPositive()
    brandId: number

    @IsInt()
    @IsDefined()
    @IsPositive()
    originalVolume: number


    @IsInt()
    @IsDefined()
    @IsPositive()
    completePrice: number


    @IsInt()
    @IsDefined()
    @IsPositive()
    decant10Price: number

  
    @IsInt()
    @IsDefined()
    @IsPositive()
    decant20Price: number

    
}