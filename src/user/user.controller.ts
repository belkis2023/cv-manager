// =====================================================================
// user.controller.ts - HTTP routes for User  (master branch: no protection)
// =====================================================================
// A CONTROLLER maps URLs to methods and does no logic: it reads the request
// (params, body) and calls the service. On master there is no authentication
// yet, so these routes are open to everybody (on the `auth` branch the whole
// class gets @UseGuards(JwtAuthGuard, AdminGuard)).

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// All routes here start with /user.
@Controller('user')
export class UserController {
  // Dependency injection: Nest gives us the UserService instance.
  constructor(private readonly userService: UserService) {}

  // POST /user. @Body() takes the JSON body; since its type is a DTO class,
  // the ValidationPipe checks it BEFORE this method runs.
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // GET /user
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // GET /user/3. URL parameters arrive as strings; ParseIntPipe converts
  // "3" to the number 3 and answers 400 for /user/abc.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // PATCH /user/3 : partial update.
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // DELETE /user/3 (a soft delete, see CrudService.remove).
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
