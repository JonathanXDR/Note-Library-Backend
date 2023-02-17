import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BookRequest {
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  releaseYear: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  author: string;
}
