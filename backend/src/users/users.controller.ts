import { Body, Controller, Post, Get, Req, Res, Delete, Param, ParseIntPipe     } from "@nestjs/common";
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

    // POST /api/user — creates a new user from the request body.
    // Requires a logged-in user; the password hash is stripped from the response.
    @Post()
    @UseGuards(AuthGuard)
    async createUser ( @Body() body: UserCreationDto ) {
        
        const user = await this.userServices.createUser(body);
        const { passwordHash: _passwordHash, ...createdUser } = user;
        

        return createdUser;

    }


    // GET /api/user/me — returns the profile of the currently logged-in user.
    // The user id comes from the token decoded by AuthGuard; password hash is removed.
    @Get('me')
    @UseGuards(AuthGuard)
    async getMe(@Req() request: any) {
        const user = request.user;
        const userObject = await this.userServices.getUserById(user.id);

        const { passwordHash, ...userWithoutPassword } = userObject;


        return userWithoutPassword;
    }

    // GET /api/user/all — returns the list of all users, without their password hashes.
    // Requires a logged-in user (owner-only check is currently commented out).
    @Get('all')
    @UseGuards(AuthGuard)
    @UseGuards(RolesGuard)
    async getAllUsers() {
        console.log(`heeeeeer`)
        const users = await this.userServices.getAllUsers();
        const usersWithoutPasswords = users.map((user) => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        return usersWithoutPasswords;
    }

    // DELETE /api/user/:id — soft-deletes a user by setting isActive to false.
    // The row stays in the database; owner-only check is currently commented out.
    @Delete(':id')
    @UseGuards(AuthGuard)
    @UseGuards(RolesGuard)
    async deactivateUser(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userServices.deleteUser(Number(id));


        return user;
    }



    // GET /api/user/isAuth — lets the frontend check whether the user is logged in.
    // Returns "Authorized !" if AuthGuard passes, otherwise the guard rejects the request.
    @Get('isAuth')
    @UseGuards(AuthGuard)
    isAuth () {
        console.log(`[AUTH GUARD] Checking If The User Is LoggedIn !`);


        return {
            message: "Authorized !"
        };
    }

    // GET /api/user/isOwner — lets the frontend check whether the user has the owner role.
    // Used to protect owner-only pages (e.g. user creation); RolesGuard does the check.
    @Get('isOwner')
    @UseGuards(AuthGuard)
    @UseGuards(RolesGuard)
    isOwner () {
        console.log(`[AUTH GUARD] Checking If The User Is Owner !`);

        return {
            message: "Authorized !"
        };
    }


}