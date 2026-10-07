import { Body, Controller, Post } from "@nestjs/common";
import { UserCreationDto } from "./dto/create-user.dto.js";
import { UserService } from "./users.service.js";


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

}