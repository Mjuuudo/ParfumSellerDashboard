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


    @Post()
    @UseGuards(AuthGuard)
    async createParfum ( @Body() data: ParfumCreationDto ) {
        
    
        return await this.parfumService.createParfum(data);      
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    async  updateParfum (@Body() data: ParfumUpdateDto, @Param('id', ParseIntPipe) id: number) {

    
        return await this.parfumService.modifieParfum(data, id);
    }

    @Get()
    @UseGuards(AuthGuard)
    async retreiveParfum ( ) {

        return await this.parfumService.retrieveAllParfumes()
    }
    @Get(':id')
    @UseGuards(AuthGuard)
    async retreiveParfumById (@Param('id', ParseIntPipe) id: number) {



        return await this.parfumService.retrieveParfunById(id);
    }

}