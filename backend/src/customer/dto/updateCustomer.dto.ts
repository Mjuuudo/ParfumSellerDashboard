import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


// Body of PATCH /api/customer/:id. Every field is optional: only the ones sent are changed.
export class CustomerUpdateDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    address?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

}
