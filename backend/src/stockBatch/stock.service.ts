import { Injectable } from "@nestjs/common"
import { StockCreationDto } from "./dto/stockCreation.dto";
import { db } from "../prisma/db.js";
import { UnauthorizedException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";


@Injectable()
export class StockService{



    async createStockBatch ( userId: number, data: StockCreationDto) {
        const searchUser = await db.orm.public.User.where({
            id: userId
        }).first();

        if (!searchUser){
            throw new NotFoundException(`User Not Found !`);
        }

        const newObject = {
            parfumId: data.parfumId,
            quantity: data.quantity,
            purchaseCostPerBottle: data.purchaseCostPerBottle,
            receivedBy: Number(userId)
        };

        const result = await db.orm.public.StockBatch.create(newObject);

        return result;
    }


    async retreiveStockBatch ( ) {
        const stock = await db.orm.public.StockBatch.all();

        if (stock.length === 0){
            return ;
        }

        return stock;
    }


    async retreiveById( id: number ) {
        const batch = await db.orm.public.StockBatch.where({
            id: id
        }).first();

        if ( !batch ) {
            return ;
        }

        return batch ;
    }

}