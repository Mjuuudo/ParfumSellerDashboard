import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsNumber, IsOptional } from "class-validator";



export const RoleEnum = {
    OWNER: 'OWNER',
    EMPLOYEE: 'EMPLOYEE',
} as const;
export type RoleEnum = typeof RoleEnum[keyof typeof RoleEnum];
export class UserModificationDto {

    @IsOptional()
    @IsNumber()
    id?: number

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    username?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password?: string;

    @IsOptional()
    @IsEnum(RoleEnum)
    Role?: RoleEnum;
}
