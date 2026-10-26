import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller.js';
import { BrandService } from './brand.service.js';
import { AuthModule } from '../Auth/auth.module.js';

@Module({
    controllers: [ BrandController ],
    providers: [ BrandService ],
    imports: [ AuthModule]
})
export  class BrandModule {

}