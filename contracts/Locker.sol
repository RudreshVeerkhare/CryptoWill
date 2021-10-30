// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Locker {
    // Name assigned to Will contract
    string public name;

    // address of the owner
    address public owner;

    // time at which owner was last active
    uint256 public lastOwnerActive;

    // amount of time after inactivity of owner after which beneficiary can
    // claim the assets
    uint256 public lockingPeriod;

    // address of the beneficiary
    address public beneficiary;

    /**
     * Creates a Will with specified owner and locking time and beneficiary.
     *
     * @param _owner: Owner of the Will contract
     * @param _lockingPeriod: Amount of time to be locked after inactivity of owner
     *                        after which assets are claimable by beneficiary
     * @param _beneficiary: address of beneficiary
     **/
    constructor(
        string memory _name,
        address _owner,
        uint256 _lockingPeriod,
        address _beneficiary
    ) {
        name = _name;
        owner = _owner;
        lockingPeriod = _lockingPeriod;
        beneficiary = _beneficiary;

        // set last owner active time to current time
        lastOwnerActive = block.timestamp;
    }

    // Modifier to check that the caller is the owner of
    // the contract.
    modifier isOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Modifier to check that the caller is the beneficiary
    modifier isBeneficiary() {
        require(msg.sender == beneficiary, "Not owner");
        _;
    }

    event WithdrewERC20(address token, address by, address to, uint256 amount);
    event Withdrew(address by, address to, uint256 amount);
    event Received(uint256 amount);

    modifier isAllowed() {
        require(
            msg.sender == owner ||
                (msg.sender == beneficiary &&
                    block.timestamp >= (lastOwnerActive + lockingPeriod)),
            "Not Allowed!"
        );
        _;
    }

    function withdrawERC20(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external isAllowed {
        IERC20Metadata token = IERC20Metadata(_tokenAddress);

        // get balace of token
        uint256 balance = token.balanceOf(address(this));

        // check of balance is less than required Amount
        require(balance >= _amount, "Not Enought Balance !");

        // transfer required amount
        token.transfer(_to, _amount);

        // emit event after transfer
        emit WithdrewERC20(_tokenAddress, msg.sender, _to, _amount);
    }

    function withdraw(address payable _to, uint256 _amount) external isAllowed {
        // check of balance is less than required Amount
        require(address(this).balance >= _amount, "Not Enought Balance !");

        // send celo (ether) to given address
        _to.transfer(_amount);

        // emit event
        emit Withdrew(msg.sender, _to, _amount);
    }

    function heartbeat() external isOwner {
        // update last owner active timestamp
        lastOwnerActive = block.timestamp;
    }

    receive() external payable {
        // check if sender is owner of the contract
        require(msg.sender == owner, "Not Owner");

        emit Received(msg.value);
    }
}
