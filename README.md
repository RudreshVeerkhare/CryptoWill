# CryptoWill

## Introduction

People write WILL to dictate how their assets must be managed after they pass away. In this era of emerging technologies, many people possess digital assets such as Bitcoin, but because of how new this technology is, there hasn't been much work focusing on **CryptoWill** i.e **WILLs powered by Blockchain**.

Let's say someone has bought 100 Bitcoins 10 years ago (which would've cost around [$300](https://www.in2013dollars.com/bitcoin-price-in-2011) at that time) and then, unfortunately, passed away in recent years, but now along with that person, those 100 Bitcoins (Worth Approx. **$6.1 Million** (1BTC = Aprx. $61000) in the year 2021) are also lost.

And due to the nature of the Blockchain, once the private key to the wallet is gone (which is supposed to be only known to the Owner), all assets in that wallet are also lost forever.

This situation could've been managed with the help of WILL, i.e if the person would've written a WILL stating how his Bitcoins should be managed, today those 100 Bitcoins would get saved.

But writing Centralized, Old-fashioned WILL for digital assets seems so trite and also adds a new set of problems.

## Solution

Thus CryptoWill is a Decentralized solution for creating your WILL using Smart Contract, which means you are essentially writing your will into the Blockchain. And it is much more flexible than how normal, traditional WILL. You can modify it anywhere and anytime without any hassle.

The Main Problem with Decentralized WILL was that how a smart contract would get to know if a person is alive or passed away?
So to tackle this, every CryptoWill has a locking period. Let's assume that we have created a CryptoWill and its locking period is 2 years, which means that the CryptoWill will be unlocked for its beneficiary to claim after 2 years from the last active time of its owner. For example, if the owner has last interaction with the contract in Oct 2021, and the locking period is 2 years, then this CryptoWill will get unlocked in Oct 2023 for its beneficiary to access.

## Setup Guide

To run this app locally follow given steps :

1. Clone this repository

```console
git clone https://github.com/RudreshVeerkhare/CryptoWill.git
```

2. Then cd into the cloned repo and install all required NPM packages

```console
cd CryptoWill
npm install
```

3. Then to start next.js dev server using command

```console
npm run dev
```

That's it !! Now just open http://localhost:3000/ on your browser.

## Celo Blockchain

As interaction with the Blockchain costs a certain amount as gas fees, it'll be more convenient for users if the Blockchain has lower transaction fees and larger transaction throughput. Celo blockchain satisfies both these criteria, plus it also has support for mobile users. So I've chosen Celo Blockchain for CryptoWill.
