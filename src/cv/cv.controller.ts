// =====================================================================
// cv.controller.ts - HTTP routes for Cv
// =====================================================================
// Slide 12 + 14: every Cv route needs a logged-in user. The controller only
// extracts the logged-in user from the request and delegates to the service,
// which applies the "mine / admin" rules.

import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// `import type` because RequestWithUser is an interface (see request-with-user.ts).
import type { RequestWithUser } from '../auth/types/request-with-user';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  // @UseGuards(JwtAuthGuard) on a method: this route needs a valid token.
  // Without one the guard answers 401 and the method never runs.
  // `@Req() req` gives the raw request; after the guard, req.user holds
  // { userId, username, role } (built from the token by JwtStrategy.validate).
  // POST /cv : the owner is req.user.userId, from the signed token and NOT
  // from the body, so it can't be forged.
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCvDto, @Req() req: RequestWithUser) {
    return this.cvService.create(dto, req.user.userId);
  }

  // GET /cv : admin -> all cvs, user -> only his (decided in the service).
  // NB: this route is now PROTECTED. An earlier version allowed anonymous
  // reads, but slide 14 requires knowing who asks.
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.cvService.findAllFor(req.user);
  }

  // GET /cv/5 : 403 if it is someone else's cv (unless admin).
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.cvService.findOneFor(id, req.user);
  }



  // PATCH /cv/5 : only the owner (or an admin). @Param, @Body and @Req can be
  // combined freely in one method.
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
    @Req() req: RequestWithUser,
  ) {

    //return this.cvService.updateOwned(id, dto, req.user.userId);
    //we now pass the whole suer not just id
    // (Old line above: passed only the id. The service now also needs the
    // ROLE to let admins through, so we pass the whole user object.)
    return this.cvService.updateOwned(id, dto, req.user);
  }

  // DELETE /cv/5 : only the owner (or an admin); it's a soft delete.
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    //return this.cvService.removeOwned(id, req.user.userId);
    return this.cvService.removeOwned(id, req.user);
  }

}
