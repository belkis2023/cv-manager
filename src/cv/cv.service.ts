import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service';
import { Skill } from '../skill/entities/skill.entity';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import type { JwtUser } from '../auth/types/request-with-user';


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


  override async create(dto: CreateCvDto, userId?: number): Promise<Cv> {
    const { skillIds, ...data } = dto;
    const cv = this.repository.create({ ...data, userId });
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

  //route protection and Cv ownership
  private async assertOwner(id: number, userId: number) {
    const cv = await this.findOne(id); // throws 404 if it doesn't exist
    if (cv.userId !== userId) {
      throw new ForbiddenException('You can only modify your own cvs');
    }
  }

/*   async updateOwned(id: number, dto: UpdateCvDto, userId: number) {
    await this.assertOwner(id, userId);
    return this.update(id, dto);
  }

  async removeOwned(id: number, userId: number) {
    await this.assertOwner(id, userId);
    return this.remove(id);
  } */


  //only admin (restrictions)
  async findAllFor(user: JwtUser): Promise<Cv[]> {
    const where = user.role === 'admin' ? {} : { userId: user.userId };
    return this.repository.find({ where, relations: { skills: true } });
  }

  async findOneFor(id: number, user: JwtUser): Promise<Cv> {
    const cv = await this.findOne(id);
    if (user.role !== 'admin' && cv.userId !== user.userId) {
      throw new ForbiddenException('You can only view your own cvs');
    }
    return cv;
  }

  private async assertCanModify(id: number, user: JwtUser) {
    const cv = await this.findOne(id);
    if (user.role !== 'admin' && cv.userId !== user.userId) {
      throw new ForbiddenException('You can only modify your own cvs');
    }
  }

  async updateOwned(id: number, dto: UpdateCvDto, user: JwtUser) {
    await this.assertCanModify(id, user);
    return this.update(id, dto);
  }

    async removeOwned(id: number, user: JwtUser) {
    await this.assertCanModify(id, user);
    return this.remove(id);
  }


}
