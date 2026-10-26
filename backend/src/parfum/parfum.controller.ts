import { Controller, Post, Get, Body, Param} from "@nestjs/common"
import { ParfumCreationDto } from "./dto/createParfum.dto.js";
import { ParfumService } from "./parfum.service.js";



@Controller('/api/parfum')
export class ParfumController{


    constructor ( 
        private readonly parfumService: ParfumService
    ) {  }


    @Post()
    async createParfum ( @Body() data: ParfumCreationDto ) {
        
    
        return await this.parfumService.createParfum(data);      
    }

    @Get()
    async retreiveParfum ( ) {

        return await this.parfumService.retrieveAllParfumes()
    }

}