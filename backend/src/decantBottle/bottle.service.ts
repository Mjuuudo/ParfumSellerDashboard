import { BadRequestException, Injectable } from "@nestjs/common"
import { db } from "../prisma/db.js";
import { Temporal } from "temporal-polyfill";
import { BottleCreationDto } from "./dto/bottleCreation.dto.js";



@Injectable()
export class BottleService{


    async createBottle( data:BottleCreationDto, userId: number ) {
        const stockbatch = await db.orm.public.StockBatch.where(
            {id: data.stockBatchId}
        ).include('parfum',
             (parfum) => parfum.include('brand',
                 (brand) => brand.select('name'))
                 .select('name', 'originalVolume', 'completePrice'
                    , 'decant10Price', 'decant20Price')).include(
                        'receivedByUser', (user) => user.select('id', 'username', 'email')
                    ).first();

        if ( !stockbatch || stockbatch.unusedQuantity === 0 
                || !stockbatch.parfum || !stockbatch.receivedByUser  ) {
            throw new Error(`Malformed Stockbatch Object`) ;
        }

        // Sealed bottles reserved for pending orders can't be opened (available = unused − reserved).
        if ( stockbatch.unusedQuantity - stockbatch.reservedQuantity <= 0 ) {
            throw new BadRequestException(`Every sealed bottle left in this batch is reserved for a pending order.`);
        }

        const newObject = {
            parfumId: stockbatch.parfumId,
            stockBatchId: stockbatch.id,
            initialVolumeMl: stockbatch.parfum.originalVolume,
            remainingVolumeMl: stockbatch.parfum.originalVolume,
            // DateTime columns use a Temporal codec: they take a Temporal.Instant, not a Date.
            reservedAt: Temporal.Now.instant(),
            reservedById: stockbatch.receivedByUser.id,
        };

        const result = await db.orm.public.DecantBottle.create(newObject);
        await db.orm.public.StockBatch.where({id: data.stockBatchId}).update({
            unusedQuantity: (stockbatch.unusedQuantity - 1),
        });

        return result;
    }

    async listAllBottles( ) {
        const bottles = await db.orm.public.DecantBottle.include(
            'stockBatch', (stockBatch) => stockBatch.include(
                'parfum', (parfum) => parfum.include('brand', 
                    (brand) => brand.select('name')
                ).select('name', 'originalVolume', 'completePrice')
            ).include('receivedByUser', (user) => user.select('id', 'username', 'email')).
            select('quantity', 'unusedQuantity', 'purchaseCostPerBottle')
        ).all()
    
    
        return bottles;
    }

    async getBottleById ( bottleId: number ) {
         const bottle = await db.orm.public.DecantBottle.include(
            'stockBatch', (stockBatch) => stockBatch.include(
                'parfum', (parfum) => parfum.include('brand', 
                    (brand) => brand.select('name')
                ).select('name', 'originalVolume', 'completePrice')
            ).include('receivedByUser', (user) => user.select('id', 'username', 'email')).
            select('quantity', 'unusedQuantity', 'purchaseCostPerBottle')
        ).where({id: bottleId}).first();
        
        
        if ( !bottle ) {
            return ;
        }

        return bottle;

    }

    async test() {
        const stockbatch = await db.orm.public.StockBatch.where(
            {id: 1}
        ).include('parfum',
             (parfum) => parfum.include('brand',
                 (brand) => brand.select('name'))
                 .select('name', 'originalVolume', 'completePrice'
                    , 'decant10Price', 'decant20Price')).include(
                        'receivedByUser', (user) => user.select('id', 'username', 'email')
                    ).first();


            return stockbatch;
    }

}
