// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "./Locker.sol";

contract LockerFactory {
    mapping(address => address[]) public lockers;

    // get all Lockers associated with given address
    function getLocker(address _owner) public view returns (address[] memory) {
        return lockers[_owner];
    }

    event NewLocker(address locker, address owner);

    // create new locker
    function newLocker(
        string memory _name,
        address _owner,
        uint256 _lockingTime,
        address _beneficiary
    ) external {
        // create new locker
        Locker locker = new Locker(_name, _owner, _lockingTime, _beneficiary);

        // Add mapping
        lockers[_owner].push(address(locker));

        // emit new locker event
        emit NewLocker(address(locker), _owner);
    }
}
