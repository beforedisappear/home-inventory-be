import { ContainerRuleDocument } from '../schemas/container-rule.schema';
import { ContainerRuleResponseDto } from '../dto/container-rule-response.dto';

export class ContainerRuleMapper {
  static toResponseDto(doc: ContainerRuleDocument): ContainerRuleResponseDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      // Mongoose subdoc-array — копируем чистыми объектами, без internal-полей
      kindRules: doc.kindRules.map((kr) => ({
        kind: kr.kind,
        canBeInsideRoot: kr.canBeInsideRoot,
        allowedParents: [...kr.allowedParents],
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
