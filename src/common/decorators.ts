import { EnvModule } from 'src/env/env.module';
import { Err } from './result/result.function';

type TryCatchOption<E> = {
  originMsg?: string;
  errValue?: (e: string) => E;
};

export function TryCatch<E = string>({
  originMsg = '',
  errValue,
}: TryCatchOption<E> = {}) {
  return function (_target: any, _key: string, desc: PropertyDescriptor) {
    const origin = desc.value;

    desc.value = function (...args: any[]) {
      try {
        return origin.apply(this, args);
      } catch (e) {
        if (EnvModule.isNotProduction) console.error(e); // put
        if (e.message) e = e.message;
        const msg = `${originMsg}${e}`;
        if (!errValue) return Err(msg);
        return Err(errValue(msg));
      }
    };
  };
}

export function AsyncTryCatch<E = string>({
  originMsg = '',
  errValue,
}: TryCatchOption<E> = {}) {
  return function (_target: any, _key: string, desc: PropertyDescriptor) {
    const origin = desc.value;

    desc.value = async function (...args: any[]) {
      try {
        return await origin.apply(this, args);
      } catch (e) {
        if (EnvModule.isNotProduction) console.error(e); // put
        if (e.message) e = e.message;
        const msg = `${originMsg}${e}`;
        if (!errValue) return Err(msg);
        return Err(errValue(msg));
      }
    };
  };
}
