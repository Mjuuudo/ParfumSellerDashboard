import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";


// Body of POST /api/customer. Every field is required (they are all NOT NULL in the Customer table).
export class CustomerCreationDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    fullName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    address: string;

}
