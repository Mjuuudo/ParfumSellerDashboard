import { Module } from '@nestjs/common';
import { UserController } from './users.controller.js';
import { UserService } from './users.service.js';
import { AuthModule } from '../Auth/auth.module.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [AuthModule],
})
export class UserModule {}