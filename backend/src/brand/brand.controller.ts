import { Controller, UseGuards,  Post, Get, Patch,  Body, Param, Req, Res, ParseIntPipe } from "@nestjs/common"
import { BrandCreationDto } from "./dto/createBrand.dto.js"
import { BrandService } from "./brand.service.js"
import { BrandUpdateDto } from "./dto/updateBrand.dto.js";
import { AuthGuard } from "../Auth/auth.guard.js";



@Controller('api/brand')
export class BrandController {


    constructor (
        private readonly brandService: BrandService
    ) { }

    @UseGuards(AuthGuard)
    @Post()
    async createBrand ( @Body() data: BrandCreationDto ) {

        return await this.brandService.createBrand(data);
    }

    @UseGuards(AuthGuard)
    @Post('name')
    async searchByName ( @Body( ) data:any ) {

        return await this.brandService.retriveByName(data?.name);
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async modifiyBrand ( @Param('id', ParseIntPipe) id: number, @Body( ) data: BrandUpdateDto ) {

        

        return await this.brandService.modifieBrand(id, data);
    }

    @UseGuards(AuthGuard)
    @Get()
    async retrieveBrands ( ) {


        return await this.brandService.listBrands();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async retrieveExactBrand ( @Param('id', ParseIntPipe) id: number) {
        
        return await this.brandService.retrivebyId(id);
    }

}