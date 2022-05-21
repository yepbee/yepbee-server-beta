import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';
import { isWalletPublicKey } from '@retrip/js';
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
            eachPrefix + '$property must be valid Solana Public key',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
