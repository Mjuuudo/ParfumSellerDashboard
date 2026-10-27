import { Controller, UseGuards, Post, Patch, Get, Body, Param, ParseIntPipe} from "@nestjs/common"
import { ParfumCreationDto } from "./dto/createParfum.dto.js";
import { ParfumService } from "./parfum.service.js";
import { ParfumUpdateDto } from "./dto/updateParfum.dto.js";
import { AuthGuard } from "../Auth/auth.guard.js";



@Controller('/api/parfum')
export class ParfumController{


    constructor ( 
        private readonly parfumService: ParfumService
    ) {  }


    // POST /api/parfum — creates a perfume: name, brandId, originalVolume and the three prices.
    // Checks the brand exists and the bottle size is one of the catalogue sizes.
    @Post()
    @UseGuards(AuthGuard)
    async createParfum ( @Body() data: ParfumCreationDto ) {
        
    
        return await this.parfumService.createParfum(data);      
    }

    // PATCH /api/parfum/:id — partial update: only the fields sent in the body change.
    // Used by the perfume edit page and the on/off button in the perfumes list.
    @Patch(':id')
    @UseGuards(AuthGuard)
    async  updateParfum (@Body() data: ParfumUpdateDto, @Param('id', ParseIntPipe) id: number) {

    
        return await this.parfumService.modifieParfum(data, id);
    }

    // GET /api/parfum — returns every perfume with its brand included.
    // Requires a logged-in user; throws 404 when there are no perfumes yet.
    @Get()
    @UseGuards(AuthGuard)
    async retreiveParfum ( ) {

        return await this.parfumService.retrieveAllParfumes()
    }
    // GET /api/parfum/:id — returns one perfume by id, with its brand (used by the edit page).
    // Must stay below the fixed GET routes; :id is parsed to a number by ParseIntPipe.
    @Get(':id')
    @UseGuards(AuthGuard)
    async retreiveParfumById (@Param('id', ParseIntPipe) id: number) {



        return await this.parfumService.retrieveParfunById(id);
    }

}