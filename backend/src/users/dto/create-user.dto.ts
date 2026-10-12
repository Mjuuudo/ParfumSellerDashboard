import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from "class-validator";



enum RoleEnum{
    OWNER,
    EMPLOYEE
}
export class UserCreationDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(RoleEnum)
    role: RoleEnum;
}