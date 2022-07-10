import { registerEnumType } from '@nestjs/graphql';

// For GraphQL and TypeORM
export enum UserState {
  None = 'None', // default state
  BuyingBasket = 'BuyingBasket',
  MoveMode = 'MoveMode',
  ExploreMode = 'ExploreMode',
  ValidatingHoneycon = 'ValidatingHoneycon',
  UploadingPhotoToArweave = 'UploadingPhotoToArweave',
  UploadingMetadataToArweave = 'UploadingMetadataToArweave',
  MintingBanner = 'MintingBanner',
  RecordingTransaction = 'RecordingTransaction',
}

registerEnumType(UserState, { name: 'UserState' });
