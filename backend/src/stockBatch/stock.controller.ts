import { Controller, Body, UseGuards, ParseIntPipe,  Req, Param, Post, Get, Patch } from "@nestjs/common"
import { StockCreationDto } from "./dto/stockCreation.dto.js";
import { AuthGuard } from "../Auth/auth.guard.js";
import type { Request } from 'express'
import { StockService } from "./stock.service.js";
import { StockUpdateDto } from "./dto/stockUpdate.dto.js";

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

    @Patch(':id')
    @UseGuards(AuthGuard)
    async modifyStockBatch ( @Param('id', ParseIntPipe) id: number,@Body() data: StockUpdateDto) {



        return await this.stockService.modifieBatch(id, data);
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