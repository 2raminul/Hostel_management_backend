import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

type ResponseType = new (...args: any[]) => any;

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseType = this.reflector.get<ResponseType>(
      'responseType',
      context.getHandler(),
    );

    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        if (responseType) {
          return {
            status_code: statusCode,
            data: plainToInstance(responseType, data, {
              excludeExtraneousValues: true,
            }),
            message: 'Request successful',
          };
        }

        return {
          status_code: statusCode,
          data: data,
          message: 'Request successful',
        };
      }),
    );
  }
}
