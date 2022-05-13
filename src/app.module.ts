import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GpsModule } from './gps/gps.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token/token.module';

const {
  isNotProduction,
  ENVS: {
    //
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
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
      debug: isNotProduction,
      playground: isNotProduction,
    }),
    // ---------------------------
    GpsModule.forRoot(),
    TokenModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
