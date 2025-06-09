import { registerAs } from '@nestjs/config';
import { plainToClass, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  validateSync,
  ValidationError,
} from 'class-validator';

class AuthConfig {
  @IsString()
  @IsNotEmpty()
  jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value || '3h')
  jwtExpiresIn: string;

  @Transform(({ value }: { value: string }) => parseInt(value) || 10)
  bcryptRounds: number;
}

export default registerAs('auth', (): AuthConfig => {
  const config = plainToClass(AuthConfig, {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    bcryptRounds: process.env.BCRYPT_ROUNDS,
  });

  const errors = validateSync(config);
  if (errors.length > 0) {
    const errorMessages = errors
      .map((error: ValidationError) =>
        Object.values(error.constraints || {}).join(', '),
      )
      .join('; ');
    throw new Error(`Auth configuration validation failed: ${errorMessages}`);
  }

  return config;
});
