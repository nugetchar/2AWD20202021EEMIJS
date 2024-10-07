import { Observable } from "../../observable/observable";
import { of } from "../static";
import { switchMap } from "./switch-map";

describe('switchMap', () => {
    it('will succeed', () => expect(true).toBe(true));

    it('should return a new function to apply the switch', () => {
      let _innerSource: any = 12;
      const switchMappedFct = switchMap((x) => new Observable({initialSequence: [x * 2]}));
      expect(switchMappedFct(_innerSource).value).toEqual(new Observable({initialSequence: [24]}));
      expect(switchMappedFct(_innerSource).isUnwrapSwitch()).toEqual(true);

      _innerSource = {firstname: 'John', lastname: 'DOE'};
      const fullnameFct = switchMap(({firstname, lastname}) => new Observable({initialSequence: [`${firstname} ${lastname}`]}));
      expect(fullnameFct(_innerSource).value).toEqual(new Observable({initialSequence: ['John DOE']}));
      expect(switchMappedFct(_innerSource).isUnwrapSwitch()).toEqual(true);
    });

    it("should return a new Observable", () => {
      const obs$ = of(12);
      const pipedobs$ = obs$.pipe(
        switchMap((x: number) => of(x * 2))
      );
      pipedobs$.subscribe((value) => expect(value).toEqual(24));
    });
  });