import { Body, Controller, Post, Get, Req, Res   } from "@nestjs/common";
import { UserCreationDto } from "./dto/create-user.dto.js";
import { UserService } from "./users.service.js";
import { AuthGuard } from "../Auth/auth.guard.js";
import { UseGuards } from "@nestjs/common";

@Controller("/api/user")
export class UserController{

    constructor(
        private readonly userServices: UserService
    ) {}

    @Post()
    async createUser ( @Body() body: UserCreationDto) {
        
        const user = await this.userServices.createUser(body);
        const { passwordHash: _passwordHash, ...createdUser } = user;


        return createdUser;
    }


    @Get('me')
    @UseGuards(AuthGuard)
    async getMe(@Req() request: any) {
        const user = request.user;
        const userObject = await this.userServices.getUserById(user.id);

        const { passwordHash, ...userWithoutPassword } = userObject;


        return userWithoutPassword;
    }
}