import { Module } from "@nestjs/common"
import { AuthModule } from "../Auth/auth.module.js";
import { BottleController } from "./bottle.controller.js";
import { BottleService } from "./bottle.service.js";



@Module({
    controllers:[ BottleController ],
    providers:[ BottleService ],
    imports:[ AuthModule ]
})

export class BottleModule{

}