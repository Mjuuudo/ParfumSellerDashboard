import { Injectable } from "@nestjs/common";
import { db } from "../prisma/db.js";
import bcrypt from "bcrypt"
import { UserCreationDto } from "./dto/create-user.dto.js";
import { UnauthorizedException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";


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
            Role: data.role
        };

        return await db.orm.public.User.create(user);
    }


    async getUserById ( id: number ) {
        const user = await db.orm.public.User.where({id: id}).first();

        if (!user) {
            throw new UnauthorizedException('User Does Not Exists !');
        }
        return user;
    }

    async getAllUsers () {
        const users = await db.orm.public.User.all();

        
        if (!users) {
            throw new NotFoundException('No Users Found !');
        }

        return users;
    }

    async deleteUser (userId: number) {
        const user = await db.orm.public.User.where(
            {
                id: userId
            }
        ).update({
            isActive: false,

        });

        if ( !user )
            throw new NotFoundException(`Internal Server Error !`);

        const {passwordHash: _passwordHash, ...userWithoutPassword} = user;

        return userWithoutPassword;

    }



}