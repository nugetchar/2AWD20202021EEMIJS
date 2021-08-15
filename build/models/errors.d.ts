export declare class FilterError implements Error {
    stack?: string | undefined;
    name: string;
    message: string;
    constructor(stack?: string | undefined);
}
export declare class StopFleuveSignal implements Error {
    stack?: string | undefined;
    name: string;
    message: string;
    constructor(stack?: string | undefined);
}
