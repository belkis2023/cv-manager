// =====================================================================
// create-cv.dto.ts - body of POST /cv
// =====================================================================
// Each decorator is a validation rule. Stacked decorators must ALL pass.
// There is deliberately NO `userId` field: the owner is taken from the
// login token, never from the body (otherwise anyone could create cvs in
// somebody else's name; with whitelist: true a `userId` sent by a client is
// dropped. I tested it: sending userId:1 still created the cv for the caller).

import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min, IsArray } from 'class-validator';

export class CreateCvDto {
    @IsString() @IsNotEmpty()
    name!: string;

    @IsString() @IsNotEmpty()
    firstname!: string;

    // Answer to "ye5i les limitations hethom fl enonce?" (are these limits in
    // the assignment?): NO. The slides only give the field names. The bounds
    // 15..100 are a reasonable choice made while building the project, not a
    // requirement; be ready to say "I added basic validation rules".
    // @IsInt = whole number (so "abc" and 22.5 are rejected).
    @IsInt() @Min(15) @Max(100)//ye5i les limitations hethom fl enonce?
    age!: number;

    // @Length(8, 8) = min 8, max 8 characters. It matches the 8-character
    // column length in the entity. Limit: it accepts ANY 8 characters, letters
    // included; a stricter rule for digits would be @Matches(/^\d{8}$/).
    @IsString() @Length(8, 8)
    cin!: string;

    @IsString() @IsNotEmpty()
    job!: string;

    //expres enou optional 9bal string?  -> "is it on purpose that @IsOptional comes before @IsString?"
    // Answer: the ORDER of class-validator decorators doesn't change the result.
    // @IsOptional() means "if the field is missing (undefined/null), skip all
    // the other rules for it; if it is present, apply them". We just write it
    // first because it reads naturally: "optional, but if present, a string".
    @IsOptional() @IsString()
    path?: string;

    // The client sends the ids of existing skills, e.g. "skillIds": [1, 2].
    // CvService turns those ids into Skill entities. We don't accept whole
    // Skill objects: ids are simpler and safer.
    // `{ each: true }` applies @IsInt to EVERY element of the array.
    @IsOptional() @IsArray() @IsInt({ each: true })
    skillIds?: number[];
}
