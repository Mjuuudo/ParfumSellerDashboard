import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsNumber } from "class-validator";



export const RoleEnum = {
    OWNER: 'OWNER',
    EMPLOYEE: 'EMPLOYEE',
} as const;
export type RoleEnum = typeof RoleEnum[keyof typeof RoleEnum];
export class UserModificationDto {

    @IsNumber()
    id?: number

    @IsNotEmpty()
    @IsString()
    username?: string;

    @IsNotEmpty()
    @IsString()
    firstName?: string;

    @IsNotEmpty()
    @IsString()
    lastName?: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email?: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber?: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password?: string;

    @IsEnum(RoleEnum)
    role?: RoleEnum;
}