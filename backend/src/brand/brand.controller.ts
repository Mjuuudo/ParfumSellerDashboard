import { Controller, Post, Get, Body, Param, Req, Res } from "@nestjs/common"
import { BrandCreationDto } from "./dto/createBrand.dto.js"
import { BrandService } from "./brand.service.js"



@Controller('api/brand')
export class BrandController {


    constructor (
        private readonly brandService: BrandService
    ) { }

    
    @Post()
    async createBrand ( @Body() data: BrandCreationDto ) {


        return await this.brandService.createBrand(data);
    }

    @Get()
    async retrieveBrands ( ) {


        return await this.brandService.listBrands();
    }

}