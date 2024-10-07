import {fromFunction} from './from-function';
import {fork} from '../creation/fork';
import { map } from '../../transform/map';

describe('fromFunction', () => {
    fit('should return a callable function to which you can subscribe', () => {
        function sum(...args: number[]) {
            return args.reduce((acc, curr) => acc + curr, 0);
        }

        const sum$ = fromFunction(sum);
        const next = jest.fn((res) => expect(res).toBe(4));
        sum$.subscribe(next);
        sum$(2, 2);
        expect(next).toHaveBeenNthCalledWith(1, 4);
    });

    it('should be forkable', () => {
        function sum(...args: number[]) {
            return args.reduce((acc, curr) => acc + curr, 0);
        }

        const sum$ = fromFunction(sum);
        const next = jest.fn((res) => expect(res).toBe(8));
        const fork$ = fork(sum$.asObservable(), map((x) => x * 2));
        
        fork$.subscribe(next);
        sum$(2, 2);
        expect(next).toHaveBeenNthCalledWith(1, 8);
    });

    it('should execute only on errors', () => {
        const expectedError = new Error('error')
        function throwException() {
            throw expectedError;
        }

        const throwException$ = fromFunction(throwException);
        const error = jest.fn((res) => expect(res).toEqual(expectedError));
        throwException$.subscribe({error});
        try {
            throwException$();
        } catch (e) {
            expect(error).toHaveBeenNthCalledWith(1, expectedError);
            expect(e).toEqual(expectedError);
        }
    });
})

