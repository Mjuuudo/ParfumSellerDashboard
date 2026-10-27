import { Controller, Body, UseGuards, ParseIntPipe,  Req, Param, Post, Get } from "@nestjs/common"
import { StockCreationDto } from "./dto/stockCreation.dto.js";
import { AuthGuard } from "../Auth/auth.guard.js";
import type { Request } from 'express'
import { StockService } from "./stock.service.js";

// Express's Request + the `user` object that AuthGuard attaches (see auth.guard.ts).
interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        username: string;
        role: string;
    };
}

@Controller('/api/stock')
export class StockController{

    constructor ( 
        private readonly stockService: StockService
    ) { }



    @Post()
    @UseGuards(AuthGuard)
    async createStock( @Body() data: StockCreationDto,
                        @Req() request: AuthenticatedRequest ) {
        const userID = request.user.userId;
        


        return await this.stockService.createStockBatch(Number(userID), data);
    }

    @Get()
    @UseGuards(AuthGuard)
    async getStockBatches ( ) {


        return await this.stockService.retreiveStockBatch();
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getStockById( @Param('id', ParseIntPipe) id: number) {


        return await this.stockService.retreiveById(id);
    }
}