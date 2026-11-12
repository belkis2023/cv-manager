// =====================================================================
// cv.controller.ts - HTTP routes for Cv  (master branch: no protection)
// =====================================================================
// The controller reads the request and delegates to CvService. On master
// there is no authentication, so every route is open and no cv has an owner
// (the `auth` branch adds guards, the owner and the admin/user rules).

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

// All routes here start with /cv.
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  // POST /cv : the body is validated against CreateCvDto before this runs.
  @Post()
  create(@Body() dto: CreateCvDto) {
    return this.cvService.create(dto);
  }

  // GET /cv : all cvs, with their skills (CvService.findAll).
  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  // GET /cv/5. ParseIntPipe turns "5" into a number (400 for /cv/abc);
  // 404 if there is no cv with that id (thrown by CrudService.findOne).
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.findOne(id);
  }

  // PATCH /cv/5 : partial update, validated against UpdateCvDto.
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCvDto) {
    return this.cvService.update(id, dto);
  }

  // DELETE /cv/5 : soft delete.
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.remove(id);
  }
}
