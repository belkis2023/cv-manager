// =====================================================================
// cv.service.ts - business logic for Cv  (master branch)
// =====================================================================
// It extends CrudService<Cv> (so findOne and remove come for free) and
// overrides what is specific to Cvs: the skills (many-to-many) must be
// attached from a list of ids sent by the client.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service';
import { Skill } from '../skill/entities/skill.entity';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';


@Injectable()
export class CvService extends CrudService<Cv> {

  constructor(
    @InjectRepository(Cv) repository: Repository<Cv>,
    // `private readonly` here creates this.skillRepository (only this class
    // needs it). The first repository goes to the parent through super().
    @InjectRepository(Skill) private readonly skillRepository: Repository<Skill>,
  ) {
    super(repository);
  }

  // `override` = "I deliberately replace the parent's method" (TypeScript
  // checks the parent really has it).
  // Same as the parent's findAll but also loads the skills (a relation is
  // NOT loaded by default).
  override findAll(): Promise<Cv[]> {
    return this.repository.find({ relations: {skills: true } });
  }

  override async create(dto: CreateCvDto): Promise<Cv> {
    // Destructuring: pull `skillIds` out of dto; `data` is "all the rest".
    // We separate them because skillIds is NOT a column of Cv.
    const { skillIds, ...data } = dto;
    // create() only builds the object in memory (no SQL yet).
    const cv = this.repository.create(data);
    // `?.length` is safe if skillIds is undefined; the if is false for an
    // empty array too.
    if(skillIds?.length) {
      // In([1,2]) -> SQL "WHERE id IN (1,2)": loads all those skills at once.
      // Assigning cv.skills makes save() fill the join table cv_skills_skill.
      cv.skills = await this.skillRepository.findBy({ id: In(skillIds )});
    }
    return this.repository.save(cv);
  }

  // Partial update. Same idea as the parent's update, plus the skills.
  override async update(id: number, dto: UpdateCvDto): Promise<Cv> {
    const { skillIds, ...data } = dto;
    // preload = load the existing row and merge the new fields (undefined if
    // the id doesn't exist -> 404 below).
    const cv = await this.repository.preload({ id, ...data });
    if(!cv) throw new NotFoundException(`Element with id ${id} not found`);
    // `if(skillIds)` (not `?.length`) so that sending [] REPLACES the skills
    // by an empty list, whereas OMITTING skillIds leaves them untouched.
    if(skillIds) {
      cv.skills = await this.skillRepository.findBy({ id: In(skillIds) });
    }
    return this.repository.save(cv);
  }

}
