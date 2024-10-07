import { isFunction } from "../helpers/function.helper";
export class Subscription {
  constructor(private _unsubscribeCallback?: UnsubscribeCallback) {}

  unsubscribe(): void {
    this._unsubscribeCallback && this._unsubscribeCallback();
  }
}

export const EMPTY_SUBSCRIPTION = new Subscription();

interface UnsubscribeCallback {
  (): void;
}

export interface Subscriber<T = any> {
  next?: OnNext<T>;
  error?: OnError;
  complete?: OnComplete;
  unsubscribeOnComplete?: boolean;
}

export function isInstanceOfSubscriber(obj: any): obj is Subscriber {
  function hasAtLeastOneOfTheseFieldsAsAFunction(
    obj: { [k: string]: any },
    ...fields: string[]
  ): boolean {
    return fields.some(
      (field) =>
        obj[field] !== undefined &&
        obj[field] !== null &&
        (isFunction(obj[field]))
    );
  }
  return (
    !isFunction(obj) &&
    hasAtLeastOneOfTheseFieldsAsAFunction(obj, "next", "error", "complete")
  );
}

export function subscriberOf<T>(
  next?: OnNext<T>,
  error?: OnError,
  complete?: OnComplete,
): Subscriber<T> {
  const subscriber: Subscriber<T> = { next, error, complete };
  if (!isInstanceOfSubscriber(subscriber)) {
    throw new Error(`Please provide functions for next, error and complete`);
  }
  return subscriber;
}

export interface OnNext<T> {
  (t: T): void;
}

export interface OnError {
  (err: Error): void;
}

export interface OnComplete {
  (): void;
}

export interface SubscribeFunction<T> {
  (subscriber: OnNext<T> | Subscriber<T>): Subscription;
}
