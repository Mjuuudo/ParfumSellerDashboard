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

        const searchPerfum = await db.orm.public.Parfum.where({
            id: data.parfumId
        }).first();

        if ( !searchPerfum ) {
            throw new NotFoundException(`Parfum Selected Not Found`)
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
        const stock = await db.orm.public.StockBatch.include('parfum',
            (parfum) => 
                parfum.include('brand', 
                    (brand) => 
                        brand.select('name',
                             'isActive'))
                                    .select('name'),
        ).include(
            'receivedByUser',
             (user) =>
                 user.select('id',
                         'username')
        ).all();

        if (stock.length === 0){
            return ;
        }

        return stock;
    }


    async retreiveById( id: number ) {
        const batch = await db.orm.public.StockBatch.where({
            id: id
        }).include('parfum', 
            (parfum) => parfum
                    .include('brand',(brand) => brand.
                        select('name', 'isActive'))
                            .select('id', 'name'))
                                .include('receivedByUser', 
                                    (user) => user
                                    .select('username',
                                         'email')).first();

        if ( !batch ) {
            return ;
        }

        return batch ;
    }

}