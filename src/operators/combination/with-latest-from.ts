import { isNotNullOrUndefined } from "../../helpers/function.helper";
import {
    OperationResult,
    OperationResultFlag,
    OperatorFunction,
  } from "../../models/operator";
  import { Observable } from "../../observable/observable";
import { fromFunction } from "../static";
  
  export function withLatestFrom<T, R>(
    ...observables: Observable<R | any>[]
  ): OperatorFunction<T, OperationResult<[T, ...(R|any)[]] | T>> { 

    const emitFunction = () => {
      console.log('EMIT FUNCTION')
      const fct = (source: T) => {
        console.log('TRIGGER FCT', source)
        const lastValues: OperationResult<any>[] = observables
        .map((obs) => (obs as any)._innerSequence[(obs as any)._innerSequence.length - 1])
        .filter(isNotNullOrUndefined)
        .filter((operationResult: OperationResult<any>) => !operationResult.isOperationError())
        .map((operationResult: OperationResult<any>) => operationResult.value);
        return new OperationResult([source, ...lastValues], lastValues.length < observables.length ? OperationResultFlag.WaitingForValue : undefined);
      };
      return new OperationResult(fct, OperationResultFlag.ExecuteFunctionToGetOperationResult);
    }

    const res = fromFunction(emitFunction);

    observables.forEach((observable) => {
      observable.subscribe({next: (value) => {
        console.log('LA VALUE DE SOURCE 2', value);
        console.log('res subscribers', (res as any).subscribers)
        res()
      }, unsubscribeOnComplete: true});
    });
    
    return res;
  }
  