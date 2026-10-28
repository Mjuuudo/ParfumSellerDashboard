import { Injectable } from "@nestjs/common"
import { StockCreationDto } from "./dto/stockCreation.dto";
import { db } from "../prisma/db.js";
import { UnauthorizedException } from "@nestjs/common";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { StockUpdateDto } from "./dto/stockUpdate.dto";


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
            // A new delivery: no bottle opened yet, so every bottle is unused.
            unusedQuantity: data.quantity,
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
                         'username',
                        'firstName',
                            'lastName')
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

    async modifieBatch ( id: number, data : StockUpdateDto) {
        const batch = await this.retreiveById(id);
        if( !batch ) {
            return ;
        }

        // Bottles already opened from this batch can't be "un-opened": the new quantity
        // must still cover them, and unusedQuantity moves by the same amount as quantity.
        const openedBottles = batch.quantity - batch.unusedQuantity;
        if (data.quantity !== undefined && data.quantity < openedBottles) {
            throw new BadRequestException(
                `Quantity can't be lower than the ${openedBottles} bottle(s) already opened from this batch !`
            );
        }

        // Bottles reserved for pending orders must stay in the batch, and must stay this perfume.
        if (data.quantity !== undefined && data.quantity - openedBottles < batch.reservedQuantity) {
            throw new BadRequestException(
                `${batch.reservedQuantity} sealed bottle(s) of this batch are reserved for pending orders: the quantity can't go below ${openedBottles + batch.reservedQuantity} !`
            );
        }
        if (data.parfumId !== undefined && data.parfumId !== batch?.parfum?.id && batch.reservedQuantity > 0) {
            throw new BadRequestException(`This batch has bottles reserved for pending orders: its perfume can't be changed.`);
        }

        const newObject = {
            ...((data.parfumId !== batch?.parfum?.id
                && data.parfumId !== undefined
            ) && {
                parfumId: data.parfumId,
            }),
            ...((data.quantity !== batch?.quantity
                && data.quantity !== undefined
            ) && {
                quantity: data.quantity,
                unusedQuantity: data.quantity - openedBottles,
            }),
            ...((data.purchaseCostPerBottle !== batch?.purchaseCostPerBottle 
                    && data.purchaseCostPerBottle !== undefined
            ) && {
                purchaseCostPerBottle: data.purchaseCostPerBottle,
            }),
        }

        if ( !Object.keys(newObject).length ) {
            return ;
        }

        const result = await db.orm.public.StockBatch.where({
            id: id
        }).update(newObject);

        return result;
    }

}