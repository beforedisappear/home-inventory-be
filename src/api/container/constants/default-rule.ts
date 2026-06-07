import type { KindRule } from '../schemas/kind-rule.schema';

/** Имя базового системного правила, которое сидится в БД */
export const DEFAULT_RULE_NAME = 'Стандарт';

/**
 *  Строгая каскадная иерархия по умолчанию:
 *
 *  room (только root)
 *    └ cabinet (только в room)
 *       └ drawer (только в cabinet — это "секция мебели": ящик/полка/отделение)
 *           ├ box (в drawer или в другой box)
 *           └ bag (в drawer, box или в другой bag)
 *
 *  Если юзеру нужна свобода — создаёт своё кастомное правило.
 */
export function buildDefaultKindRules(): KindRule[] {
  return [
    // комната — только верхний уровень
    { kind: 'room', canBeInsideRoot: true, allowedParents: [] },

    // шкаф — только в комнате
    { kind: 'cabinet', canBeInsideRoot: false, allowedParents: ['room'] },

    // секция мебели — только в шкафу
    { kind: 'drawer', canBeInsideRoot: false, allowedParents: ['cabinet'] },

    // коробка — в секции мебели или в другой коробке (matryoshka)
    {
      kind: 'box',
      canBeInsideRoot: false,
      allowedParents: ['drawer', 'box'],
    },

    // сумка — туда же где коробка, плюс в другой сумке
    {
      kind: 'bag',
      canBeInsideRoot: false,
      allowedParents: ['drawer', 'box', 'bag'],
    },
  ];
}
