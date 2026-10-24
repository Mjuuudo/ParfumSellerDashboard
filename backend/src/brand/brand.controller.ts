import { Controller, Post, Get, Patch,  Body, Param, Req, Res, ParseIntPipe } from "@nestjs/common"
import { BrandCreationDto } from "./dto/createBrand.dto.js"
import { BrandService } from "./brand.service.js"
import { BrandUpdateDto } from "./dto/updateBrand.dto.js";



@Controller('api/brand')
export class BrandController {


    constructor (
        private readonly brandService: BrandService
    ) { }

    
    @Post()
    async createBrand ( @Body() data: BrandCreationDto ) {

        return await this.brandService.createBrand(data);
    }

    @Post('name')
    async searchByName ( @Body( ) data:any ) {

        return await this.brandService.retriveByName(data?.name);
    }

    @Patch(':id')
    async modifiyBrand ( @Param('id', ParseIntPipe) id: number, @Body( ) data: BrandUpdateDto ) {

        

        return await this.brandService.modifieBrand(id, data);
    }

    @Get()
    async retrieveBrands ( ) {


        return await this.brandService.listBrands();
    }

    @Get(':id')
    async retrieveExactBrand ( @Param('id', ParseIntPipe) id: number) {
        
        return await this.brandService.retrivebyId(id);
    }

}