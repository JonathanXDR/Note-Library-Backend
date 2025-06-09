import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'generated/prisma';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import authConfig from './config/auth.config';
import { AuthResponseDto } from './dto/auth-response.dto';

interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByUsername(username);

      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }

      return null;
    } catch {
      return null;
    }
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.authConfiguration.bcryptRounds,
    );

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.generateAuthResponse(user);
  }

  login(user: User): AuthResponseDto {
    return this.generateAuthResponse(user);
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    try {
      const user = await this.usersService.findById(payload.sub);
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return new AuthResponseDto({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.parseExpirationTime(this.authConfiguration.jwtExpiresIn),
      user: new UserEntity(user),
    });
  }

  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const [, value, unit] = match;
    const num = parseInt(value);

    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 3600;
      case 'd':
        return num * 86400;
      default:
        return 3600;
    }
  }
}
