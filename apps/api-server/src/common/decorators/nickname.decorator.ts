import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidNickname(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidNickname',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Nickname cannot contain special characters or spaces.',
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/? ]/;
          return !specialCharRegex.test(value);
        },
      },
    });
  };
}
