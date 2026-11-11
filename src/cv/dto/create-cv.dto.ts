import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateCvDto {
    @IsString() @IsNotEmpty()
    name!: string;

    @IsString() @IsNotEmpty()
    firstname!: string;

    @IsInt() @Min(15) @Max(100)//ye5i les limitations hethom fl enonce?
    age!: number;

    @IsString() @Length(8, 8)
    cin!: string;

    @IsString() @IsNotEmpty()
    job!: string;

    //expres enou optional 9bal string?
    @IsOptional() @IsString()
    path?: string;
}
