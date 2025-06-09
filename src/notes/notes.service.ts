import { Injectable, NotFoundException } from '@nestjs/common';
import { Note, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Note> {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    if (createNoteDto.noteCollectionId) {
      await this.validateNoteCollectionOwnership(
        createNoteDto.noteCollectionId,
        userId,
      );
    }

    return this.prisma.note.create({
      data: {
        ...createNoteDto,
        user: {
          connect: { id: userId },
        },
      } as Prisma.NoteCreateInput,
    });
  }

  async update(
    id: string,
    userId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    await this.findByIdAndUserId(id, userId);

    if (updateNoteDto.noteCollectionId) {
      await this.validateNoteCollectionOwnership(
        updateNoteDto.noteCollectionId,
        userId,
      );
    }

    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto as Prisma.NoteUpdateInput,
    });
  }

  async remove(id: string, userId: string): Promise<Note> {
    await this.findByIdAndUserId(id, userId);

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
      throw new NotFoundException(
        `Note collection with ID ${noteCollectionId} not found`,
      );
    }
  }
}
