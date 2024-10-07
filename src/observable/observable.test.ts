import { subscriberOf, OnNext, Subscriber } from "../models/subscription";
import { Observable } from "./observable";
import { filter, map, of } from "../operators";
import { fail } from "../helpers/function.helper";

describe("Observable", () => {
  it("should create a new Observable with no emitting value", (done) => {
    const obs$ = new Observable();
    expect((obs$ as any).innerSequence).toEqual([]);
    obs$.subscribe({
      next: (value) =>
        fail("A value has been emitted. Should not. Value was:", value),
      error: (error) =>
        fail("An error has been emitted. Should not. Error was:", error),
      complete: () => done(),
    });
  });

  it("should create a new Observable with an emitting value", (done) => {
    const value = { firstname: "john", lastname: "doe" };
    const obs$ = new Observable({initialSequence: [value]});
    obs$.subscribe((val) => {
      expect(val).toEqual(value);
      done();
    });
  });

  describe("subscribe", () => {
    it("should throw an error", () => {
      const obs$ = new Observable<number>();
      expect.assertions(1);
      try {
        obs$.subscribe(12 as any);
      } catch (err) {
        expect(err).toEqual(
          new Error("Please provide either a function or a Subscriber")
        );
      }
    });

    it("should add a subscriber to the list of subscribers", () => {
      const obs$ = new Observable();
      expect((obs$ as any)._subscribers.length).toEqual(0);
      obs$.subscribe(() => {});
      expect((obs$ as any)._subscribers.length).toEqual(1);
    });

    it("should not execute the subscriber", () => {
      const subscriber: Subscriber = subscriberOf(jest.fn());
      const obs$ = new Observable();
      obs$.subscribe(subscriber);
      expect(subscriber.next).not.toHaveBeenCalled();
    });

    it("should execute the subscriber", () => {
      const subscriber: Subscriber = subscriberOf(jest.fn());
      const obs$ = new Observable<number>({initialSequence: [12]});
      obs$.subscribe(subscriber);
      expect(subscriber.next).toHaveBeenNthCalledWith(1, 12);
    });

    it("should execute next", () => {
      const next: OnNext<number> = jest.fn();
      const obs$ = new Observable<number>({initialSequence: [12]});
      obs$.subscribe(next);
      expect(next).toHaveBeenNthCalledWith(1, 12);
    });

    it("should execute onComplete", (done) => {
      const obs$ = new Observable({initialSequence: [12]});
      obs$.subscribe({ next: jest.fn(), complete: () => done() });
    });
  });

  describe("pipe", () => {
    it("should return a new Observable with no value", () => {
      const obs$ = new Observable<number>();
      const pipedobs$ = obs$.pipe(map((value: number) => value * 2));
      expect((pipedobs$ as any).innerSequence).toEqual([]);
      pipedobs$.subscribe(() => {
        fail("Should not go there, Observable should not have been started");
      });
    });

    it("should return a new Observable with the original Observable's value", () => {
      const obs$ = new Observable({initialSequence: [12]});
      const pipedobs$ = obs$.pipe();

      pipedobs$.subscribe((value) => {
        expect(value).toEqual(12);
      });
    });

    it("should return a new Observable with '100 potatoes' as a value", () => {
      const obs$ = new Observable({initialSequence: [1]});
      const pipedObs$ = obs$
        .pipe(map((x) => x * 10))
        .pipe(map((x) => `${x * 10} potatoes`));
      pipedObs$.subscribe((value) => expect(value).toEqual("100 potatoes"));
    });

    it("should return a Observable(6)", () => {
      const obs$ = new Observable({initialSequence: [12]});
      const mappedobs$ = obs$.pipe(map((value: number) => value / 2));
      mappedobs$.subscribe((value) => expect(value).toEqual(6));
    });

    it("should return a Observable(12)", () => {
      const obs$ = new Observable({initialSequence: [12]});
      const filteredobs$ = obs$.pipe(filter((value: number) => value > 10));
      filteredobs$.subscribe((value) => expect(value).toEqual(12));
    });

    it("should return a filtered Observable with no value", () => {
      const obs$ = new Observable({initialSequence: [12]});
      const filteredobs$ = obs$.pipe(filter((value: number) => value < 10));
      expect((filteredobs$ as any).innerSequence).toEqual([]);
      filteredobs$.subscribe(() => {
        fail("Should not go there, Observable should not have been started");
      });
    });

    it('should return a Observable("FILTERED") and then a Observable(0)', () => {
      const obs$ = new Observable({initialSequence: ['FIL']});
      const result$ = obs$.pipe(
        map((str: string) => str + "TERED"),
        filter((str: any) => !!str)
      );

      result$.subscribe((value) => expect(value).toEqual("FILTERED"));

      const result2$ = new Observable({initialSequence: [1]}).pipe(
        map((x: number) => x - 1),
        filter((x: number) => x >= 0)
      );
      result2$.subscribe((value) => expect(value).toEqual(0));
    });

    it("should throw an error", () => {
      const thresholdError = new Error("Threshold error: value is > 100");
      const obs$ = new Observable({initialSequence: [100]});
      expect.assertions(1);
      obs$
        .pipe(
          map((x: number) => {
            if (x < 100) {
              return x;
            } else {
              throw thresholdError;
            }
          })
        )
        .subscribe({ error: (err) => expect(err).toEqual(thresholdError) });
    });

    it("should return an Observable with an error", () => {
      const obs$ = of(12);
      obs$
        .pipe(
          map(() => {
            throw new Error("error");
          })
        )
        .subscribe({
          next: () => {
            fail();
          },
          error: (err) => {
            expect(err).toEqual(new Error("error"));
          },
        });
    });
  });
});
