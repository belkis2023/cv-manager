// =====================================================================
// create-skill.dto.ts - what a client may send to create a Skill
// =====================================================================
// DTO = Data Transfer Object: a class describing the SHAPE of a request body.
// The entity describes the DATABASE; the DTO describes what the CLIENT may send.
// The decorators below are rules checked by the global ValidationPipe
// (see main.ts). Wrong body -> automatic HTTP 400 with the list of problems.

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSkillDto {
    // Must be a string AND not empty ("" is rejected).
    @IsString() @IsNotEmpty()
    designation!: string;
}
