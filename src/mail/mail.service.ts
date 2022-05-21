import { Inject, Injectable } from '@nestjs/common';
import { KEY_OPTIONS } from 'src/common/constants';
import { Authorization, makeForm, toBase64 } from 'src/common/functions';
import { PromiseGotRequest, RequestBody } from 'src/common/interfaces';
import { EmailVars, MailModuleOptions } from './mail.interface';
import got from 'got';
import { AsyncTryCatch } from 'src/common/decorators';
import { EnvService } from 'src/env/env.service';

enum Template {
  Verification = 'verify-email',
}

@Injectable()
export class MailService {
  constructor(
    @Inject(KEY_OPTIONS) private readonly options: MailModuleOptions,
    private readonly envService: EnvService,
  ) {}

  private fetchMailgun(body: RequestBody): PromiseGotRequest {
    return got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
      method: 'post',
      headers: {
        ...Authorization('Basic', toBase64(`api:${this.options.apiKey}`)),
      },
      body,
    });
  }

  private sendEmail(
    to: string,
    subject: string,
    template: Template,
    emailVars: EmailVars,
  ): PromiseGotRequest {
    const form = makeForm({
      from: this.options.fromEmail,
      to,
      subject,
      template,
    });
    for (const key in emailVars) {
      form.append('v:' + key, emailVars[key]);
    }
    return this.fetchMailgun(form);
  }

  // =======================================
  @AsyncTryCatch()
  async sendVerificationEmail(email: string, redirectUri: string) {
    await this.sendEmail(email, 'Verify Your Email', Template.Verification, {
      username: email,
      uri: redirectUri,
    });
    return;
  }
}
