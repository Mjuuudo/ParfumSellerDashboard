import { Module } from "@nestjs/common"
import { ParfumController } from "./parfum.controller.js";
import { ParfumService } from "./parfum.service.js";
import { BrandModule } from "../brand/brand.module.js";


@Module({
    controllers: [ ParfumController ],
    providers: [ ParfumService ],
    imports: [ BrandModule ]
})
export class ParfumModule{}