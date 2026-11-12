// =====================================================================
// skill.service.ts - business logic for Skill
// =====================================================================
// A SERVICE holds the logic and the database access; the controller only
// receives HTTP and delegates to it. Here the service is almost empty,
// because all the CRUD comes from CrudService<Skill> (inheritance).

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service';
import { Skill } from './entities/skill.entity';


//efhemm -> explanation:
// @Injectable() marks the class as a PROVIDER: Nest's IoC container creates
// ONE instance of it and gives it to whoever asks in a constructor
// (dependency injection). We never write `new SkillService()` ourselves.
@Injectable()
export class SkillService extends CrudService<Skill> {
  // @InjectRepository(Skill) asks the container for the Repository<Skill>
  // that TypeOrmModule.forFeature([Skill]) created.
  // The constructor does not store it: it passes it UP to the parent with
  // super(repository), and the parent keeps it as `this.repository`.
  constructor(@InjectRepository(Skill) repository: Repository<Skill>) {
    super(repository);
  }
}