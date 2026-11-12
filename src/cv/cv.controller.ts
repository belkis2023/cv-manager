import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/types/request-with-user';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCvDto, @Req() req: RequestWithUser) {
    return this.cvService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.cvService.findAllFor(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.cvService.findOneFor(id, req.user);
  }



  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
    @Req() req: RequestWithUser,
  ) {

    //return this.cvService.updateOwned(id, dto, req.user.userId);
    //we now pass the whole suer not just id
    return this.cvService.updateOwned(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    //return this.cvService.removeOwned(id, req.user.userId);
    return this.cvService.removeOwned(id, req.user);
  }
  
}
