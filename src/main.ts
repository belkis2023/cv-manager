// =====================================================================
// main.ts - THE ENTRY POINT OF THE APPLICATION
// =====================================================================
// This is the first file that runs when you do `npm run start:dev`.
// Its only job is to build the Nest application and make it listen on a port.
// (The seed script does NOT use this file: it has its own entry point.)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // NestFactory.create() builds the whole application starting from the ROOT
  // module (AppModule). Nest reads every @Module(), creates every provider
  // (services, repositories...) and wires them together (dependency injection).
  // Result: a web server (Express under the hood) that is ready to listen.
  const app = await NestFactory.create(AppModule);

  // Answer to "the fuck?": this line turns on automatic validation of ALL
  // incoming request bodies, for the whole app ("global pipe").
  //
  // A PIPE is a class that runs BEFORE the controller method and can
  // validate or transform its input. ValidationPipe reads the decorators of
  // our DTO classes (@IsString(), @IsEmail(), @Min()...) and rejects the
  // request with HTTP 400 if the body does not respect them.
  //
  //  - whitelist: true  -> any property that has NO decorator in the DTO is
  //    silently removed from the body. Example: if a client adds an extra
  //    field such as {"isAdmin": true} to POST /user, it is not in
  //    CreateUserDto, so it is deleted before reaching our code.
  //  - transform: true  -> the plain JSON body is converted into an actual
  //    instance of the DTO class (and basic types are converted).
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Start the HTTP server. The port comes from the PORT environment variable
  // if it exists, otherwise 3000. `??` means "use the right side only if the
  // left side is null or undefined".
  await app.listen(process.env.PORT ?? 3000);
}

// `void` = "I know this returns a Promise and I deliberately don't await it".
// It also keeps the linter quiet about a floating promise.
void bootstrap();
