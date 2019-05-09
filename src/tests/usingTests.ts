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
    });
});
