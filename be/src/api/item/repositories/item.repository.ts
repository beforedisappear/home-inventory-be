import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilterQuery, Model } from 'mongoose';

import { escapeRegex } from '@/shared/utils/escape-regex';

import { CreateItemData, UpdateItemData } from '../interfaces';
import { ItemFiltersData } from '../interfaces/item-filters-data.interface';
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

  findAll(ownerId: string, filters: ItemFiltersData) {
    return this.model
      .find(this.buildQuery(ownerId, filters))
      .sort({ createdAt: -1 })
      .exec();
  }

  countByFilters(ownerId: string, filters: ItemFiltersData) {
    return this.model.countDocuments(this.buildQuery(ownerId, filters)).exec();
  }

  private buildQuery(
    ownerId: string,
    filters: ItemFiltersData,
  ): FilterQuery<ItemDocument> {
    const query: FilterQuery<ItemDocument> = { ownerId };

    if (filters.containerId) query.containerId = filters.containerId;
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.q) {
      const rx = new RegExp(escapeRegex(filters.q), 'i');
      query.$or = [{ name: rx }, { description: rx }];
    }

    return query;
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

  unsetCategoryFromAll(categoryId: string) {
    return this.model
      .updateMany({ categoryId }, { $set: { categoryId: null } })
      .exec();
  }

  setQrPending(id: string) {
    return this.model
      .findOneAndUpdate(
        { _id: id, qrStatus: { $ne: 'pending' } },
        { $set: { qrStatus: 'pending' } },
        { new: true },
      )
      .exec();
  }

  setQrReady(id: string, key: string) {
    return this.model
      .updateOne({ _id: id }, { $set: { qrStatus: 'ready', qrKey: key } })
      .exec();
  }

  setQrFailed(id: string) {
    return this.model
      .updateOne({ _id: id }, { $set: { qrStatus: 'failed' } })
      .exec();
  }
}
