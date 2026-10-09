import {
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isStructuredError } from '@prisma/orm-postgres/utils/structured-error';


@Catch()
export class PrismaExceptionFilter extends BaseExceptionFilter {


    catch ( exception: unknown, host: ArgumentsHost ) {
          if (isStructuredError(exception)) {

        if (String(exception.code) === '23505') {
            const response = host.switchToHttp().getResponse();

            return response.status(409).json({
                statusCode: 409,
                message: 'Username or email already exists',
            });
        }
    }

        super.catch(exception, host);
    }
}
