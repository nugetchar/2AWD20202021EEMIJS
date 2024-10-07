import {
  OperatorFunction,
  OperationResult,
  OperationResultFlag,
} from "../models/operator";
import { OnComplete, Subscriber } from "../models/subscription";
import { Observable } from "./observable";

export class MutableObservable<T = never>
  extends Observable<T>
{
  private _preProcessOperations: OperatorFunction<T, any>[] = [];

  constructor(...initialSequence: T[]) {
    super({initialSequence});
    this._isComplete = false;
  }

  close(): this { 
    if (this._isComplete) {
      return this;
    }

    this._isComplete = true;
    super._triggerExecution(this._innerSequence, this._subscribers, this._forks);
    return this;
  }

  /**
   * @param operations
   * @returns this
   */
  compile(...operations: OperatorFunction<T, OperationResult<any>>[]): this {
    if (this._isComplete) {
      return this;
    }

    const newSequence = this._buildNewSequence(
      this.innerSequence
        .filter((event) => !event.isOperationError())
        .map((event) => event.value),
      [...operations, ...this._preProcessOperations]
    ).filter((event) => !event.isMustStop());
    
    const idxError = newSequence.findIndex((opRes) => opRes.isOperationError());
    if (idxError > -1) {
      this.innerSequence = newSequence.slice(0, idxError);
      this.next(...this.innerSequence.map((event) => event.value));

      this.innerSequence.push(newSequence[idxError]);
      super._triggerExecution([newSequence[idxError]], this._subscribers, this._forks);
      return this;
    }

    super._triggerExecution(this.innerSequence = newSequence, this._subscribers, this._forks);
    
    return this;
  }

  next(...events: T[]): this {
    if (this._isComplete) {
      return this;
    }

    this.innerSequence = this._buildNewSequence(
      events,
      this._preProcessOperations
    );
    
    super._triggerExecution(this.innerSequence, this._subscribers, this._forks);
    return this;
  }

  private _buildNewSequence(
    events: T[],
    operations: OperatorFunction<T, any>[]
  ): OperationResult<T>[] {
    const newSequence = [];
    for (let i = 0, l = events.length; i < l; i++) {
      try {
        const operationResult = this._executeOperations(events[i], operations);
        if (operationResult.isMustStop()) {
          newSequence.push(operationResult);
          break;
        }

        if (!operationResult.isFilterNotMatched()) {
          newSequence.push(operationResult);
        }
      } catch (error: any) {
        this._error = error;
        newSequence.push(
          new OperationResult(
            events[i],
            OperationResultFlag.OperationError,
            error
          )
        );
        i = l; // Do we really want to stop the whole stream if there is an error?
      }
    }
    return newSequence;
  }
}
