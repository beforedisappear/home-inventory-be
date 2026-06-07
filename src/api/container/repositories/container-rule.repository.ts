import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ContainerRule,
  ContainerRuleDocument,
} from '../schemas/container-rule.schema';
import { KindRule } from '../schemas/kind-rule.schema';

export interface CreateContainerRuleData {
  ownerId: string;
  name: string;
  kindRules: KindRule[];
}

@Injectable()
export class ContainerRuleRepository {
  constructor(
    @InjectModel(ContainerRule.name)
    private readonly model: Model<ContainerRuleDocument>,
  ) {}

  findByIdAndOwner(id: string, ownerId: string) {
    return this.model.findOne({ _id: id, ownerId }).exec();
  }

  findByOwner(ownerId: string) {
    return this.model.find({ ownerId }).exec();
  }

  create(data: CreateContainerRuleData) {
    return this.model.create(data);
  }

  upsert(data: CreateContainerRuleData) {
    return this.model
      .findOneAndUpdate(
        { ownerId: data.ownerId, name: data.name },
        { $setOnInsert: data },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }
}
