
import { CanActivate, Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class RolesGuard implements CanActivate {


    constructor (
        private readonly jwtService: JwtService
    ) {}


    async canActivate (context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.['access_token'];
        
        try{
            const payload = await this.jwtService.verifyAsync(token);
            if (payload && payload.role) {
                if (payload.role !== "OWNER") {
                    throw new ForbiddenException('User does not have the required role');
                }
                request.user = payload;
            }
            

        }catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            };
            throw new UnauthorizedException('User not authenticated');
        }

        return true;
    }
}