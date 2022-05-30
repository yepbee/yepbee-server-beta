import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';
import { isWalletPublicKey } from '@retrip/js';
import { h3GetResolution } from 'h3-js';

export function IsWalletPublicKey(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isCID',
      validator: {
        validate: (value): boolean => isWalletPublicKey(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must be valid solana public key',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function IsH3Index(
  resolution: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isH3Index',
      validator: {
        validate: (value): boolean => h3GetResolution(value) === resolution,
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be valid h3 index',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
