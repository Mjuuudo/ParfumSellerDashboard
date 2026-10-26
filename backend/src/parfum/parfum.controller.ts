import { Controller, Post, Patch, Get, Body, Param, ParseIntPipe} from "@nestjs/common"
import { ParfumCreationDto } from "./dto/createParfum.dto.js";
import { ParfumService } from "./parfum.service.js";
import { ParfumUpdateDto } from "./dto/updateParfum.dto.js";



@Controller('/api/parfum')
export class ParfumController{


    constructor ( 
        private readonly parfumService: ParfumService
    ) {  }


    @Post()
    async createParfum ( @Body() data: ParfumCreationDto ) {
        
    
        return await this.parfumService.createParfum(data);      
    }

    @Patch(':id')
    async  updateParfum (@Body() data: ParfumUpdateDto, @Param('id', ParseIntPipe) id: number) {

    
        return await this.parfumService.modifieParfum(data, id);
    }

    @Get()
    async retreiveParfum ( ) {

        return await this.parfumService.retrieveAllParfumes()
    }
    @Get(':id')
    async retreiveParfumById (@Param('id', ParseIntPipe) id: number) {



        return await this.parfumService.retrieveParfunById(id);
    }

}