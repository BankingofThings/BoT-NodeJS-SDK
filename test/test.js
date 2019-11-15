const expect = require('chai').expect;
const Store = require('../lib/store.js');

describe('getProductID()', function () {
    it('should give a productID', function () {
        // 1. ARRANGE
        let expectedProductID = undefined;

        // 2. ACT
        let productID = Store.getProductID();

        // 3. ASSERT
        expect(productID).to.equal(expectedProductID);
    });
});
