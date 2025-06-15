import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoteCollection, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateNoteCollectionDto } from './dto/create-note-collection.dto';
import { UpdateNoteCollectionDto } from './dto/update-note-collection.dto';

@Injectable()
export class NoteCollectionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createNoteCollectionDto: CreateNoteCollectionDto,
  ): Promise<NoteCollection> {
    const { noteIds, ...data } = createNoteCollectionDto;

    return this.prisma.$transaction(async (tx) => {
      const collection = await tx.noteCollection.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
        },
        include: { notes: true },
      });

      if (noteIds && noteIds.length > 0) {
        const notes = await tx.note.findMany({
          where: {
            id: { in: noteIds },
            userId,
          },
        });

        if (notes.length !== noteIds.length) {
          throw new BadRequestException(
            'One or more notes not found or do not belong to you',
          );
        }

        await tx.note.updateMany({
          where: {
            id: { in: noteIds },
            userId,
          },
          data: {
            noteCollectionId: collection.id,
          },
        });

        const updatedCollection = await tx.noteCollection.findUnique({
          where: { id: collection.id },
          include: { notes: true },
        });

        if (!updatedCollection) {
          throw new NotFoundException(
            `Note collection with ID ${collection.id} not found`,
          );
        }

        return updatedCollection;
      }

      return collection;
    });
  }

  async findAll(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      where?: Prisma.NoteCollectionWhereInput;
      orderBy?: Prisma.NoteCollectionOrderByWithRelationInput;
    },
  ): Promise<NoteCollection[]> {
    const { skip, take, where, orderBy } = params || {};

    return this.prisma.noteCollection.findMany({
      skip,
      take,
      where: {
        ...where,
        userId,
      },
      orderBy: orderBy || { title: 'asc' },
      include: { notes: true },
    });
  }

  async findOne(id: string, userId: string): Promise<NoteCollection> {
    const collection = await this.prisma.noteCollection.findFirst({
      where: { id, userId },
      include: { notes: true },
    });

    if (!collection) {
      throw new NotFoundException(`Note collection with ID ${id} not found`);
    }

    return collection;
  }

  async update(
    id: string,
    userId: string,
    updateNoteCollectionDto: UpdateNoteCollectionDto,
  ): Promise<NoteCollection> {
    await this.findOne(id, userId);

    const { noteIds, ...data } = updateNoteCollectionDto;

    return this.prisma.$transaction(async (tx) => {
      await tx.noteCollection.update({
        where: { id },
        data,
      });

      if (noteIds !== undefined) {
        await tx.note.updateMany({
          where: { noteCollectionId: id, userId },
          data: { noteCollectionId: null },
        });

        if (noteIds.length > 0) {
          const notes = await tx.note.findMany({
            where: {
              id: { in: noteIds },
              userId,
            },
          });

          if (notes.length !== noteIds.length) {
            throw new BadRequestException(
              'One or more notes not found or do not belong to you',
            );
          }

          await tx.note.updateMany({
            where: {
              id: { in: noteIds },
              userId,
            },
            data: {
              noteCollectionId: id,
            },
          });
        }
      }

      const updatedCollection = await tx.noteCollection.findUnique({
        where: { id },
        include: { notes: true },
      });

      if (!updatedCollection) {
        throw new NotFoundException(`Note collection with ID ${id} not found`);
      }

      return updatedCollection;
    });
  }

  async remove(id: string, userId: string): Promise<NoteCollection> {
    return this.prisma.$transaction(async (tx) => {
      await tx.note.updateMany({
        where: { noteCollectionId: id, userId },
        data: { noteCollectionId: null },
      });

      return tx.noteCollection.delete({
        where: { id },
        include: { notes: true },
      });
    });
  }
}
