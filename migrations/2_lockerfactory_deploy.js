const LockerFactory = artifacts.require("LockerFactory");

module.exports = function (deployer) {
    deployer.deploy(LockerFactory);
};
