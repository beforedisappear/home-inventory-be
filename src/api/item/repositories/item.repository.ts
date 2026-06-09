import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Item, ItemDocument } from '../schemas/item.schema';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';

@Injectable()
export class ItemRepository {
  constructor(
    @InjectModel(Item.name)
    private readonly model: Model<ItemDocument>,
  ) {}

  findByIdAndOwner(id: string, ownerId: string) {
    return this.model.findOne({ _id: id, ownerId }).exec();
  }

  findByContainer(ownerId: string, containerId: string) {
    return this.model.find({ ownerId, containerId }).exec();
  }

  async existsByContainer(containerId: string): Promise<boolean> {
    const found = await this.model.exists({ containerId });

    return found !== null;
  }

  create(ownerId: string, dto: CreateItemDto) {
    return this.model.create({
      ownerId,
      containerId: dto.containerId,
      name: dto.name,
      quantity: dto.quantity ?? 1,
      description: dto.description,
    });
  }

  update(id: string, dto: UpdateItemDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
