import {
  OnNext,
  Subscriber,
  Subscription,
  OperatorFunction,
  OperationResult,
} from "../models";
import { Observable } from "./observable";

export interface ProxyObservableFunction<T = never> {
  (...args: any): any;
//   asObservable: () => Observable<T>;
  subscribe: (
    subscriber?: OnNext<T> | Subscriber<T> | undefined
  ) => Subscription;
  pipe: <U>(
    ...operations: OperatorFunction<T, OperationResult<U>>[]
  ) => Observable<U>;
  close: () => this;
}

// export class ProxyObservable<T = never> extends Observable<T> {
//   private proxy: { (...args: any): T };

//   public constructor(f: (...args: any) => T) {
//     super();
//     this._isComplete = false;
//     this.proxy = Object.assign(
//       new Proxy(f, {
//         apply: (target, thisArg, args) => {
//           let res;
//           let operationResult: OperationResult<T>;
//           try {
//             operationResult = new OperationResult(
//               (res = target.apply(thisArg, args))
//             );
//           } catch (e) {
//             operationResult = new OperationResult(
//               res as any,
//               OperationResultFlag.OperationError,
//               e as Error
//             );
//           }

//           this.innerSequence = [operationResult];
//           super._triggerExecution(
//             this.innerSequence,
//             this._subscribers,
//             this._forks
//           );

//           if (operationResult.isOperationError()) {
//             throw operationResult.error;
//           }
//           return res;
//         },
//       })
//     );
//   }

//   public static create<T>(f: (...args: any) => T): ProxyObservableFunction<T> {
//     const instance = new ProxyObservable<T>(f);
//     const res: ProxyObservableFunction<T> = (...args: any[]) => instance.proxy(...args);

//     instance.innerSequence = [];
//     (res as any).subscribers = instance._subscribers;
//     res.subscribe = function (
//       subscriber?: OnNext<T> | Subscriber<T> | undefined
//     ): Subscription {
//       return instance.subscribe.apply(instance, [subscriber ?? void 0]);
//     };
//     res.pipe = instance.pipe.bind(instance);
//     res.asObservable = () => instance;
//     res.close = () => {
//       if (instance._isComplete) {
//         return res;
//       }

//       instance._isComplete = true;
//       instance._triggerExecution(
//         instance._innerSequence,
//         instance._subscribers,
//         instance._forks
//       );
//       return res;
//     };
//     return res;
//   }
// }
