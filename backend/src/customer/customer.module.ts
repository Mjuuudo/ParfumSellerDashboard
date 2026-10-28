import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';
import { AuthModule } from '../Auth/auth.module.js';

@Module({
    controllers: [ CustomerController ],
    providers: [ CustomerService ],
    imports: [ AuthModule ],
    exports: [ CustomerService ]
})
export class CustomerModule {

}
