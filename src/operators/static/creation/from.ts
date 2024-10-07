import { Observable } from "../../../observable/observable";

export const from = function<T = never>(...values: T[]): Observable<T> {
    return new Observable({initialSequence: values});
}