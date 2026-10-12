import { Body, Controller, Post, Get   } from "@nestjs/common";
import { UserCreationDto } from "./dto/create-user.dto.js";
import { UserService } from "./users.service.js";
import { AuthGuard } from "../Auth/auth.guard.js";


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


    // @Guard(AuthGuard)
    // @UseGuard(AuthGuard)
    @Get()
    async getAllUsers () {
    //     const users = await this.userServices.getAllUsers();
    //     return users.map(user => {
    //         const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    //         return userWithoutPassword;
    // });
    }

}