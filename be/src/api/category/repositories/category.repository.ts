import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateCategoryData, UpdateCategoryData } from '../interfaces';
import { Category, CategoryDocument } from '../schemas/category.schema';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly model: Model<CategoryDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ name: 1 }).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  findByName(name: string) {
    return this.model.findOne({ name }).exec();
  }

  create(data: CreateCategoryData) {
    return this.model.create(data);
  }

  update(id: string, data: UpdateCategoryData) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  upsertByName(data: CreateCategoryData) {
    return this.model
      .findOneAndUpdate(
        { name: data.name },
        { $setOnInsert: data },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }
}
