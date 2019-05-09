import { expect } from "chai";
import { using } from "../using";

class Disposable {
    isDisposed = false;

    dispose() {
        this.isDisposed = true;
    }
}

describe("using", () => {
    describe("sync", () => {
        it("should dispose the resource", () => {
            const disposable = new Disposable();
            using(disposable, () => {
                expect(disposable.isDisposed).to.be.false;
            });

            expect(disposable.isDisposed).to.be.true;
        });

        it("should dispose the resource when an exception occurs inside the lambda", () => {
            const disposable = new Disposable();
            try {
                using(disposable, () => {
                    throw new Error();
                });
            }
            catch {
                // do nothing
            }

            expect(disposable.isDisposed).to.be.true;
        });

        const methodNames = ["dispose", "close", "unsubscribe"];
        for (const methodName of methodNames) {
            it(`should dispose using #${methodName}()`, () => {
                let isDisposed = false;
                const obj = {
                    [methodName]() {
                        isDisposed = true;
                    }
                };
                using(obj as any, () => {
                    expect(isDisposed).to.be.false;
                });

                expect(isDisposed).to.be.true;
            });
        }
    });

    describe("async", () => {
        it("should dispose the resource asynchronously", async () => {
            const disposable = new Disposable();
            const result = using(disposable, () => {
                expect(disposable.isDisposed).to.be.false;
                return new Promise(resolve => {
                    expect(disposable.isDisposed).to.be.false;
                    resolve();
                });
            });

            expect(disposable.isDisposed).to.be.false;
            await result;
            expect(disposable.isDisposed).to.be.true;
        });

        it("should handle disposing when the promise is rejected", async () => {
            const disposable = new Disposable();
            try {
                await using(disposable, () => {
                    return Promise.reject(new Error());
                });
            } catch {
                // do nothing;
            }

            expect(disposable.isDisposed).to.be.true;
        });
    });

    describe("iterator", () => {
        it("should handle disposing after done with an iterator", () => {
            const disposable = new Disposable();
            const result = using(disposable, function*() {
                yield 0;
                expect(disposable.isDisposed).to.be.false;
                yield 1;
                expect(disposable.isDisposed).to.be.false;
            });

            let value = 0;
            for (const item of result) {
                expect(disposable.isDisposed).to.be.false;
                expect(item).to.equal(value);
                value++;
            }

            expect(disposable.isDisposed).to.be.true;
            expect(value).to.equal(2);
        });

        it("should handle disposing when an exception is thrown", () => {
            const disposable = new Disposable();
            const result = using(disposable, function*() {
                yield 0;
                throw new Error();
            });

            let value = 0;
            try {
                for (const item of result) {
                    expect(item).to.equal(value);
                    value++;
                }
            } catch {
                // ignore
            }

            expect(disposable.isDisposed).to.be.true;
            expect(value).to.equal(1);
        });
    });
});
