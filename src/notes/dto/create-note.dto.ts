import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    example: 'My Important Note',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiProperty({ example: 'This is the content of my note' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({ example: 'collection-uuid', required: false })
  @IsOptional()
  @IsUUID()
  noteCollectionId?: string;
}
