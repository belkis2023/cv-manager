// =====================================================================
// cv.service.ts - business logic for Cv (the richest service)
// =====================================================================
// It extends CrudService<Cv> (so findOne and remove come for free) and
// overrides/adds what is specific to Cvs:
//   1. skills (many-to-many) must be attached from a list of ids,
//   2. the owner (userId) comes from the logged-in user,
//   3. authorization rules: a user only sees/changes his own cvs, an admin
//      sees/changes all.

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudService } from '../common/services/crud.service';
import { Skill } from '../skill/entities/skill.entity';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
// `import type`: JwtUser is an interface (erased at compile time), so it must
// be imported as a type only.
import type { JwtUser } from '../auth/types/request-with-user';


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
  // Same as the parent's findAll but also loads the skills (relations: a
  // relation is NOT loaded by default). NOTE: since the admin/user rule was
  // added, the controller no longer calls this; it uses findAllFor() below.
  // This one remains as the unfiltered "everything" version.
  override findAll(): Promise<Cv[]> {
    return this.repository.find({ relations: {skills: true } });
  }


  // Creates a cv. The extra optional parameter `userId` is the OWNER, given by
  // the controller from the token (req.user.userId).
  override async create(dto: CreateCvDto, userId?: number): Promise<Cv> {
    // Destructuring: pull `skillIds` out of dto; `data` is "all the rest".
    // We separate them because skillIds is NOT a column of Cv.
    const { skillIds, ...data } = dto;
    // create() only builds the object in memory; { ...data, userId } copies
    // the fields and adds the owner.
    const cv = this.repository.create({ ...data, userId });
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

  //route protection and Cv ownership
  // FIRST VERSION of the ownership check (strict owner only). It is no
  // longer used: it was replaced by assertCanModify below, which also allows
  // admins. Kept here as dead code; it can be deleted.
  private async assertOwner(id: number, userId: number) {
    const cv = await this.findOne(id); // throws 404 if it doesn't exist
    if (cv.userId !== userId) {
      throw new ForbiddenException('You can only modify your own cvs');
    }
  }

/*   OLD versions (commented out by the author): they received only the user's
     id, so they could not know the role. Replaced by the versions below that
     receive the whole user.
  async updateOwned(id: number, dto: UpdateCvDto, userId: number) {
    await this.assertOwner(id, userId);
    return this.update(id, dto);
  }

  async removeOwned(id: number, userId: number) {
    await this.assertOwner(id, userId);
    return this.remove(id);
  } */


  //only admin (restrictions)
  // Slide 14: admin gets ALL cvs, a normal user only HIS cvs.
  // `where = {}` means "no filter" (all rows); `{ userId: ... }` means
  // WHERE userId = ... . We pick one or the other from the role.
  // The role comes from the JWT payload (see JwtStrategy.validate).
  async findAllFor(user: JwtUser): Promise<Cv[]> {
    const where = user.role === 'admin' ? {} : { userId: user.userId };
    return this.repository.find({ where, relations: { skills: true } });
  }

  // Same rule for reading ONE cv: without it, a user could open somebody
  // else's cv just by guessing its id in the URL.
  async findOneFor(id: number, user: JwtUser): Promise<Cv> {
    const cv = await this.findOne(id);
    if (user.role !== 'admin' && cv.userId !== user.userId) {
      throw new ForbiddenException('You can only view your own cvs');
    }
    return cv;
  }

  // The rule for edit/delete: allowed if admin OR owner.
  //   404 -> the cv doesn't exist (thrown by findOne)
  //   403 -> it exists but it's not yours.
  // Design choice (not in the slides): admins may also modify/delete any cv.
  // If the professor wants STRICT owner-only editing, remove the
  // `user.role !== 'admin' &&` part.
  private async assertCanModify(id: number, user: JwtUser) {
    const cv = await this.findOne(id);
    if (user.role !== 'admin' && cv.userId !== user.userId) {
      throw new ForbiddenException('You can only modify your own cvs');
    }
  }

  // Check permission, THEN reuse the inherited/overridden update/remove:
  // the ownership rule is written once, the update logic is not duplicated.
  async updateOwned(id: number, dto: UpdateCvDto, user: JwtUser) {
    await this.assertCanModify(id, user);
    return this.update(id, dto);
  }

    async removeOwned(id: number, user: JwtUser) {
    await this.assertCanModify(id, user);
    return this.remove(id);
  }


}
