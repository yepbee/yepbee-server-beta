import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KEY_OPTIONS } from 'src/common/constants';
import { RtimeEntity } from 'src/rtime/entities/rtime.entity';
import { VerificationModuleOptions } from './verification.interface';
import { VerificationService } from './verification.service';

@Global()
@Module({})
export class VerificationModule {
  static forRoot(options?: VerificationModuleOptions): DynamicModule {
    return {
      module: VerificationModule,
      imports: [TypeOrmModule.forFeature([RtimeEntity])],
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        VerificationService,
      ],
      exports: [VerificationService],
    };
  }
}
