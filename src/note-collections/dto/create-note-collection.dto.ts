import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateNoteCollectionDto {
  @ApiProperty({ example: 'My Important Collection', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    example: ['note-uuid-1', 'note-uuid-2'],
    description: 'Array of note IDs to include in collection',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  noteIds?: string[];
}
