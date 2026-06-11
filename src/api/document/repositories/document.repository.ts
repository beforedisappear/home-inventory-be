import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilterQuery, Model } from 'mongoose';

import {
  CreateDocumentData,
  DocumentFiltersData,
  UpdateDocumentData,
} from '../interfaces';
import { DocumentDocument, DocumentEntity } from '../schemas/document.schema';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectModel(DocumentEntity.name)
    private readonly model: Model<DocumentDocument>,
  ) {}

  findAll(ownerId: string, filters: DocumentFiltersData) {
    const query: FilterQuery<DocumentDocument> = { ownerId };

    if (filters.itemId) query.itemId = filters.itemId;
    if (filters.type) query.type = filters.type;

    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  findByIdAndOwner(id: string, ownerId: string) {
    return this.model.findOne({ _id: id, ownerId }).exec();
  }

  findAllByItem(itemId: string) {
    return this.model.find({ itemId }).exec();
  }

  create(data: CreateDocumentData) {
    return this.model.create(data);
  }

  update(id: string, data: UpdateDocumentData) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  deleteByItem(itemId: string) {
    return this.model.deleteMany({ itemId }).exec();
  }
}
