const expect = require('chai').expect;
const Store = require('../lib/store.js');

describe('getMakerOrProductID()', function () {
    it('should give a MakerID or a productID', function () {
        // 1. ARRANGE
        let expectedID = undefined;

        // 2. ACT
        let id = Store.getMakerOrProductID();

        // 3. ASSERT
        expect(id).to.equal(expectedID);
    });
});
