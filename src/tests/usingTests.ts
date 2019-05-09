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
});
