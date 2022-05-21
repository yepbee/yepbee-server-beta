import { EnvModule } from 'src/env/env.module';
import { Err } from './result/result.function';

export function TryCatch(originMsg = '') {
  return function (_target: any, _key: string, desc: PropertyDescriptor) {
    const origin = desc.value;

    desc.value = function (...args: any[]) {
      try {
        return origin.apply(this, args);
      } catch (e) {
        if (EnvModule.isNotProduction) console.error(e); // put
        if (e.message) e = e.message;
        return Err(`${originMsg}${e}`);
      }
    };
  };
}

export function AsyncTryCatch(originMsg = '') {
  return function (_target: any, _key: string, desc: PropertyDescriptor) {
    const origin = desc.value;

    desc.value = async function (...args: any[]) {
      try {
        return await origin.apply(this, args);
      } catch (e) {
        if (EnvModule.isNotProduction) console.error(e); // put
        if (e.message) e = e.message;
        return Err(`${originMsg}${e}`);
      }
    };
  };
}
