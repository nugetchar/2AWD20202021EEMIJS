// import { Observable } from "./observable";
// import { isFunction } from "../helpers/function.helper";
// import {
//   OperatorFunction,
//   OperationResult,
//   OperationResultFlag,
// } from "../models/operator";
// import {
//   isInstanceOfSubscriber,
//   OnComplete,
//   OnError,
//   OnNext,
//   Subscriber,
//   subscriberOf,
//   Subscription,
// } from "../models/subscription";

// export class ObservableFork<T> extends Observable<T> {
//   private subscriptions: Subscription[] = [];
//   private operators: OperatorFunction<T, OperationResult<any>>[] = [];
//   private _isClosed: boolean = false;

//   protected get innerSequence(): OperationResult<T>[] {
//     return (this.sourceObs$ as any).innerSequence;
//   }

//   protected set innerSequence(sequence: OperationResult<T>[]) {
//     this._innerSequence = sequence;
//   }

//   constructor(
//     private sourceObs$: Observable<T>,
//     ...operators: OperatorFunction<T, OperationResult<any>>[]
//   ) {
//     super();
//     this.operators = operators;
//     this._isComplete = (sourceObs$ as any)._isComplete;
//     (this.sourceObs$ as any)._forks.push(this);
//     this.sourceObs$.subscribe({
//       next: (value) => {
//         console.group("SOURCE OBS NEXT ==============");
//         console.log("SOURCE NEXTED", value);
//         const filteredSubscribers = this._subscribers.filter((s) => s.next);
//         let result = this._executeOperations<T, T>(value, operators);
//         console.log("RESULT AFTER EXECUTE OPERATIONS", result);
//         if (result.isExecuteFunctionToGetOperationResult()) {
//           console.log(
//             "IN OBSERVABLE FORK SOURCE OBS NEXT, IS EXECUTE FUNCTION"
//           );
//           result = (result.value as any)(value);
//         }
//         if (
//           !result.isFilterNotMatched() &&
//           !result.isMustStop() &&
//           !result.isWaitingForValue()
//         ) {
//           filteredSubscribers.forEach((s) =>
//             (s.next as OnNext<T>)(result.value)
//           );
//           console.groupEnd();
//           return;
//         }

//         if (result.isMustStop()) {
//           this.close();
//         }
//         console.groupEnd();
//       },
//       error: (err) => {
//         this._error = err;
//         this._subscribers
//           .filter((s) => s.error)
//           .forEach((s) => (s.error as OnError)(err));
//       },

//       complete: () => {
//         this._isComplete = true;
//         this.unsubscribe();
//         this._subscribers
//           .filter((s) => s.complete)
//           .forEach((s) => (s.complete as OnComplete)());
//       },

//       unsubscribeOnComplete: true,
//     });
//   }

//   subscribe(subscriber?: Subscriber<T> | OnNext<T> | undefined): Subscription {
//     const _subscriber = super.checkSubscriber(subscriber);
//     this.addSubscriber(_subscriber);
//     const subscription = super.createSubscription(_subscriber);

//     if (_subscriber === null) {
//       return subscription;
//     }

//     if (this._isClosed) {
//       _subscriber?.complete && _subscriber.complete();
//       return subscription;
//     }

//     const newSequence: OperationResult<T>[] = [];
//     const sourceSequence = (this.sourceObs$ as any)
//       .innerSequence as OperationResult<T>[];

//     for (let i = 0, l = sourceSequence.length; i < l; i++) {
//       try {
//         if (sourceSequence[i].isOperationError()) {
//           throw sourceSequence[i].error;
//         }
//         let result = this._executeOperations<T, T>(
//           sourceSequence[i].value,
//           this.operators
//         );
        
//         if (result.isExecuteFunctionToGetOperationResult()) {
//           result = (result.value as any)(sourceSequence[i].value);
//         }

//         if (
//           !result.isFilterNotMatched() &&
//           !result.isMustStop() &&
//           !result.isWaitingForValue()
//         ) {
//           super.executeSubscriber(newSequence, _subscriber);
//         }
//         newSequence.push(result);
//       } catch (error) {
//         newSequence.push(
//           new OperationResult(
//             sourceSequence[i].value,
//             OperationResultFlag.OperationError,
//             error as Error
//           )
//         );
//         i = l;
//       }
//     }
//     return subscription;
//   }

//   close(): this {
//     if (this._isClosed) {
//       return this;
//     }
    
//     this._isClosed = true;
//     this._forks.forEach((fork) => fork.close());
//     this._subscribers.forEach((s) => s.complete && s.complete());
//     this.unsubscribe();
//     return this;
//   }

//   /**
//    *     if (this._isComplete) {
//       return this;
//     }

//     this._isComplete = true;
//     this._subscribers
//       .filter((s) => s.complete)
//       .forEach((s) => {
//         (s.complete as OnComplete)();
//       });

//     return this;
//    */

//   private unsubscribe() {
//     this.subscriptions.forEach((s) => s.unsubscribe());
//   }
// }
