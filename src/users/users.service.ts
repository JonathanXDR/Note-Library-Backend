import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        role: true,
        password: false,
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        role: true,
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException(
        `Username ${createUserDto.username} already exists`,
      );
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        role: 'user',
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        role: true,
        password: false,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        role: true,
        password: false,
      },
    });

    return user;
  }

  async remove(id: string): Promise<User> {
    await this.findById(id);

    const user = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        age: true,
        gender: true,
        role: true,
        password: false,
      },
    });

    return user;
  }
}
