/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPRbi, buildCCPHdfc, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const mspRbi = 'RbiMSP';
const mspHdfc = 'HdfcMSP';

async function connectToRbiCA () {
	console.log('\n--> Enrolling the Rbi CA admin');
	const ccpRbi = buildCCPRbi();
	const caRbiClient = buildCAClient(FabricCAServices, ccpRbi, 'ca.Rbi.example.com');

	const walletPathRbi = path.join(__dirname, 'wallet/Rbi');
	const walletRbi = await buildWallet(Wallets, walletPathRbi);

	await enrollAdmin(caRbiClient, walletRbi, mspRbi);
}

async function connectToHdfcCA () {
	console.log('\n--> Enrolling the Hdfc CA admin');
	const ccpHdfc = buildCCPHdfc();
	const caHdfcClient = buildCAClient(FabricCAServices, ccpHdfc, 'ca.Hdfc.example.com');

	const walletPathHdfc = path.join(__dirname, 'wallet/Hdfc');
	const walletHdfc = await buildWallet(Wallets, walletPathHdfc);

	await enrollAdmin(caHdfcClient, walletHdfc, mspHdfc);
}
async function main () {
	if (process.argv[2] === undefined) {
		console.log('Usage: node enrollAdmin.js Org');
		process.exit(1);
	}

	const org = process.argv[2];

	try {
		if (org === 'Rbi' || org === 'Rbi') {
			await connectToRbiCA();
		} else if (org === 'Hdfc' || org === 'Hdfc') {
			await connectToHdfcCA();
		} else {
			console.log('Usage: node registerUser.js org userID');
			console.log('Org must be Rbi or Hdfc');
		}
	} catch (error) {
		console.error(`Error in enrolling admin: ${error}`);
		process.exit(1);
	}
}

main();
