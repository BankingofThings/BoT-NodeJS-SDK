![readme-header](readme-header.png)

[![Build Status](https://travis-ci.com/BankingofThings/BoT-NodeJS-SDK.svg?branch=master)](https://travis-ci.com/BankingofThings/BoT-NodeJS-SDK)

FINN enables your IoT devices to perform seamless autonomous payments on your behalf.
For more information, visit us at [makethingsfinn.com](https://makethingsfinn.com)

# Supported Features
   | Sl. No        | SDK Feature                                | Status      | Remarks |
   | :-----------: |:-------------------------------------------| :-----------| :-------|
   |        1      | Pairing through Bluetooth Low Energy (BLE) | :thumbsup: | Supported with iOS and Android Mobile Applications |
   |        2      | Pairing through QR Code                    | :thumbsup: | Supported only in Console mode for device to be paired for both iOS and Android Mobile Applications|
   |        3      | Secured HTTP with BoT Service              | :thumbsup: | Supported for all interactions with backend server |
   |        4      | Logging                                    | :thumbsup: | Console Logging is implemented|
   |        5      | Offline Actions                            | :thumbsdown: | Helps to persist the autonomous payments on the device when there is no internet connectivity available. The saved offline actions get completed when the next action trigger happens and internet connectivity is available. This feature is in plan for implementation.|
   
# Requirements
This SDK works best on devices with a debian-based distribution. like Raspberry Pi or a regular Ubuntu. To follow this tutorial you'll need:
- A device with a debian distribution OS, such as Raspberry Pi with Raspbian. For further instructions on how to install, check on [Raspberry Pi official documentation](https://www.raspberrypi.org/documentation/installation/installing-images/README.md). Or a computer with the following tools:
    - A Unix system (Linux - preferrably Debian based or Mac)
    - NodeJS 8.16.0. You can find the version suitable for your device [in the official download page](https://nodejs.org/dist/latest-v8.x/).
    - Git
- An iOS or Android device with FINN - Banking of Things App. Find it on the [Appstore](https://itunes.apple.com/nl/app/finn-banking-of-things/id1284724116) or in the [Playstore](https://play.google.com/store/apps/details?id=io.bankingofthings.bot&gl=NL)
- A Computer with a web browser

# Getting Started
Visit our [official documentation](https://docs.bankingofthings.io) for a complete overview.
The main steps are:

- [Setting up your device](#setting-up-your-device)
    - [For Raspberry Pi Users](#for-respberry-pi-users)
    - [For Mac Users](#for-mac-users)
- [Installing the SDK](#installing-the-sdk)

# Installation

## Setting up your device

### For Raspberry Pi Users

If you're on a Raspberry Pi, you can download [Raspbian Buster Lite](https://www.raspberrypi.org/downloads/raspbian/)
and flash it with [Apple Pi Baker](https://www.pibakery.org/download.html)

Check your local node installation.
```bash
node -v
```

If your node version is different, make sure to install the right version:

```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

Now, install git:
```bash
sudo apt-get install git
```

### For Mac Users

Note: Mac usage is for testing purposes only and some peripherals might not work properly.

Check your local node installation by opening a Terminal and writting the following command.
```bash
node -v
```

If your node version is different than this one we suggest using nvm to go back and forth on different node versions. For more information, Visit the [documentation](https://github.com/nvm-sh/nvm#installation-and-update).

Install command line tools
```bash
xcode-select --install
```

Now your device is set and ready to install the SDK.

---

## Installing the SDK

### Clone the repository
Clone the repository on your device, for example with ssh, and enter the folder:
```bash
git clone https://github.com/BankingofThings/BoT-NodeJS-SDK.git && cd BoT-NodeJS-SDK
```

### Creating your environment
As for now, this SDK supports debian based environments. To setup your environment, run:
```bash
make environment-debian
```
For development wit a Mac, you can skip this step. Make sure you use macOS with Xcode installed.

### Installing dependencies
To install dependencies run:
```bash
make install
```
---

### Configuration
Before your first run, start the configuration tool. It will ask for a few things to configure:
```bash
sh bin/config.sh
```

#### Enter your productID (or the deprecated makerID)
Copy paste your unique productID from your product page in the FINN [Maker Portal](https://maker.bankingofthings.io).

For makerID, you can use the `makerID` from the account page.

#### Multi-pairable device (yes/no)
When your IoT device is meant to be used by more than one user say "yes" to this option.
This will result in an IoT device that is usable for all FINN app users.
If your IoT device meant to have one owner then say "no" to this option

#### Enter your alternativeID
When configuring a Multi-pairable device we have to set an alternativeID.
This alternativeID needs to be filled-in during the pairing process in the FINN Companion app.
Examples can be a "loyalty card number" or the "license plate" of your car.


#### Reset
To reset the SDK to its default configuration type:
```bash
make reset
```

---

## Using the SDK

### Running the server
To run the server normally after you've configured it, simply run:
```bash
make server
```

This makes your device a server with a few web endpoints that can be accessed through any web client.

We are using curl in the examples below.

### Pairing your device
You can get pairing information by making a get call to the [/pairing](#get-pairing-info) endpoint
```bash
curl localhost:3001/pairing
```

### Retrieving actions
You can see available actions that have been configured in the FINN Maker Portal by making a get call to the [/actions](#get-actions-info) endpoint
```bash
curl localhost:3001/actions
```

### Triggering actions
You can manually trigger an action by sending a post call to the [/actions](#trigger-an-action) endpoint
```bash
curl -d '{"actionID":"YOUR_ACTION_ID"}' -H "Content-Type: application/json" http://localhost:3001/actions
```
#### Triggering Multipairing actions
If your device is set to be a multipairable device, you need to specify the alternativeID in your request body
```bash
curl -d '{"actionID":"YOUR_ACTION_ID", "alternativeID":"ID"}' -H "Content-Type: application/json" http://localhost:3001/actions
```

# SDK server API Reference

## Get Pairing info
Get information about device for pairing

**URL**: `/pairing`

**Method**: `GET`

### Success Response

**Code**: `200`

**Content**:
```json
{
    "deviceID": "The-device-ID",
    "makerID": "Find-Maker-or-Product-ID-in-maker-portal",
    "publicKey": "the-public-key"
}
```

## Get Actions info

**URL**: `/actions`

**Method**: `GET`

**Response Type**

### Success Response
--
**Code**: `200`

**Content**:
An Array of objects with a list of all the actions specified for your product in the Maker Portal
```json
[
    {
        "actionID": "the-action-id",
        "frequency": "always",
        "info": "when the event triggers",
        "date_created": "2019-01-01 12:12:12 +0000",
        "metadata": "{data: [\"info\", \"here\"]}",
        "actionName": "event triggers",
        "makerID": "Find-Maker-or-Product-ID-in-maker-portal",
        "type": "push"
    },
    { ... },
    { ... }
]
```

## Trigger an Action

**URL**: `/actions`

**Method**: `POST`

**Response Type**: `Application/json`

**Payload**:
```json
{
    "actionID": "Find-action-ID-in-maker-portal",
    //optional:
    "alternativeID" "alternative-ID-for-multi-paired-devices"
}
```

### Success Response
--
**Code**: `200`

**Content**: ` `

---
# Contributing
Any improvement to the FINN SDK are very much welcome! Our software is open-source and we believe your input can help create a lively community and the best version of FINN. We’ve already implemented much of the feedback given to us by community members and will continue to do so. Join them by contributing to the SDK or by contributing to the documentation.

## Running tests
At the moment we do not have high test-coverage. You're free to make a PR to add tests! To run the tests:
```bash
make test
```

# Community

## Slack
Slack is our main feedback channel for the SDK and documentation. Join our [Slack channel](https://ing-bankingofthings.slack.com/join/shared_invite/enQtNDEyODg3MDE1NDg4LWJhNGFiOTFhZmVlNGQwMTM4ZjQzNmZmZDk5ZGZiNjNlZTVjZjNmYjE0Y2MxZjU5MWQxNmY5MTgzYzAxNmFiNGU) and be part of the FINN community.<br/>

## Meetups
We also organize meetups, e.g. demo or hands-on workshops. Keep an eye on our meetup group for any events coming up soon. Here you will be able to see the FINN software in action and meet the team.<br/>
[Meetup/Amsterdam-ING-Banking-of-Things](meetup.com/Amsterdam-ING-Banking-of-Things/).

# About FINN
After winning the ING Innovation Bootcamp in 2017, FINN is now part of the ING Accelerator Program. Our aim is to become the new Internet of Things (IoT) payment standard that enables service-led business models. FINN offers safe, autonomous transactions for smart devices.
We believe our software offers tremendous business opportunities. However, at heart, we are enthusiasts. Every member of our team has a passion for innovation. That’s why we love working on FINN.
[makethingsfinn.com](makethingsfinn.com)

