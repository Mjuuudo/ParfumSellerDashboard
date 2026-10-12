import { Body, Controller, Post, Get, Req, Res   } from "@nestjs/common";
import { UserCreationDto } from "./dto/create-user.dto.js";
import { UserService } from "./users.service.js";
import { AuthGuard } from "../Auth/auth.guard.js";
import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "../Auth/roles.guard.js";

@Controller("/api/user")
export class UserController{

    constructor(
        private readonly userServices: UserService
    ) {}

    @Post()
    @UseGuards(AuthGuard)
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

    @Get('all')
    @UseGuards(AuthGuard)
    @UseGuards(RolesGuard)
    async getAllUsers() {
        const users = await this.userServices.getAllUsers();
        const usersWithoutPasswords = users.map((user) => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        return usersWithoutPasswords;
    }

    @Get('isAuth')
    @UseGuards(AuthGuard)
    isAuth () {
        console.log(`[AUTH GUARD] Checking If The User Is LoggedIn !`);


        return [];
    }

    @Get('isOwner')
    @UseGuards(AuthGuard)
    @UseGuards(RolesGuard)
    isOwner () {
        console.log(`[AUTH GUARD] Checking If The User Is Owner !`);

        return [];
    }
}