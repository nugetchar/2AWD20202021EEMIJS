import {
    OperationResult,
    OperationResultFlag,
    OperatorFunction,
  } from "../../models/operator";
  
  export function error<T = any>(error: Error): OperatorFunction<T, OperationResult<void>> {
    return () => new OperationResult(void 0, OperationResultFlag.OperationError, error);
  };
  