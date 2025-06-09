import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  username: string;

  @ApiProperty({ example: 'securePassword123', minLength: 6, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Doe', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ example: 'John', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 25, minimum: 1, maximum: 150, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(150)
  age?: number;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender?: string;
}
