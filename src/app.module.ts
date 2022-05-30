import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Cluster } from './common/interfaces';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';
import { Web3Module } from './web3/web3.module';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthModule } from './auth/auth.module';
import { EnvModule as _ } from './env/env.module';
import { RtimeModule } from './rtime/rtime.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthMiddleware } from './auth/auth.middleware';
import { KEY_PUBKEY, KEY_RTIME, KEY_USER, RtimeId } from './common/constants';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Verification } from './users/entities/verification.entity';
import { VerificationModule } from './verification/verification.module';
import { ValidationModule } from './validation/validation.module';
import { ValidProperty } from './users/entities/validProperty.entity';
import { UserTokenAccounts } from './users/entities/userTokenAccounts.entity';
import { InventoryModule } from './inventory/inventory.module';
import { NftBanner } from './validation/entities/nftBanner.entity';
import { BannerTag } from './validation/entities/bannerTag.entity';
import { Transactions } from './users/entities/transactions.entity';

@Module({
  imports: [
    _.forRoot(), // EnvModule
    // ---------------------------
    /* PostgreSQL */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: _.ENVS.DB_HOST,
      port: +_.ENVS.DB_PORT,
      username: _.ENVS.DB_USERNAME,
      password: _.ENVS.DB_PASSWORD,
      database: _.ENVS.DB_NAME,
      synchronize: _.isNotProduction,
      logging: _.isNotProduction,
      autoLoadEntities: true,
      // dropSchema: _.isNotProduction,
    }),
    TypeOrmModule.forFeature([
      Transactions,
      BannerTag,
      NftBanner,
      UserTokenAccounts,
      ValidProperty,
      Verification,
      User,
    ]), // for app.controller
    /* GraphQL */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      context: ({ req }) => ({
        [KEY_PUBKEY]: req[KEY_PUBKEY],
        [KEY_RTIME]: req[KEY_RTIME],
        [KEY_USER]: req[KEY_USER],
      }),
      debug: _.isNotProduction,
      playground: _.isNotProduction,
    }),
    // ---------------------------
    MailModule.forRoot({
      apiKey: _.ENVS.MAILGUN_API_KEY,
      domain: _.ENVS.MAILGUN_DOMAIN_NAME,
      fromEmail: _.ENVS.MAILGUN_FROM_EMAIL,
    }),
    RtimeModule.forRoot({
      length: +_.ENVS.RTIME_LENGTH,
      intervals: {
        [RtimeId.AuthToken]: +_.ENVS.RTIME_AUTHTOKEN_INTERVAL,
        [RtimeId.Walking]: +_.ENVS.RTIME_WALKING_INTERVAL,
      },
      preservedTime: +_.ENVS.RTIME_DATABASE_PRESERVED_TIME,
    }),
    UsersModule.forRoot(),
    AuthModule.forRoot(),
    Web3Module.forRoot({
      secretKey: Uint8Array.from(JSON.parse(_.ENVS.WEB3_MASTER_SECRET_KEY)),
      clusterApiUrl: _.ENVS.WEB3_CLUSTER_API_URL as Cluster,
      bundlr: {
        url: _.ENVS.WEB3_BUNDLR_CLUSTER_API_URL,
        providerUrl: _.ENVS.WEB3_BUNDLR_PROVIDER_URL,
        providerCurrency: _.ENVS.WEB3_BUNDLR_PROVIDER_CURRENCY,
        timeout: +_.ENVS.WEB3_BUNDLR_TIMEOUT,
      },
    }),
    VerificationModule.forRoot(),
    ValidationModule.forRoot({
      timeDistanceMinBoundary: +_.ENVS.VALIDATOR_TIME_DISTANCE_MIN_BOUNDARY,
      timeDistanceMaxBoundary: +_.ENVS.VALIDATOR_TIME_DISTANCE_MAX_BOUNDARY,
      rewardsOnedayMax: +_.ENVS.VALIDATOR_MAX_ONEDAY_REWARDS,
      h3MintingResolution: +_.ENVS.H3_MINTING_RESOLUTION,
      rtrpPerHoneycon: +_.ENVS.SERVICE_RTRP_PER_HONEYCON,
      rtrpPerMintingBanner: +_.ENVS.SERVICE_RTRP_PER_MINTING_BANNER,
    }),
    InventoryModule.forRoot({
      maxOutputLength: +_.ENVS.INVENTORY_MAX_OUTPUT_LENGTH,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '*',
        method: RequestMethod.POST,
      },
      // !TODO: Walking Guard
      // {
      //   path: `rtime?id=${RtimeId.Walking}`,
      //   method: RequestMethod.GET,
      // },
    );
  }
}