import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';


@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
    catch(exception: ZodError, host: ArgumentsHost) {
        // throw new BadRequestException(
        //     exception.errors,
        //     { cause: exception },
        // );
        const response = host.switchToHttp().getResponse<Response>();
        response.status(400).json({ errors: exception.errors });
    }
}
