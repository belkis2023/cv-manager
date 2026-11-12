// =====================================================================
// update-skill.dto.ts - body of PATCH /skill/:id
// =====================================================================
// PartialType(CreateSkillDto) builds a NEW class with the same fields and the
// same validation rules, but every field becomes OPTIONAL. That is what a
// PATCH needs ("send only what you want to change"), and we avoid rewriting
// the rules (factorisation again).
// It comes from @nestjs/mapped-types (installed as a dependency).

import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
