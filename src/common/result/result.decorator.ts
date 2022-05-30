import {
  addFieldMetadata,
  FieldOptions,
  ReturnTypeFunc,
} from '@nestjs/graphql';

export function ResField(typeOrOptions: ReturnTypeFunc | FieldOptions) {
  return (
    prototype: object,
    propertyKey?: string,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    addFieldMetadata(
      typeOrOptions,
      { nullable: true },
      prototype,
      propertyKey,
      descriptor,
    );
  };
}
