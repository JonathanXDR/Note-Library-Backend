import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteCollection } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateNoteCollectionDto } from './dto/create-note-collection.dto';
import { UpdateNoteCollectionDto } from './dto/update-note-collection.dto';

@Injectable()
export class NoteCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: string): Promise<NoteCollection[]> {
    return this.prisma.noteCollection.findMany({
      where: { userId },
      include: { notes: true },
      orderBy: { title: 'asc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<NoteCollection> {
    const collection = await this.prisma.noteCollection.findFirst({
      where: { id, userId },
      include: { notes: true },
    });

    if (!collection) {
      throw new NotFoundException(`Note collection with ID ${id} not found`);
    }

    return collection;
  }

  async create(
    userId: string,
    createNoteCollectionDto: CreateNoteCollectionDto,
  ): Promise<NoteCollection> {
    const { noteIds, ...collectionData } = createNoteCollectionDto;

    if (noteIds?.length) {
      await this.validateNotesOwnership(noteIds, userId);
    }

    return this.prisma.$transaction(async (tx) => {
      const collection = await tx.noteCollection.create({
        data: {
          ...collectionData,
          userId,
        },
        include: { notes: true },
      });

      if (noteIds?.length) {
        await tx.note.updateMany({
          where: { id: { in: noteIds }, userId },
          data: { noteCollectionId: collection.id },
        });

        return tx.noteCollection.findUnique({
          where: { id: collection.id },
          include: { notes: true },
        });
      }

      return collection;
    });
  }

  async update(
    id: string,
    userId: string,
    updateNoteCollectionDto: UpdateNoteCollectionDto,
  ): Promise<NoteCollection> {
    await this.findByIdAndUserId(id, userId);

    const { noteIds, ...collectionData } = updateNoteCollectionDto;

    if (noteIds?.length) {
      await this.validateNotesOwnership(noteIds, userId);
    }

    return this.prisma.$transaction(async (tx) => {
      const collection = await tx.noteCollection.update({
        where: { id },
        data: collectionData,
      });

      if (noteIds !== undefined) {
        await tx.note.updateMany({
          where: { noteCollectionId: id, userId },
          data: { noteCollectionId: null },
        });

        if (noteIds.length > 0) {
          await tx.note.updateMany({
            where: { id: { in: noteIds }, userId },
            data: { noteCollectionId: id },
          });
        }
      }

      return tx.noteCollection.findUnique({
        where: { id },
        include: { notes: true },
      });
    });
  }

  async remove(id: string, userId: string): Promise<NoteCollection> {
    const collection = await this.findByIdAndUserId(id, userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.note.updateMany({
        where: { noteCollectionId: id, userId },
        data: { noteCollectionId: null },
      });

      await tx.noteCollection.delete({
        where: { id },
      });

      return collection;
    });
  }

  private async validateNotesOwnership(
    noteIds: string[],
    userId: string,
  ): Promise<void> {
    const notes = await this.prisma.note.findMany({
      where: { id: { in: noteIds }, userId },
      select: { id: true },
    });

    if (notes.length !== noteIds.length) {
      throw new NotFoundException('One or more notes not found');
    }
  }
}
