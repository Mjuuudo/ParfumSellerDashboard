import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from "class-validator";



export class BrandCreationDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    image: string;
}