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

    // POST /api/brand — creates a brand from { name, image? }.
    // Requires a logged-in user; the name must be unique (duplicate → 409 via the Prisma filter).
    @UseGuards(AuthGuard)
    @Post()
    async createBrand ( @Body() data: BrandCreationDto ) {

        return await this.brandService.createBrand(data);
    }

    // POST /api/brand/name — finds one brand by its exact name, sent as { name } in the body.
    // Requires a logged-in user; the body is not validated by a DTO (typed as any).
    @UseGuards(AuthGuard)
    @Post('name')
    async searchByName ( @Body( ) data:any ) {

        return await this.brandService.retriveByName(data?.name);
    }

    // PATCH /api/brand/:id — partial update: only the fields sent (name, image, isActive) change.
    // Also used by the on/off button in the brands list; returns the brand unchanged if nothing was sent.
    @UseGuards(AuthGuard)
    @Patch(':id')
    async modifiyBrand ( @Param('id', ParseIntPipe) id: number, @Body( ) data: BrandUpdateDto ) {

        

        return await this.brandService.modifieBrand(id, data);
    }

    // GET /api/brand — returns every brand, active and inactive.
    // Requires a logged-in user; used by the brands list and the perfume brand dropdowns.
    @UseGuards(AuthGuard)
    @Get()
    async retrieveBrands ( ) {


        return await this.brandService.listBrands();
    }

    // GET /api/brand/:id — returns one brand by id (used by the brand edit page).
    // Must stay below the fixed GET routes; :id is parsed to a number by ParseIntPipe.
    @UseGuards(AuthGuard)
    @Get(':id')
    async retrieveExactBrand ( @Param('id', ParseIntPipe) id: number) {
        
        return await this.brandService.retrivebyId(id);
    }

}