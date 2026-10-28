import { Module } from '@nestjs/common';
import { AuthModule } from '../Auth/auth.module.js';
import { InventoryController, OrderController } from './order.controller.js';
import { InventoryService } from './inventory.service.js';
import { OrderService } from './order.service.js';

@Module({
    controllers: [ OrderController, InventoryController ],
    providers: [ OrderService, InventoryService ],
    imports: [ AuthModule ],
    exports: [ OrderService ]
})
export class OrderModule {

}
