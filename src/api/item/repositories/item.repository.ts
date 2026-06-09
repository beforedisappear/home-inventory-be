import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateItemData, UpdateItemData } from '../interfaces';
import { Item, ItemDocument } from '../schemas/item.schema';

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

  create(data: CreateItemData) {
    return this.model.create(data);
  }

  update(id: string, data: UpdateItemData) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  updatePhotoSize(photoKey: string, size: number) {
    return this.model
      .updateOne(
        { 'photos.key': photoKey },
        { $set: { 'photos.$.size': size } },
      )
      .exec();
  }
}
