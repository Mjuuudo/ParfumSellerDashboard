import { Controller, Body, UseGuards, ParseIntPipe, Param, Post, Req, Get } from "@nestjs/common"
import { AuthGuard } from "../Auth/auth.guard.js";
import type { Request } from "express"
import { BottleCreationDto } from "./dto/bottleCreation.dto.js";
import { BottleService } from "./bottle.service.js";


interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        username: string;
        role: string;
    };
}



@Controller('/api/bottle')
export class BottleController{


    constructor(
        private readonly bottleService: BottleService
    ) { }

    @Post()
    @UseGuards( AuthGuard )
    async createBottle( @Body() data: BottleCreationDto, @Req() request: AuthenticatedRequest ) {
        const userId = request.user.userId;



        return await this.bottleService.createBottle(data, userId)
    }

    @Get()
    @UseGuards(AuthGuard)
    async test() {

        return await this.bottleService.listAllBottles();
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getElemenetById(@Param('id', ParseIntPipe) id:number ) {


        return await this.bottleService.getBottleById(id);
    }

}