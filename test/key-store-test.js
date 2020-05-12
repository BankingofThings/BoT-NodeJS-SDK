const expect = require('chai').expect;
const Store = require('../lib/store.js');

describe('getMakerOrProductID()', function () {
    it('should give a MakerID or a productID', function () {
        //Reset the Store
        Store.setMakerOrProductID(undefined);
        Store.reset();

        //Check for MakerID
        expect(Store.hasMakerOrProductID()).to.equal(false);

        //Set setMakerOrProductID
        let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
        Store.setMakerOrProductID(MakerOrProductID);

        //Check for MakerID
        expect(Store.hasMakerOrProductID()).to.equal(true);

        //Get MakerOrProductID
        let id = Store.getMakerOrProductID();

        //ASSERT
        expect(id).to.equal(MakerOrProductID);
    });
});
