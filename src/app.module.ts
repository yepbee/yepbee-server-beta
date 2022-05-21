import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { RtimeModule } from './rtime/rtime.module';
import { KEY_PUBKEY, KEY_USER } from './common/constants';

const {
  isNotProduction,
  ENVS: {
    //
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    RTIME_INTERVAL,
  },
} = EnvModule;

@Module({
  imports: [
    EnvModule.forRoot(),
    // ---------------------------
    /* PostgreSQL */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: +DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      synchronize: isNotProduction,
      logging: isNotProduction,
      autoLoadEntities: true,
    }),
    /* GraphQL */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      context: ({ req }) => ({
        [KEY_PUBKEY]: req[KEY_PUBKEY],
        [KEY_USER]: req[KEY_USER],
      }),
      debug: isNotProduction,
      playground: isNotProduction,
    }),
    // ---------------------------
    UsersModule.forRoot(),
    AuthModule.forRoot(),
    RtimeModule.forRoot({
      interval: +RTIME_INTERVAL,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.POST,
    });
  }
}
