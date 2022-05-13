import { Inject, Injectable } from '@nestjs/common';
import { GpsModuleOptions } from './gps.interface';
import { KEY_OPTIONS } from '../common/constants';
import * as h3 from 'h3-js';

@Injectable()
export class GpsService {
  constructor(@Inject(KEY_OPTIONS) private readonly options: GpsModuleOptions) {
    console.log(options);
    h3.geoToH3(36.12312, -122.05512, 10);
  }
}
