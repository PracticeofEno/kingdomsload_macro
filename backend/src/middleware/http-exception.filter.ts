import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { LogService } from 'src/log/log.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    // constructor(private readonly logService: LogService) {}
    constructor() {}
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        // this.logService.logError(
        //     `ExceptionFilter`,
        //     `${request.method} - ${request.url}`,
        //     exception,
        // );
        console.log(`[${request.url}] ENDED - EXCEPTION DETECT!`);
        console.log(exception);
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
