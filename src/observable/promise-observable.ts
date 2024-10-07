import { isFunction } from "../helpers/function.helper";
import {
  isInstanceOfSubscriber,
  OnNext,
  Subscriber,
  subscriberOf,
  Subscription,
} from "../models";
import {
  OperationResult,
  OperationResultFlag,
  OperatorFunction,
} from "../models/operator";
import { Observable } from "./observable";

export class PromiseObservable<T>
  extends Observable<T>
{
  private promise: Promise<void>;

  constructor(promise: Promise<T>) {
    super();
    this.promise = promise
      .then((res: T) => {
        this.innerSequence.push(new OperationResult(res));
      })
      .catch((err: Error) => {
        this.innerSequence.push(
          new OperationResult(
            void 0 as any,
            OperationResultFlag.OperationError,
            err
          )
        );
      });
  }

  subscribe(subscriber: Subscriber<T> | OnNext<T>): Subscription {
    if (subscriber === undefined) {
      subscriber = subscriberOf(() => {})
    }

    if (!isFunction(subscriber) && !isInstanceOfSubscriber(subscriber)) {
      throw new Error("Please provide either a function or a Subscriber");
    }

    let _subscriber: Subscriber<T> = !isInstanceOfSubscriber(subscriber)
      ? subscriberOf(subscriber)
      : subscriber;
    this._subscribers.push(_subscriber);

    const handler = () => this.executeSubscriber(this.innerSequence, _subscriber);

    this.promise.then(handler);

    return new Subscription(
      () =>
        (this._subscribers = this._subscribers.filter((s) => s !== subscriber))
    );
  }
}
