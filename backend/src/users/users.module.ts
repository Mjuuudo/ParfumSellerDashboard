import { Module } from '@nestjs/common';
import { UserController } from './users.controller.js';
import { UserService } from './users.service.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}