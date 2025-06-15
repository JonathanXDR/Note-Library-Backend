import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Note, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const { noteCollectionId, ...data } = createNoteDto;

    if (noteCollectionId) {
      await this.validateNoteCollectionOwnership(noteCollectionId, userId);
    }

    return this.prisma.note.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
        ...(noteCollectionId && {
          NoteCollection: {
            connect: { id: noteCollectionId },
          },
        }),
      },
    });
  }

  async findAll(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      where?: Prisma.NoteWhereInput;
      orderBy?: Prisma.NoteOrderByWithRelationInput;
    },
  ): Promise<Note[]> {
    const { skip, take, where, orderBy } = params || {};

    return this.prisma.note.findMany({
      skip,
      take,
      where: {
        ...where,
        userId,
      },
      orderBy: orderBy || { id: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async update(
    id: string,
    userId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    await this.findOne(id, userId);

    const { noteCollectionId, ...data } = updateNoteDto;

    if (noteCollectionId !== undefined) {
      if (noteCollectionId) {
        await this.validateNoteCollectionOwnership(noteCollectionId, userId);
      }
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        ...data,
        ...(noteCollectionId !== undefined && {
          noteCollectionId,
        }),
      },
    });
  }

  async remove(id: string, userId: string): Promise<Note> {
    await this.findOne(id, userId);

    return this.prisma.note.delete({
      where: { id },
    });
  }

  private async validateNoteCollectionOwnership(
    noteCollectionId: string,
    userId: string,
  ): Promise<void> {
    const noteCollection = await this.prisma.noteCollection.findFirst({
      where: { id: noteCollectionId, userId },
    });

    if (!noteCollection) {
      throw new ForbiddenException(
        'Note collection not found or you do not have permission to access it',
      );
    }
  }
}
