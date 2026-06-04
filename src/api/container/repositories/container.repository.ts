import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Container, ContainerDocument } from '../schemas/container.schema';
import { CreateContainerDto } from '../dto/create-container.dto';
import { UpdateContainerDto } from '../dto/update-container.dto';

@Injectable()
export class ContainerRepository {
  constructor(
    @InjectModel(Container.name)
    private readonly containerModel: Model<ContainerDocument>,
  ) {}

  findById(id: string) {
    return this.containerModel.findById(id).exec();
  }

  findByOwner(ownerId: string) {
    return this.containerModel.find({ owner: ownerId }).exec();
  }

  findChildrenByOwner(ownerId: string, parentId: string | null) {
    return this.containerModel
      .find({ owner: ownerId, parent: parentId })
      .exec();
  }

  countChildren(parentId: string) {
    return this.containerModel.countDocuments({ parent: parentId }).exec();
  }

  /**
   *  Все id поддерева включая сам root — через один $graphLookup.
   *  Для bulk-операций (cascade rule update, cascade delete).
   */
  async findSubtreeIds(rootId: string): Promise<string[]> {
    const [result] = await this.containerModel.aggregate<{
      ids: Types.ObjectId[];
    }>([
      // находим рутовый узел по id
      { $match: { _id: new Types.ObjectId(rootId) } },
      {
        // рекурсивно обходим дерево вниз
        $graphLookup: {
          from: this.containerModel.collection.name,
          startWith: '$_id', // начинаем с _id текущего документа
          connectFromField: '_id', // берём _id каждого найденного документа
          connectToField: 'parent', //  ищем документы где parent === этому _id
          as: 'descendants', //  результат кладём в массив descendants
        },
      },
      //собираем все id в один массив:
      { $project: { ids: { $concatArrays: [['$_id'], '$descendants._id'] } } },
    ]);

    return (result || []).ids.map((id) => id.toString());
  }

  create(owner: string, dto: CreateContainerDto) {
    return this.containerModel.create({
      owner,
      name: dto.name,
      kind: dto.kind ?? null,
      parent: dto.parentId ?? null,
      rule: dto.ruleId ?? null,
    });
  }

  update(id: string, dto: UpdateContainerDto) {
    return this.containerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  updateParent(id: string, parent: string) {
    return this.containerModel
      .findByIdAndUpdate(id, { parent }, { new: true })
      .exec();
  }

  setRuleOnIds(ids: string[], rule: string | null) {
    return this.containerModel
      .updateMany({ _id: { $in: ids } }, { rule })
      .exec();
  }

  delete(id: string) {
    return this.containerModel.findByIdAndDelete(id).exec();
  }
}
