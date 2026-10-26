import { Injectable } from "@nestjs/common"
import { db } from "../prisma/db.js";
import { ParfumCreationDto } from "./dto/createParfum.dto.js";
import { UnauthorizedException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";



@Injectable()
export class ParfumService{




    async createParfum ( data: ParfumCreationDto) {
        const checkObjectExistance = await db.orm.public.Brand.where({
            id: data.brandId
        }).first();

        if ( !checkObjectExistance ) {
            throw new NotFoundException(`The Brand Linked To The Parfum Does Not Exists !`);
        }

        if (data.originalVolume !== 50 
                && data.originalVolume !== 70 &&
                data.originalVolume !== 100 && data.originalVolume !== 120 &&
                data.originalVolume !== 150 && data.originalVolume !== 200  ) {

                    throw new Error(`A Bottle size Should Be In the Correct ML Format check Catalogue`)
        }

        const newObject = {
            name: data.name,
            brandId: data.brandId,
            originalVolume: data.originalVolume,
            completePrice: data.completePrice,
            decant10Price: data.decant10Price,
            decant20Price: data.decant20Price,
        }

        const result = await db.orm.public.Parfum.create(newObject);


        return result ;
    }

    async retrieveAllParfumes ( ) {
        const data = await db.orm.public.Parfum.all();

        if ( data.length === 0 ) {
            throw new NotFoundException(`No records found In Our Database`);

        }

        return data;
    }

}