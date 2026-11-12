// =====================================================================
// cv.module.ts - the Cv feature "box"
// =====================================================================

import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skill/entities/skill.entity';

@Module({
  // forFeature([...]) registers entities in THIS module and creates one
  // Repository per entity, which can then be injected with @InjectRepository.
  // CvService needs TWO repositories:
  //   - Repository<Cv>    : to save/find cvs,
  //   - Repository<Skill> : to look up the skills whose ids the client sent.
  // That's why Skill is listed here too: a module can only inject the
  // repositories it registered itself.
  imports: [TypeOrmModule.forFeature([Cv, Skill])],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
