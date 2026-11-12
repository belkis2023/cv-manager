// =====================================================================
// skill.controller.ts - HTTP routes for Skill
// =====================================================================
// A CONTROLLER maps URLs to methods. It does no logic: it reads the request
// (params, body) and calls the service.
//
// NOTE (see the review): this controller has NO guards, so anybody, even a
// user who is not logged in, can create, edit and delete skills. Reading is
// fine to be public; the three write routes arguably should require a login.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

// @Controller('skill') = every route here starts with /skill.
@Controller('skill')
export class SkillController {
  // Dependency injection: Nest gives us the SkillService instance.
  // `private readonly` creates the property automatically.
  constructor(private readonly skillService: SkillService) {}

  // POST /skill. @Body() takes the JSON body; because its type is a DTO class,
  // the ValidationPipe checks it BEFORE this method runs.
  @Post()
  create(@Body() dto: CreateSkillDto) {
    return this.skillService.create(dto);
  }

  // GET /skill
  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  // GET /skill/3. ':id' is a route parameter, read with @Param('id').
  // URL parameters always arrive as STRINGS ("3").
  // ParseIntPipe converts it to the number 3, and answers 400 on /skill/abc.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.findOne(id);
    //alech kenet (+id)  ->  "why was it (+id)?"
    // The generated code (nest g resource) wrote `findOne(@Param('id') id: string)`
    // and `this.service.findOne(+id)`. The unary `+` converts the string to a
    // number, but it silently gives NaN for "abc" (a bug, a weird SQL error).
    // ParseIntPipe does the same conversion AND rejects bad input with a clean
    // 400, so it replaced `+id`.
  }

  // PATCH /skill/3 : partial update (PATCH changes some fields, PUT replaces everything).
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSkillDto) {
    return this.skillService.update(id, dto);
  }

  // DELETE /skill/3 (a soft delete, see CrudService.remove).
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.remove(id);
  }
}
