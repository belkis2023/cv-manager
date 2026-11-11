import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skill/entities/skill.entity';

@Module({
  //what's this doingg
  imports: [TypeOrmModule.forFeature([Cv, Skill])],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
