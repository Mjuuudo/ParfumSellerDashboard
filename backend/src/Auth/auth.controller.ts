import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto.js';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';
import { HttpCode, HttpStatus } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) { }



    // POST /api/auth/login — checks the credentials and returns the logged-in user.
    // The JWT is stored in an httpOnly "access_token" cookie, not returned in the body.
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    async login(@Body() data: UserLoginDto, @Res({passthrough: true}) response: Response) {
        const loginObject = await this.authService.login(data);

        
        response.cookie(
            'access_token',
            loginObject.access_token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: parseInt(process.env.JWT_EXPIRES_IN ?? '3600') * 1000, // Convert seconds to milliseconds
            }

        )

        return loginObject.user;
    }

    // POST /api/auth/logout — logs the user out by clearing the "access_token" cookie.
    @Post('logout')
    async logout( @Res({ passthrough: true}) response:Response) {

        response.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return {
            message: 'Logged Out Successfult'
        }
    }

}