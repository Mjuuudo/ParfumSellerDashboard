import { Injectable } from "@nestjs/common";
import { db } from "../prisma/db.js";
import bcrypt from "bcrypt"
import { UserCreationDto } from "./dto/create-user.dto.js";
import { UnauthorizedException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { UserModificationDto } from "./dto/user-modification.dto.js";


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
            Role: data.Role
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

    async changePassword ( id: number, newPassword: string ) {
        
        console.log(`${id} : ${newPassword}`);

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await db.orm.public.User.where({id: id})
            .update({
                passwordHash: hashedPassword
            });

        return user;
    }

    async modifyUser ( data: UserModificationDto ) {
        const checkExistance = await db.orm.public.User.where({id: data.id}).first();
        if (!checkExistance)
                throw new NotFoundException(`user With Id ${data.id} Not Found !`);

        const updatedUser = {
            ...(data.firstName !== undefined && {
                firstName: data.firstName
            }),
            ...(data.lastName !== undefined && {
                lastName: data.lastName
            }),
            ...(data.email !== undefined && {
                email: data.email
            }),
            ...(data.phoneNumber !== undefined && {
                phoneNumber: data.phoneNumber
            }),
            ...(data.Role !== undefined && {
                Role: data.Role
            })
        }
         await db.orm.public.User.where({id: data.id})
                    .update(updatedUser);
    
    
        return await db.orm.public.User.where({id: data.id})
                    .first();
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