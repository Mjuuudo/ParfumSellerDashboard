
import { Injectable, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';



@Injectable()
export class AuthGuard implements CanActivate{
  
    constructor (
        private readonly jwtService: JwtService
    ) {}

    async canActivate (context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        if (request.cookies['access_token'] === undefined)
            throw new UnauthorizedException('Token Not Provided !');
        
        

        const token = request.cookies['access_token'];

        if (!token) {
            throw new UnauthorizedException('No Token Provided !');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
        
            if (!Number.isInteger(payload.userId) 
                    || typeof payload.username !== 'string' 
                        || typeof payload.role !== 'string') {
                throw new UnauthorizedException('Invalid Token !');
            }

            request.user = {
                userId: payload.userId,
                username: payload.username,
                role: payload.role
            };

        
        } catch ( error ) {
            throw new UnauthorizedException('Invalid Token !');
        }


        return true;
    }
}