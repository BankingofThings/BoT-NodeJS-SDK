const expect = require('chai').expect;
const utils = require('../utils.js');

describe('makerID()', function() {
  it('should give a makerID', function() {
    // 1. ARRANGE
    let mMakerID = 'REPLACE-WITH-OWN-MAKERID';

    // 2. ACT
    let makerID = utils.makerID();

    // 3. ASSERT
    expect(makerID).to.be.equal(mMakerID);
  });
});
