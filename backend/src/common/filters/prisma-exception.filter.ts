import {
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Logger } from '@nestjs/common';



function isPrismaError ( exception: unknown ): boolean {

    if (!exception || typeof exception !== 'object') {
        return false;
    }

    const error = exception as any;

    if (error.kind === 'sql_query' && error.sqlState === '23505') {
        Logger.error('PrismaExceptionFilter caught a Prisma error:', error.message);
        return true;
    }
    return false;


}


@Catch()
export class PrismaExceptionFilter extends BaseExceptionFilter {


    catch ( exception: unknown, host: ArgumentsHost ) {
        
        if (isPrismaError(exception)) {
            const response = host.switchToHttp().getResponse();
            response.status(409).json({
                statusCode: 409,
                message: 'Data already exists In Our Records',
                error: 'Conflict',
            });
            return;

        }
    
        super.catch(exception, host);
    }
}
