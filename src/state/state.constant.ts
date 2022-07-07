import { registerEnumType } from '@nestjs/graphql';
import { ServiceAdjacencyList, Services } from './state.interface';

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

/**
 * If the state has done, next state should be in the array of states
 */
export const userStateAdjacencyList: ServiceAdjacencyList<UserState> = {
  None: [
    UserState.None,
    UserState.RecordingTransaction,
    UserState.BuyingBasket,
    UserState.MoveMode,
    UserState.ExploreMode,
    UserState.ValidatingHoneycon,
    UserState.UploadingPhotoToArweave,
  ],
  RecordingTransaction: [UserState.None],
  BuyingBasket: [UserState.None],
  MoveMode: [UserState.None, UserState.ExploreMode],
  ExploreMode: [UserState.None, UserState.MoveMode],
  ValidatingHoneycon: [UserState.None],
  // ------- Minting -------
  UploadingPhotoToArweave: [UserState.UploadingMetadataToArweave],
  UploadingMetadataToArweave: [UserState.MintingBanner],
  MintingBanner: [UserState.RecordingTransaction],
};

export const userStateServices: Services<UserState> = {
  None: () => () => undefined,
  RecordingTransaction: () => () => undefined,
  BuyingBasket: () => () => undefined,
  MoveMode: () => () => undefined,
  ExploreMode: () => () => undefined,
  ValidatingHoneycon: () => () => undefined,
  UploadingPhotoToArweave: () => () => undefined,
  UploadingMetadataToArweave: () => () => undefined,
  MintingBanner: () => () => undefined,
};
