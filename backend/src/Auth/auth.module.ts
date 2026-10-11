import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';


const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is not set');


@Module({
    imports: [
        JwtModule.register({
            secret,
            signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as any },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
