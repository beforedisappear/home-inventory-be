import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import {
  CUSTOM_FIELD_KEY_MAX,
  CUSTOM_FIELD_STRING_MAX,
} from '../constants/custom-field';
import {
  CUSTOM_FIELD_TYPES,
  type CustomFieldType,
  type CustomFieldValue,
} from '../interfaces/custom-field.types';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// строгий парсер ISO-даты: отбивает невалидные календарные даты типа 2026-06-31
function isValidIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !ISO_DATE_RE.test(v)) return false;

  const d = new Date(`${v}T00:00:00.000Z`);

  if (Number.isNaN(d.getTime())) return false;

  return d.toISOString().slice(0, 10) === v;
}

function describeValueError(
  type: CustomFieldType,
  value: unknown,
): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') return 'value must be a string';
      if (value.length > CUSTOM_FIELD_STRING_MAX)
        return `value must be at most ${CUSTOM_FIELD_STRING_MAX} characters`;
      return null;

    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value))
        return 'value must be a finite number';
      return null;

    case 'boolean':
      if (typeof value !== 'boolean') return 'value must be a boolean';
      return null;

    case 'date':
      if (!isValidIsoDate(value))
        return 'value must be a valid calendar date in YYYY-MM-DD format';
      return null;
  }
}

export function IsCustomFieldValue(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object, propertyName) {
    registerDecorator({
      name: 'isCustomFieldValue',
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const field = args.object as CustomFieldDto;

          if (!CUSTOM_FIELD_TYPES.includes(field.type)) return false;

          return describeValueError(field.type, value) === null;
        },
        defaultMessage(args: ValidationArguments) {
          const field = args.object as CustomFieldDto;

          if (!CUSTOM_FIELD_TYPES.includes(field.type)) return 'invalid type';

          return describeValueError(field.type, field.value) ?? 'invalid value';
        },
      },
    });
  };
}

export class CustomFieldDto {
  @IsString()
  @MinLength(1)
  @MaxLength(CUSTOM_FIELD_KEY_MAX)
  key: string;

  @IsIn(CUSTOM_FIELD_TYPES)
  type: CustomFieldType;

  // тип value зависит от type — валидация в IsCustomFieldValue
  @IsCustomFieldValue()
  value: CustomFieldValue;
}
