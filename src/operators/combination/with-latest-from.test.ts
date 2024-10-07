import { mutable, of } from "../static";
import { map } from "../transform";
import { withLatestFrom } from "./with-latest-from";
describe("withLatestFrom", () => {
  it("will succeed", () => expect(true).toBe(true));

  it("should return a new function to apply the withLatestFrom", () => {
    let _innerSource: any = 12;
    const withLatesFromFct = withLatestFrom();
    expect((withLatesFromFct(_innerSource).value as any)(_innerSource).value).toEqual([12]);
    expect(withLatesFromFct(_innerSource).isExecuteFunctionToGetOperationResult()).toEqual(true);
    expect((withLatesFromFct(_innerSource).value as any)(_innerSource).isWaitingForValue()).toEqual(false);
  });

  it("should not emit", () => {
    const obs$ = of(12);
    const pipedobs$ = obs$.pipe(withLatestFrom(of()));
    const nextSpy = jest.fn();
    pipedobs$.subscribe({ next: nextSpy });
    expect(nextSpy).not.toHaveBeenCalled();
  });

  fit("should emit b1, c4, d4", () => {
    const source1$ = mutable<string>("a");
    const source2$ = mutable<number>();
    const withLatestFrom$ = source1$.pipe(
      withLatestFrom(source2$),
      map((res) => {
        console.log('res', res)
        return null}),
    );
    const nextSpy = jest.fn((source) => console.log('SOURCE', source));
    withLatestFrom$.subscribe({ next: nextSpy });
    expect(nextSpy).not.toHaveBeenCalled();
    // PB ici : quand je next, je trigger les subscribers du mutable observable source 1, pas ceux du withLatestFrom$
    // donc c'est au niveau du pipe qu'il faut que je rajoute quelque chose : le fait de souscrire à la source
    source1$.next("b");
    console.log('NEXT SOURCE 2 : 1');
    source2$.next(1); 
    // expect(nextSpy).toHaveBeenCalledWith("b1");
    // source2$.next(2); 
    // expect(nextSpy).not.toHaveBeenCalledWith('b2');
    // source2$.next(3); 
    // expect(nextSpy).not.toHaveBeenCalledWith('b3');
    // source2$.next(4); 
    // expect(nextSpy).not.toHaveBeenCalledWith('b4');

    // source1$.next('c');
    // expect(nextSpy).toHaveBeenCalledWith("c4");
    // source1$.next('d');
    // expect(nextSpy).toHaveBeenCalledWith("d4");
  });
});
