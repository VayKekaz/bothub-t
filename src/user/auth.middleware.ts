import {
    CanActivate,
    createParamDecorator,
    ExecutionContext,
    Injectable,
    Logger,
    NestMiddleware,
    SetMetadata,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { User, UserRole } from './user.model';


export type Authorization = Omit<User, 'password'> | null

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly jwt: JwtService,
    ) {
    }

    use(req: Request, res: Response, next: () => void) {
        const bearerToken = req.header('Authorization');
        if (!bearerToken) {
            this.logger.verbose('No `Authorization` header found.');
            return next();
        }

        const token = bearerToken.substring('Bearer '.length);
        if (!token) {
            this.logger.verbose('Invalid token format');
            return next();
        }

        try {
            // @ts-ignore
            req.user =
                this.jwt.verify(token);
            return next();
        } catch (e) {
            this.logger.verbose('Error authorizing request:', e);
            throw new UnauthorizedException('Invalid authorization token.');
        }
    }
}

export const RequestUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): Authorization => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

@Injectable()
export class MustAuth implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        request.user;
        return true;
    }
}

export const MustHaveRole = (...oneOf: Array<UserRole>) => {
    return SetMetadata('mustHaveRole', new Set(oneOf));
};

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get('mustHaveRole', context.getHandler());
        if (!roles || !(roles instanceof Set) || roles.size < 0)
            return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || typeof user.role !== 'string')
            return false;
        return roles.has(user.role);
    }
}
