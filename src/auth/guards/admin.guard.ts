import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user';

@Injectable() 
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        if(req.user?.role !== 'admin') {
            throw new ForbiddenException('Admins only');
        }
        return true;
    }
}