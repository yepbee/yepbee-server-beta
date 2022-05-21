import { DynamicModule, Global, Module } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { MailModuleOptions } from './mail.interface';
import { MailService } from './mail.service';

@Global()
@Module({})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: KEY_OPTIONS,
          useValue: options,
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
