// =====================================================================
// user.controller.ts - HTTP routes for User (ADMIN ONLY)
// =====================================================================
// Managing accounts must never be open to ordinary users, so the guards are
// put on the WHOLE class: they apply to every route below.

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @UseGuards(A, B): guards run LEFT TO RIGHT and the request must pass all.
//   1. JwtAuthGuard: checks the Bearer token and puts the user in req.user
//      (no/invalid token -> 401).
//   2. AdminGuard: reads req.user.role, so it MUST come after the first one
//      (not admin -> 403).
// If the order were reversed, req.user would still be empty when AdminGuard runs.
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // WARNING (see the review): these routes store passwords as given (no
  // hashing), and GET returns the whole row INCLUDING the password hash.
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
