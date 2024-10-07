import { filterNonFunctions, isFunction } from "../helpers/function.helper";
import {
  OperationResult,
  OperationResultFlag,
  OperatorFunction,
} from "../models/operator";
import {
  isInstanceOfSubscriber,
  subscriberOf,
  OnNext,
  Subscriber,
  Subscription,
} from "../models/subscription";
import { fromFunction, take } from "../operators";
import { ProxyObservableFunction } from "./proxy-observable";

export class Observable<T = never> {
  protected _innerSequence!: OperationResult<T>[];
  protected _subscribers: Subscriber<T>[] = [];
  protected _isComplete: boolean = true;
  protected _error!: Error;

  protected _forks: Observable<any>[] = [];
  protected _sources$: Observable<any>[] = [];

  protected get innerSequence() {
    return this._innerSequence;
  }

  protected set innerSequence(sequence: OperationResult<T>[]) {
    this._innerSequence = sequence;
  }

  constructor(params?: {
    sources$?: Observable<any>[];
    initialSequence?: T[];
  }) {
    if (params) {
      const { initialSequence, sources$ } = params;
      this._sources$ = sources$ ?? [];
      this.innerSequence = (initialSequence ?? []).map(
        (value) => new OperationResult(value)
      );
    }
  }

  pipe(): Observable<T>;
  pipe<A>(
    ...operations: [OperatorFunction<T, OperationResult<A>>]
  ): Observable<A>;
  pipe<A, B>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>
    ]
  ): Observable<B>;
  pipe<A, B, C>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>,
      OperatorFunction<B, OperationResult<C>>
    ]
  ): Observable<C>;
  pipe<A, B, C, D>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>,
      OperatorFunction<B, OperationResult<C>>,
      OperatorFunction<C, OperationResult<D>>
    ]
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>,
      OperatorFunction<B, OperationResult<C>>,
      OperatorFunction<C, OperationResult<D>>,
      OperatorFunction<D, OperationResult<E>>
    ]
  ): Observable<B>;
  pipe<A, B, C, D, E, F>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>,
      OperatorFunction<B, OperationResult<C>>,
      OperatorFunction<C, OperationResult<D>>,
      OperatorFunction<D, OperationResult<E>>,
      OperatorFunction<E, OperationResult<F>>
    ]
  ): Observable<F>;
  pipe<A, B, C, D, E, F, G>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>,
      OperatorFunction<B, OperationResult<C>>,
      OperatorFunction<C, OperationResult<D>>,
      OperatorFunction<D, OperationResult<E>>,
      OperatorFunction<E, OperationResult<F>>,
      OperatorFunction<F, OperationResult<G>>
    ]
  ): Observable<G>;
  pipe<A, B, C, D, E, F, G>(
    ...operations: [
      OperatorFunction<T, OperationResult<A>>,
      OperatorFunction<A, OperationResult<B>>,
      OperatorFunction<B, OperationResult<C>>,
      OperatorFunction<C, OperationResult<D>>,
      OperatorFunction<D, OperationResult<E>>,
      OperatorFunction<E, OperationResult<F>>,
      OperatorFunction<F, OperationResult<G>>,
      ...OperatorFunction<any, OperationResult<any>>[]
    ]
  ): Observable<G>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    ...operations: OperatorFunction<any, OperationResult<any>>[]
  ): Observable<unknown>;
  pipe(
    ...operations: OperatorFunction<any, OperationResult<any>>[]
  ): Observable<any> {
    const obs$ = new Observable<any>({ sources$: [this] });
    this._forks.push(obs$);

    const newSequence: OperationResult<any>[] = [];
    const sourceSequence = this.innerSequence;
    for (
      let i = 0, l = sourceSequence.length;
      i < l && !sourceSequence[i].isMustStop();
      i++
    ) {
      try {
        let operationResult = this._executeOperations(
          sourceSequence[i].value,
          operations
        );

        
        if (
          !operationResult.isFilterNotMatched()
        ) {
          newSequence.push(operationResult);
        }

        if (operationResult.isWaitingForValue()) {
          obs$._addDeferedOperations(sourceSequence[i].value, operationResult.value, ...operations.slice(i));
          i = l;
        }
      } catch (error) {
        newSequence.push(
          new OperationResult(
            sourceSequence[i].value as any,
            OperationResultFlag.OperationError,
            error as Error
          )
        );
        i = l;
      }
    }

    obs$.innerSequence = newSequence;
    return obs$;
  }

  subscribe(subscriber?: OnNext<T> | Subscriber<T> | undefined): Subscription {
    const _subscriber = this.checkSubscriber(subscriber);
    this.addSubscriber(_subscriber);
    const subscription = this.createSubscription(_subscriber);
    this.executeSubscriber(this.innerSequence, _subscriber);
    return subscription;
  }

  protected addSubscriber(subscriber: Subscriber<T> | null): void {
    if (subscriber === null) {
      return;
    }
    this._subscribers.push(subscriber);
  }

  protected createSubscription(subscriber: Subscriber<T> | null): Subscription {
    if (subscriber === null) {
      return new Subscription();
    }

    const subscription = new Subscription(
      () =>
        (this._subscribers = this._subscribers.filter((s) => s !== subscriber))
    );

    if (subscriber.unsubscribeOnComplete) {
      const orig = subscriber.complete;
      subscriber.complete = function () {
        console.trace();
        orig && orig.call(subscriber);
        subscription.unsubscribe();
      };
    }
    return subscription;
  }

  protected checkSubscriber(
    subscriber?: OnNext<T> | Subscriber<T> | undefined
  ): Subscriber<T> | null {
    if (subscriber === undefined) {
      this.executeSubscriber(this.innerSequence);
      return null;
    }

    if (!isFunction(subscriber) && !isInstanceOfSubscriber(subscriber)) {
      throw new Error("Please provide either a function or a Subscriber");
    }

    let _subscriber: Subscriber<T> = !isInstanceOfSubscriber(subscriber)
      ? subscriberOf(subscriber)
      : subscriber;
    return _subscriber;
  }

  protected executeSubscriber(
    sequence: OperationResult<T>[],
    _subscriber?: Subscriber<T> | null
  ): void {
    if (!_subscriber) {
      return;
    }
    if (this._isComplete) {
      _subscriber?.complete && _subscriber.complete();
    }
    for (let i = 0, l = sequence.length; i < l; i++) {
      let operationResult = sequence[i];
      if (operationResult.isOperationError()) {
        this._error = operationResult.error as Error;
        (
          _subscriber.error ||
          (() => {
            throw operationResult.error;
          })
        )(operationResult.error as Error);
        break;
      }

      if (operationResult.isFilterNotMatched()) {
        continue;
      }

      if (operationResult.isExecuteFunctionToGetOperationResult()) {
        console.log('SHOULD NOT HAPPEN')
        operationResult = (operationResult.value as any)(sequence[i]);
      }

      if (operationResult.isDeferedOperation()) {
        this.executeDeferedOperation(operationResult.value as ProxyObservableFunction, _subscriber);
        break;
      }

      if (operationResult.isMustStop()) {
        break;
      }
      _subscriber.next && _subscriber.next(operationResult.value);
    }
  }

  protected _executeOperations<T, U = any>(
    value: T,
    operators: OperatorFunction<T, OperationResult<U>>[]
  ): OperationResult<U> {
    const computedValue = this._computeValue(
      value as T,
      ...(filterNonFunctions(...operators) as OperatorFunction<
        T,
        OperationResult<U>
      >[])
    );
    return computedValue;
  }

  protected _triggerExecution(
    sequence: OperationResult<T>[],
    subscribers: Subscriber<T>[],
    forks: Observable<any>[]
  ): void {
    subscribers.forEach((s) => this.executeSubscriber(sequence, s));
    forks.forEach((f) => this._triggerExecution(sequence, f._subscribers, f._forks));
  }

  private _computeValue<T>(
    initValue: T,
    ...operations: OperatorFunction<T, OperationResult<any>>[]
  ): OperationResult<any> {
    let res: OperationResult<any> = new OperationResult(initValue);
    for (let i = 0; i < operations.length; i++) {
      res = operations[i](res.value);
      switch (res.flag) {
        case OperationResultFlag.FilterNotMatched:
        case OperationResultFlag.MustStop:
          i = operations.length;
          break;
        case OperationResultFlag.ExecuteFunctionToGetOperationResult:
          res = new OperationResult(
              (operations[i] as unknown as Observable<T>).pipe(take(1)),
            OperationResultFlag.WaitingForValue,
            res.error
          );
          i = operations.length;
          break;
        case OperationResultFlag.UnwrapSwitch:
          res = new OperationResult(
            res.value.innerSequence[res.value.innerSequence.length - 1]?.value
          );
          break;
        default:
          break;
      }
    }
    return res;
  }

  private _addDeferedOperations(initialValue: any, proxyObservableFunction$: ProxyObservableFunction, ...operations: OperatorFunction<any, OperationResult<any>>[]): void {
    // souscription à cet observable pour déclencher les opérations lorsque l'émition est bonne
    const deferedOperations$ = fromFunction(() => this._executeOperations(initialValue, operations));
    proxyObservableFunction$.subscribe({next: (value: OperationResult<(v: any) => OperationResult<any>>) => {
      const operationResult: OperationResult<any> = value.value(initialValue);
      // console.log('OPERATION RESULT IN DEFER', operationResult);
      if (!operationResult.isWaitingForValue()) {
        // console.log('C BON ON WAIT PAS')
        deferedOperations$();
      }
    }, unsubscribeOnComplete: true});
    // see if it works, else use a new flag "DeferedOperations"
    this.innerSequence.push(new OperationResult<any>(deferedOperations$, OperationResultFlag.DeferedOperation));
  }

  private executeDeferedOperation(obs$: ProxyObservableFunction, subscriber: Subscriber): void {
    obs$.subscribe({next: (value) => {this.executeSubscriber([value], subscriber)}, unsubscribeOnComplete: true});
  }
}
