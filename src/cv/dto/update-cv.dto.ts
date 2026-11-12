// =====================================================================
// update-cv.dto.ts - body of PATCH /cv/:id
// =====================================================================
import { PartialType } from '@nestjs/mapped-types';
import { CreateCvDto } from './create-cv.dto';

// Answer to "wtf do these do?":
// PartialType(CreateCvDto) generates a copy of CreateCvDto where EVERY field
// is optional but keeps its validation rules. So PATCH /cv/1 with only
// {"job":"Senior"} is valid, while {"age":"abc"} is still rejected (400).
// `extends` makes UpdateCvDto a real class (so ValidationPipe can use it).
// This saves us from writing the same rules a second time.
export class UpdateCvDto extends PartialType(CreateCvDto) {}

//wtf do these do?