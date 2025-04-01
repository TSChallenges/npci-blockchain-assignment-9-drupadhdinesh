/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPRbi, buildCCPHdfc, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const mspRbi = 'RbiMSP';
const mspHdfc = 'HdfcMSP';

async function connectToRbiCA(UserID) {
	console.log('\n--> Register and enrolling new user');
	const ccpRbi = buildCCPRbi();
	const caRbiClient = buildCAClient(FabricCAServices, ccpRbi, 'ca.Rbi.example.com');

	const walletPathRbi = path.join(__dirname, 'wallet/Rbi');
	const walletRbi = await buildWallet(Wallets, walletPathRbi);

	await registerAndEnrollUser(caRbiClient, walletRbi, mspRbi, UserID, 'Rbi.department1');

}

async function connectToHdfcCA(UserID) {
	console.log('\n--> Register and enrolling new user');
	const ccpHdfc = buildCCPHdfc();
	const caHdfcClient = buildCAClient(FabricCAServices, ccpHdfc, 'ca.Hdfc.example.com');

	const walletPathHdfc = path.join(__dirname, 'wallet/Hdfc');
	const walletHdfc = await buildWallet(Wallets, walletPathHdfc);

	await registerAndEnrollUser(caHdfcClient, walletHdfc, mspHdfc, UserID, 'Hdfc.department1');

}
async function main() {

	if (process.argv[2] === undefined && process.argv[3] === undefined) {
		console.log('Usage: node registerEnrollUser.js org userID');
		process.exit(1);
	}

	const org = process.argv[2];
	const userId = process.argv[3];

	try {

		if (org === 'Rbi' || org === 'Rbi') {
			await connectToRbiCA(userId);
		}
		else if (org === 'Hdfc' || org === 'Hdfc') {
			await connectToHdfcCA(userId);
		} else {
			console.log('Usage: node registerEnrollUser.js org userID');
			console.log('Org must be Rbi or Hdfc');
		}
	} catch (error) {
		console.error(`Error in enrolling admin: ${error}`);
		process.exit(1);
	}
}

main();
