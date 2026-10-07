import { Injectable } from "@nestjs/common";
import { db } from "../prisma/db.js";
import bcrypt from "bcrypt"
import { UserCreationDto } from "./dto/create-user.dto.js";


@Injectable()
export class UserService{


    constructor ( 
        
    ) { }


    async createUser ( data: UserCreationDto ) {

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        
        const user = {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            passwordHash: hashedPassword,
            Role: "EMPLOYEE" as const
        };

        return await db.orm.public.User.create(user);
    }



}