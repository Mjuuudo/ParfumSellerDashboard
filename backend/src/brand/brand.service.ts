import { Injectable } from "@nestjs/common"
import { db } from "../prisma/db.js";
import { BrandCreationDto } from "./dto/createBrand.dto.js";



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

}