import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { InventoryController, OrderController } from './order.controller.js';
import { InventoryService } from './inventory.service.js';
import { OrderService } from './order.service.js';
import { DashboardService } from './dashboard.service.js';

@Module({
    controllers: [ OrderController, InventoryController ],
    providers: [ OrderService, InventoryService, DashboardService ],
    imports: [ AuthModule ],
    exports: [ OrderService ]
})
export class OrderModule {

}
