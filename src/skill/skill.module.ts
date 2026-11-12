// =====================================================================
// skill.module.ts - the Skill feature "box"
// =====================================================================
// Each feature module declares what it contains. Nest uses this to know which
// controller serves which routes and which services can be injected.

import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';

@Module({
  // forFeature([Skill]) registers the Skill entity in THIS module and creates
  // its Repository<Skill>. Without it, `@InjectRepository(Skill)` in the
  // service would fail with "can't resolve dependencies", and (because of
  // autoLoadEntities) the table would not even be created.
  imports: [TypeOrmModule.forFeature([Skill])],
  // Classes that receive HTTP requests.
  controllers: [SkillController],
  // Classes Nest can create and inject (services...).
  providers: [SkillService],
  // No `exports`: no other module needs SkillService through the module system.
  // (The seed script gets it with app.get(SkillService), which searches the
  // whole container, so exports aren't required for that.)
})
export class SkillModule {}
