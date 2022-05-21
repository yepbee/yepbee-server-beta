import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { RtimeModule } from './rtime/rtime.module';
import { KEY_PUBKEY, KEY_USER } from './common/constants';
import { MailModule } from './mail/mail.module';
import { EnvModule as _ } from './env/env.module';
import { Verification } from './users/entities/verification.entity';
import { User } from './users/entities/user.entity';

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
    }),
    TypeOrmModule.forFeature([Verification, User]), // for app.controller
    /* GraphQL */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      context: ({ req }) => ({
        [KEY_PUBKEY]: req[KEY_PUBKEY],
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
      interval: +_.ENVS.RTIME_INTERVAL,
    }),
    UsersModule.forRoot(),
    AuthModule.forRoot(),
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
