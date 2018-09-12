const expect = require('chai').expect;
const Store = require('../lib/store.js');

describe('getMakerID()', function () {
    it('should give a makerID', function () {
        // 1. ARRANGE
        let expectedMakerID = undefined;

        // 2. ACT
        let makerID = Store.getMakerID();

        // 3. ASSERT
        expect(makerID).to.equal(expectedMakerID);
    });
});
