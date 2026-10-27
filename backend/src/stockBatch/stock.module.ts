import { Module } from "@nestjs/common"
import { StockService } from "./stock.service.js";
import { AuthGuard } from "../Auth/auth.guard.js";
import { AuthModule } from "../Auth/auth.module.js";
import { StockController } from "./stock.controller.js";


@Module({
    controllers:[ StockController ],
    providers:[ StockService],
    imports:[ AuthModule ]
})
export class StockModule{

}