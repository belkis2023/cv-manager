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
    @InjectRepository(Skill) private readonly skillRepository: Repository<Skill>,
  ) {
    super(repository);
  }

  override findAll(): Promise<Cv[]> {
    return this.repository.find({ relations: {skills: true } });
  }

  override async create(dto: CreateCvDto): Promise<Cv> {
    const { skillIds, ...data } = dto;
    const cv = this.repository.create(data);
    if(skillIds?.length) {
      cv.skills = await this.skillRepository.findBy({ id: In(skillIds )});
    }
    return this.repository.save(cv);
  }

  override async update(id: number, dto: UpdateCvDto): Promise<Cv> {
    const { skillIds, ...data } = dto;
    const cv = await this.repository.preload({ id, ...data });
    if(!cv) throw new NotFoundException(`Element with id ${id} not found`);
    if(skillIds) {
      cv.skills = await this.skillRepository.findBy({ id: In(skillIds) });
    }
    return this.repository.save(cv);
  }

}
