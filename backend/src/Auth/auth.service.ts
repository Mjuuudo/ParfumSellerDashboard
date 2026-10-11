
import { Injectable } from '@nestjs/common';
import { db } from '../prisma/db.js';
import { UserLoginDto } from './dto/user-login.dto.js';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {


    constructor(
        private readonly jwtService: JwtService
    ) { }


    async login( data: UserLoginDto ) {
        const user = await db.orm.public.User.where(
            {username: data.username}
        ).first();

        if (!user) {
            throw new UnauthorizedException('User Does Not Exists !');
        }


        const isPasswordvalid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isPasswordvalid) {
            throw new UnauthorizedException('Invalid Password !');
        }


        Logger.log(`User ${user.username} logged in successfully`);
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.Role
        }

        const token = await this.jwtService.signAsync(payload); 

        return ({
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.Role
            }});
        }; 



    

}