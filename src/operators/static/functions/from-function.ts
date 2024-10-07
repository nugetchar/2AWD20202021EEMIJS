import { OnNext, OperationResult, OperationResultFlag, Subscriber, Subscription } from "../../../models";
import {
  ProxyObservableFunction,
} from "../../../observable/proxy-observable";
import { error } from "../../transform";
import { mutable } from "../creation";

export const fromFunction = function <T = any>(f: (...args: any) => T): ProxyObservableFunction<T> {
  const mutable$ = mutable<T>();
  const proxy = Object.assign(
    new Proxy(f, {
      apply: (target, thisArg, args) => {
        let res;
        try {
            res = target.apply(thisArg, args);
            mutable$.next(res);
        } catch (e: any) {
          mutable$.compile(error(e));
        }
        return res;
      },
    }));
  const res: ProxyObservableFunction<T> = (...args: any[]) => proxy(...args); 
  res.subscribe = function (
    subscriber?: OnNext<T> | Subscriber<T> | undefined
  ): Subscription {
    return mutable$.subscribe.apply(mutable$, [subscriber ?? void 0]);
  };
  res.pipe = mutable$.pipe.bind(mutable$);
  res.close = () => {
    mutable$.close.apply(mutable$)
    return res;
  };
  return res;
};
