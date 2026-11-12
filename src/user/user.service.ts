// =====================================================================
// user.service.ts - business logic for User
// =====================================================================
// Identical in structure to SkillService: all CRUD is inherited from
// CrudService<User>. The seed script uses this service to create users.

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository);
  }
}