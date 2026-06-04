import { ContainerDocument } from '../schemas/container.schema';
import { ContainerResponseDto } from '../dto/container-response.dto';

export class ContainerMapper {
  static toResponseDto(с: ContainerDocument): ContainerResponseDto {
    return {
      id: с._id.toString(),
      name: с.name,
      kind: с.kind,
      parent: с.parent?.toString() ?? null,
      rule: с.rule?.toString() ?? null,
      createdAt: с.createdAt,
      updatedAt: с.updatedAt,
    };
  }
}
