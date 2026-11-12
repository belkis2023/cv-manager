// =====================================================================
// update-user.dto.ts - body of PATCH /user/:id
// =====================================================================
// Same pattern as the others: every field of CreateUserDto, all optional,
// same validation rules (see update-skill.dto.ts for the explanation).

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
