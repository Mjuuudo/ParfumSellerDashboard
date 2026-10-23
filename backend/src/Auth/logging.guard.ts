// import { CanActivate, Injectable } from '@nestjs/common';
// import { ExecutionContext } from '@nestjs/common';
// import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class LoggingGuard implements CanActivate {

//     constructor (
//         private readonly jwtService: JwtService
//     ) {

//     }

//     async canAvtivate ( context: ExecutionContext) : Promise<Boolean> {
//         const request = context.switchToHttp().getRequest();
//         const token = request.cookies?.['access_token']

//         try {
//                 const payload = await this.jwtService.verify(token);

//                 if (payload && payload.role) {
//                 if (payload.role !== "OWNER") {
//                     throw new ForbiddenException('User does not have the required role');
//                 }
                


//         } catch ( error ) {

//         }
//     }
// }