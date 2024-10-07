export type OperatorFunction<T, U = never> = (source: T) => U;

export class OperationResult<T> {
    constructor(private _value: T, private _flag?: OperationResultFlag, private _error?: Error) {}

    get value() {
        return this._value;
    }

    get flag() {
        return this._flag;
    }

    get error() {
        return this._error;
    }

    isUnwrapSwitch(): boolean {
        return this._flag === OperationResultFlag.UnwrapSwitch;
    }

    isMustStop(): boolean {
        return this._flag === OperationResultFlag.MustStop;
    }

    isFilterNotMatched(): boolean {
        return this._flag === OperationResultFlag.FilterNotMatched;
    }

    isOperationError(): boolean {
        return this._flag === OperationResultFlag.OperationError;
    }

    isExecuteFunctionToGetOperationResult(): boolean {
        return this._flag === OperationResultFlag.ExecuteFunctionToGetOperationResult;
    }

    isWaitingForValue(): boolean {
        return this._flag === OperationResultFlag.WaitingForValue;
    }

    isDeferedOperation(): boolean {
        return this._flag === OperationResultFlag.DeferedOperation;
    }
}

export enum OperationResultFlag {
    UnwrapSwitch = 'UnwrapSwitch',
    MustStop = 'MustStop',
    FilterNotMatched = 'FilterNotMatched',
    OperationError = 'OperationError',
    WaitingForValue = 'WaitingForValue',
    ExecuteFunctionToGetOperationResult = 'ExecuteFunctionToGetOperationResult',
    DeferedOperation = 'DeferedOperation',
}