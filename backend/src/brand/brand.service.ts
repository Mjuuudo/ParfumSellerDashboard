import { Injectable } from "@nestjs/common"
import { db } from "../prisma/db.js";
import { BrandCreationDto } from "./dto/createBrand.dto.js";
import { BrandUpdateDto } from "./dto/updateBrand.dto.js";



@Injectable()
export class BrandService {

    
    async createBrand ( data: BrandCreationDto ) {
        const brand = await db.orm.public.Brand.create({
            name: data.name })



        return brand ;
    }


    async listBrands ( ) {
        const brands = await db.orm.public.Brand.all();

        return brands;
    }

    async retrivebyId ( brandId: number ) {
        const brand = await db.orm.public.Brand.where ({
            id: brandId
        }).first();

        if (!brand) {
            throw new Error(`Brand Not Found`);// To Change It To Not Found
        }

        return brand;
    }

    async retriveByName ( brandName: string ) {
        const brand = await db.orm.public.Brand.where({
            name: brandName
        }).first();


        if ( !brand ) {
            throw new Error(`brand Not Found By Name !`);
        }

        return (brand);
    } 

    async modifieBrand( brandId: number, data: BrandUpdateDto) {
        const brand = await db.orm.public.Brand.where({
            id: brandId
        }).first();

        if (!brand) {
            throw new Error(`Brand Not Found !`);
        }

        const updatedObject = {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.isActive !== undefined && {
                isActive: data.isActive,
            }),
        };

        if ( !Object.keys(updatedObject) ) {
            return brand;
        }

        const updatedItem = await db.orm.public.Brand.where({
            id: brandId
        }).update(updatedObject);


        return updatedItem;
    }

}