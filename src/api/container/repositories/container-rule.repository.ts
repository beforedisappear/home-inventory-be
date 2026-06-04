import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ContainerRule,
  ContainerRuleDocument,
} from '../schemas/container-rule.schema';
import { KindRule } from '../schemas/kind-rule.schema';

export interface CreateContainerRuleData {
  owner: string;
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
    return this.model.findOne({ _id: id, owner: ownerId }).exec();
  }

  findByOwner(ownerId: string) {
    return this.model.find({ owner: ownerId }).exec();
  }

  create(data: CreateContainerRuleData) {
    return this.model.create(data);
  }

  upsert(data: CreateContainerRuleData) {
    return this.model
      .findOneAndUpdate(
        { owner: data.owner, name: data.name },
        { $setOnInsert: data },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }
}
