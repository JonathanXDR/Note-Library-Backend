import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoteCollection, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
      // Create the collection
      const collection = await tx.noteCollection.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
        },
        include: { notes: true },
      });

      // If noteIds are provided, update those notes to belong to this collection
      if (noteIds && noteIds.length > 0) {
        // Verify all notes belong to the user
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

        // Update notes to belong to this collection
        await tx.note.updateMany({
          where: {
            id: { in: noteIds },
            userId,
          },
          data: {
            noteCollectionId: collection.id,
          },
        });

        // Return collection with updated notes
        return tx.noteCollection.findUnique({
          where: { id: collection.id },
          include: { notes: true },
        });
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
    await this.findOne(id, userId); // Check if collection exists and belongs to user

    const { noteIds, ...data } = updateNoteCollectionDto;

    return this.prisma.$transaction(async (tx) => {
      // Update collection data
      await tx.noteCollection.update({
        where: { id },
        data,
      });

      // Handle note associations if noteIds is provided
      if (noteIds !== undefined) {
        // Remove all notes from this collection
        await tx.note.updateMany({
          where: { noteCollectionId: id, userId },
          data: { noteCollectionId: null },
        });

        // Add specified notes to this collection
        if (noteIds.length > 0) {
          // Verify all notes belong to the user
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

      // Return updated collection with notes
      return tx.noteCollection.findUnique({
        where: { id },
        include: { notes: true },
      });
    });
  }

  async remove(id: string, userId: string): Promise<NoteCollection> {
    const collection = await this.findOne(id, userId); // Check if collection exists and belongs to user

    return this.prisma.$transaction(async (tx) => {
      // Remove association from all notes in this collection
      await tx.note.updateMany({
        where: { noteCollectionId: id, userId },
        data: { noteCollectionId: null },
      });

      // Delete the collection
      return tx.noteCollection.delete({
        where: { id },
        include: { notes: true },
      });
    });
  }
}
