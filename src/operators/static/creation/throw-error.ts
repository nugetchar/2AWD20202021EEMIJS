import { OperationResult, OperationResultFlag } from "../../../models";
import { Observable } from "../../../observable/observable";

export const throwError = function(e: Error): Observable<never> {
    const obs$ = new Observable({});
    (obs$ as any)._innerSequence = [new OperationResult(void 0, OperationResultFlag.OperationError, e)];
    return obs$;
}