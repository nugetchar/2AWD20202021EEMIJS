import { Observable } from "../../observable/observable";
import { map } from "../transform/map";
import {ifElse} from './if-else';

describe('ifElse', () => {
    it('will succeed', () => expect(true).toBe(true));

   it('should return a new observable from the "if" branch', () => {
       const obs$ = new Observable({initialSequence: [12]});
       const res$ = obs$.pipe(ifElse((x) => x > 0, [map(x => x * 2)]));
       res$.subscribe((x) => expect(x).toEqual(24));
   });

   it('should return a new observable from the "else" branch', () => {
    const obs$ = new Observable({initialSequence: [120]});
    const res$ = obs$.pipe(ifElse((x) => x < 100, [map(x => x * 2)], [map(() => 100)]));
    res$.subscribe((x) => expect(x).toEqual(100));

    const res2$ = obs$.pipe(ifElse((x) => x < 100, [map(x => x * 2)]));
    res2$.subscribe((x) => expect(x).toEqual(120));
   });
});