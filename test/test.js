const expect = require('chai').expect;
const utils = require('../lib/utils.js');

describe('getMakerID()', function() {
    it('should give a makerID', function() {
        // 1. ARRANGE
        let expectedMakerID = undefined;

        // 2. ACT
        let makerID = utils.getMakerID();

        // 3. ASSERT
        expect(makerID).to.be.equal(expectedMakerID);
    });
});
