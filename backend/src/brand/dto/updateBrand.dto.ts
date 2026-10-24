import { IsEmail, IsOptional, IsBoolean, IsNotEmpty, IsString, MinLength, IsEnum } from "class-validator";



export class BrandUpdateDto {

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean

}