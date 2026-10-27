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



    // POST /api/stock — records a delivery: { parfumId, quantity, purchaseCostPerBottle }.
    // receivedBy is taken from the logged-in user (request.user.userId), never from the body.
    @Post()
    @UseGuards(AuthGuard)
    async createStock( @Body() data: StockCreationDto,
                        @Req() request: AuthenticatedRequest ) {
        const userID = request.user.userId;
        


        return await this.stockService.createStockBatch(Number(userID), data);
    }

    // PATCH /api/stock/:id — corrects a delivery: only the fields sent (parfumId, quantity, cost) change.
    // receivedBy can't be changed here (not in StockUpdateDto, so whitelist strips it).
    @Patch(':id')
    @UseGuards(AuthGuard)
    async modifyStockBatch ( @Param('id', ParseIntPipe) id: number,@Body() data: StockUpdateDto) {



        return await this.stockService.modifieBatch(id, data);
    }

    // GET /api/stock — returns every delivery with its perfume (+ brand) and the user who received it.
    // Requires a logged-in user; used by the Inventory list page.
    @Get()
    @UseGuards(AuthGuard)
    async getStockBatches ( ) {


        return await this.stockService.retreiveStockBatch();
    }

    // GET /api/stock/:id — returns one delivery by id, with its perfume and receiver (used by the edit page).
    // Must stay below the fixed GET routes; :id is parsed to a number by ParseIntPipe.
    @Get(':id')
    @UseGuards(AuthGuard)
    async getStockById( @Param('id', ParseIntPipe) id: number) {


        return await this.stockService.retreiveById(id);
    }
}