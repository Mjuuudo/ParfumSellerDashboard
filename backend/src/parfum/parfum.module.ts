import { Module } from "@nestjs/common"
import { ParfumController } from "./parfum.controller.js";
import { ParfumService } from "./parfum.service.js";
import { BrandModule } from "../brand/brand.module.js";
import { AuthModule } from "../Auth/auth.module.js";


@Module({
    controllers: [ ParfumController ],
    providers: [ ParfumService ],
    imports: [ BrandModule, AuthModule ]
})
export class ParfumModule{}