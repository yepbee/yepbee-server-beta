import { registerEnumType } from '@nestjs/graphql';

export enum UserState {
  None = 'None', // default state
  BuyingBasket = 'BuyingBasket',
  MoveMode = 'MoveMode',
  ExploreMode = 'ExploreMode',
  ValidatingHoneycon = 'ValidatingHoneycon',
  // ------- Minting -------
  UploadingPhotoToArweave = 'UploadingPhotoToArweave',
  UploadingMetadataToArweave = 'UploadingMetadataToArweave',
  MintingBanner = 'MintingBanner',
  RecordingTransaction = 'RecordingTransaction',
}

registerEnumType(UserState, { name: 'UserState' });
