/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/**
 * A test application to show state based endorsements operations with a running
 * asset-transfer-sbe chaincode with discovery.
 *   -- How to submit a transaction
 *   -- How to query
 *   -- How to limit the organizations involved in a transaction
 *
 * To see the SDK workings, try setting the logging to show on the console before running
 *        export HFC_LOGGING='{"debug":"console"}'
 */

// pre-requisites:
// - fabric-sample two organization test-network setup with two peers, ordering service,
//   and 2 certificate authorities
//         ===> from directory /fabric-samples/test-network
//         ./network.sh up createChannel -ca
// - Use any of the asset-transfer-sbe chaincodes deployed on the channel "mychannel"
//   with the chaincode name of "sbe". The following deploy command will package,
//   install, approve, and commit the javascript chaincode, all the actions it takes
//   to deploy a chaincode to a channel.
//         ===> from directory /fabric-samples/test-network
//         ./network.sh deployCC -ccn sbe -ccp ../asset-transfer-sbe/chaincode-typescript/ -ccl typescript
// - Be sure that node.js is installed
//         ===> from directory /fabric-samples/asset-transfer-sbe/application-javascript
//         node -v
// - npm installed code dependencies
//         ===> from directory /fabric-samples/asset-transfer-sbe/application-javascript
//         npm install
// - to run this test application
//         ===> from directory /fabric-samples/asset-transfer-sbe/application-javascript
//         node app.js

// NOTE: If you see an error like these:
/*

   Error in setup: Error: DiscoveryService: mychannel error: access denied

   OR

   Failed to register user : Error: fabric-ca request register failed with errors [[ { code: 20, message: 'Authentication failure' } ]]

	*/
// Delete the /fabric-samples/asset-transfer-sbe/application-javascript/wallet directory
// and retry this application.
//
// The certificate authority must have been restarted and the saved certificates for the
// admin and application user are not valid. Deleting the wallet store will force these to be reset
// with the new certificate authority.
//

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPRbi, buildCCPHdfc, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'sbe';

const Rbi = 'RbiMSP';
const Hdfc = 'HdfcMSP';
const RbiUserId = 'appUser1';
const HdfcUserId = 'appUser2';

async function initGatewayForRbi() {
	console.log('\n--> Fabric client user & Gateway init: Using Rbi identity to Rbi Peer');
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpRbi = buildCCPRbi();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caRbiClient = buildCAClient(FabricCAServices, ccpRbi, 'ca.Rbi.example.com');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathRbi = path.join(__dirname, 'wallet', 'Rbi');
	const walletRbi = await buildWallet(Wallets, walletPathRbi);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caRbiClient, walletRbi, Rbi);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caRbiClient, walletRbi, Rbi, RbiUserId, 'Rbi.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayRbi = new Gateway();
		//connect using Discovery enabled
		await gatewayRbi.connect(ccpRbi,
			{ wallet: walletRbi, identity: RbiUserId, discovery: { enabled: true, asLocalhost: true } });

		return gatewayRbi;
	} catch (error) {
		console.error(`Error in connecting to gateway for Rbi: ${error}`);
		process.exit(1);
	}
}

async function initGatewayForHdfc() {
	console.log('\n--> Fabric client user & Gateway init: Using Hdfc identity to Hdfc Peer');
	const ccpHdfc = buildCCPHdfc();
	const caHdfcClient = buildCAClient(FabricCAServices, ccpHdfc, 'ca.Hdfc.example.com');

	const walletPathHdfc = path.join(__dirname, 'wallet', 'Hdfc');
	const walletHdfc = await buildWallet(Wallets, walletPathHdfc);

	await enrollAdmin(caHdfcClient, walletHdfc, Hdfc);
	await registerAndEnrollUser(caHdfcClient, walletHdfc, Hdfc, HdfcUserId, 'Hdfc.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayHdfc = new Gateway();
		await gatewayHdfc.connect(ccpHdfc,
			{ wallet: walletHdfc, identity: HdfcUserId, discovery: { enabled: true, asLocalhost: true } });

		return gatewayHdfc;
	} catch (error) {
		console.error(`Error in connecting to gateway for Hdfc: ${error}`);
		process.exit(1);
	}
}

function checkAsset(org, assetKey, resultBuffer, value, ownerOrg) {
	let asset;
	if (resultBuffer) {
		asset = JSON.parse(resultBuffer.toString('utf8'));
	}

	if (asset && value) {
		if (asset.Value === value && asset.OwnerOrg === ownerOrg) {
			console.log(`*** Result from ${org} - asset ${asset.ID} has value of ${asset.Value} and owned by ${asset.OwnerOrg}`);
		} else {
			console.log(`*** Failed from ${org} - asset ${asset.ID} has value of ${asset.Value} and owned by ${asset.OwnerOrg}`);
		}
	} else if (!asset && value === 0 ) {
		console.log(`*** Success from ${org} - asset ${assetKey} does not exist`);
	} else {
		console.log('*** Failed - asset read failed');
	}
}

async function readAssetByBothOrgs(assetKey, value, ownerOrg, contractRbi, contractHdfc) {
	if (value) {
		console.log(`\n--> Evaluate Transaction: ReadAsset, - ${assetKey} should have a value of ${value} and owned by ${ownerOrg}`);
	} else {
		console.log(`\n--> Evaluate Transaction: ReadAsset, - ${assetKey} should not exist`);
	}
	let resultBuffer;
	resultBuffer = await contractRbi.evaluateTransaction('ReadAsset', assetKey);
	checkAsset('Rbi', assetKey, resultBuffer, value, ownerOrg);
	resultBuffer = await contractHdfc.evaluateTransaction('ReadAsset', assetKey);
	checkAsset('Hdfc', assetKey, resultBuffer, value, ownerOrg);
}

// This application uses fabric-samples/test-network based setup and the companion chaincode
// For this illustration, both Rbi & Hdfc client identities will be used, however
// notice they are used by two different "gateway"s to simulate two different running
// applications from two different organizations.
async function main() {
	try {
		// use a random key so that we can run multiple times
		const assetKey = `asset-${Math.floor(Math.random() * 100) + 1}`;

		/** ******* Fabric client init: Using Rbi identity to Rbi Peer ******* */
		const gatewayRbi = await initGatewayForRbi();
		const networkRbi = await gatewayRbi.getNetwork(channelName);
		const contractRbi = networkRbi.getContract(chaincodeName);

		/** ******* Fabric client init: Using Hdfc identity to Hdfc Peer ******* */
		const gatewayHdfc = await initGatewayForHdfc();
		const networkHdfc = await gatewayHdfc.getNetwork(channelName);
		const contractHdfc = networkHdfc.getContract(chaincodeName);

		try {
			let transaction;

			try {
				// Create an asset by organization Rbi, this will require that both organization endorse.
				// The endorsement will be handled by Discovery, since the gateway was connected with discovery enabled.
				console.log(`\n--> Submit Transaction: CreateAsset, ${assetKey} as Rbi - endorsed by Rbi and Hdfc`);
				await contractRbi.submitTransaction('CreateAsset', assetKey, '100', 'Tom');
				console.log('*** Result: committed, now asset will only require Rbi to endorse');
			} catch (createError) {
				console.log(`*** Failed: create - ${createError}`);
				process.exit(1);
			}

			await readAssetByBothOrgs(assetKey, 100, Rbi, contractRbi, contractHdfc);

			try {
				// Since the gateway is using discovery we should limit the organizations used by
				// discovery to endorse. This way we only have to know the organization and not
				// the actual peers that may be active at any given time.
				console.log(`\n--> Submit Transaction: UpdateAsset ${assetKey}, as Rbi - endorse by Rbi`);
				transaction = contractRbi.createTransaction('UpdateAsset');
				transaction.setEndorsingOrganizations(Rbi);
				await transaction.submit(assetKey, '200');
				console.log('*** Result: committed');
			} catch (updateError) {
				console.log(`*** Failed: update - ${updateError}`);
				process.exit(1);
			}

			await readAssetByBothOrgs(assetKey, 200, Rbi, contractRbi, contractHdfc);

			try {
				// Submit a transaction to make an update to the asset that has a key-level endorsement policy
				// set to only allow Rbi to make updates. The following example will not use the "setEndorsingOrganizations"
				// to limit the organizations that will do the endorsement, this means that it will be sent to all
				// organizations in the chaincode endorsement policy. When Rbi endorses, the transaction will be committed
				// if Hdfc endorses or not.
				console.log(`\n--> Submit Transaction: UpdateAsset ${assetKey}, as Rbi - endorse by Rbi and Hdfc`);
				transaction = contractRbi.createTransaction('UpdateAsset');
				await transaction.submit(assetKey, '300');
				console.log('*** Result: committed - because Rbi and Hdfc both endorsed, while only the Rbi endorsement was required and checked');
			} catch (updateError) {
				console.log(`*** Failed: update - ${updateError}`);
				process.exit(1);
			}

			await readAssetByBothOrgs(assetKey, 300, Rbi, contractRbi, contractHdfc);

			try {
				// Again submit the change to both Organizations by not using "setEndorsingOrganizations". Since only
				// Rbi is required to approve, the transaction will be committed.
				console.log(`\n--> Submit Transaction: UpdateAsset ${assetKey}, as Hdfc - endorse by Rbi and Hdfc`);
				transaction = contractHdfc.createTransaction('UpdateAsset');
				await transaction.submit(assetKey, '400');
				console.log('*** Result: committed - because Rbi was on the discovery list, Hdfc did not endorse');
			} catch (updateError) {
				console.log(`*** Failed: update - ${updateError}`);
				process.exit(1);
			}

			await readAssetByBothOrgs(assetKey, 400, Rbi, contractRbi, contractHdfc);

			try {
				// Try to update by sending only to Hdfc, since the state-based-endorsement says that
				// Rbi is the only organization allowed to update, the transaction will fail.
				console.log(`\n--> Submit Transaction: UpdateAsset ${assetKey}, as Hdfc - endorse by Hdfc`);
				transaction = contractHdfc.createTransaction('UpdateAsset');
				transaction.setEndorsingOrganizations(Hdfc);
				await transaction.submit(assetKey, '500');
				console.log('*** Failed: committed - this should have failed to endorse and commit');
			} catch (updateError) {
				console.log(`*** Successfully caught the error: \n    ${updateError}`);
			}

			await readAssetByBothOrgs(assetKey, 400, Rbi, contractRbi, contractHdfc);

			try {
				// Make a change to the state-based-endorsement policy making Hdfc the owner.
				console.log(`\n--> Submit Transaction: TransferAsset ${assetKey}, as Rbi - endorse by Rbi`);
				transaction = contractRbi.createTransaction('TransferAsset');
				transaction.setEndorsingOrganizations(Rbi);
				await transaction.submit(assetKey, 'Henry', Hdfc);
				console.log('*** Result: committed');
			} catch (transferError) {
				console.log(`*** Failed: transfer - ${transferError}`);
				process.exit(1);
			}

			await readAssetByBothOrgs(assetKey, 400, Hdfc, contractRbi, contractHdfc);

			try {
				// Make sure that Hdfc can now make updates, notice how the transaction has limited the
				// endorsement to only Hdfc.
				console.log(`\n--> Submit Transaction: UpdateAsset ${assetKey}, as Hdfc - endorse by Hdfc`);
				transaction = contractHdfc.createTransaction('UpdateAsset');
				transaction.setEndorsingOrganizations(Hdfc);
				await transaction.submit(assetKey, '600');
				console.log('*** Result: committed');
			} catch (updateError) {
				console.log(`*** Failed: update - ${updateError}`);
				process.exit(1);
			}

			await readAssetByBothOrgs(assetKey, 600, Hdfc, contractRbi, contractHdfc);

			try {
				// With Hdfc now the owner and the state-based-endorsement policy only allowing organization Hdfc
				// to make updates, a transaction only to Rbi will fail.
				console.log(`\n--> Submit Transaction: UpdateAsset ${assetKey}, as Rbi - endorse by Rbi`);
				transaction = contractRbi.createTransaction('UpdateAsset');
				transaction.setEndorsingOrganizations(Rbi);
				await transaction.submit(assetKey, '700');
				console.log('*** Failed: committed - this should have failed to endorse and commit');
			} catch (updateError) {
				console.log(`*** Successfully caught the error: \n    ${updateError}`);
			}

			await readAssetByBothOrgs(assetKey, 600, Hdfc, contractRbi, contractHdfc);

			try {
				// With Hdfc the owner and the state-based-endorsement policy only allowing organization Hdfc
				// to make updates, a transaction to delete by Rbi will fail.
				console.log(`\n--> Submit Transaction: DeleteAsset ${assetKey}, as Rbi - endorse by Rbi`);
				transaction = contractRbi.createTransaction('DeleteAsset');
				transaction.setEndorsingOrganizations(Rbi);
				await transaction.submit(assetKey);
				console.log('*** Failed: committed - this should have failed to endorse and commit');
			} catch (updateError) {
				console.log(`*** Successfully caught the error: \n    ${updateError}`);
			}

			try {
				// With Hdfc the owner and the state-based-endorsement policy only allowing organization Hdfc
				// to make updates, a transaction to delete by Hdfc will succeed.
				console.log(`\n--> Submit Transaction: DeleteAsset ${assetKey}, as Hdfc - endorse by Hdfc`);
				transaction = contractHdfc.createTransaction('DeleteAsset');
				transaction.setEndorsingOrganizations(Hdfc);
				await transaction.submit(assetKey);
				console.log('*** Result: committed');
			} catch (deleteError) {
				console.log(`*** Failed: delete - ${deleteError}`);
				process.exit(1);
			}

			// The asset should now be deleted, both orgs should not be able to read it
			try {
				await readAssetByBothOrgs(assetKey, 0, Hdfc, contractRbi, contractHdfc);
			} catch (readDeleteError) {
				console.log(`*** Successfully caught the error: ${readDeleteError}`);
			}

		} catch (runError) {
			console.error(`Error in transaction: ${runError}`);
			if (runError.stack) {
				console.error(runError.stack);
			}
			process.exit(1);
		} finally {
			// Disconnect from the gateway peer when all work for this client identity is complete
			gatewayRbi.disconnect();
			gatewayHdfc.disconnect();
		}
	} catch (error) {
		console.error(`Error in setup: ${error}`);
		if (error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

main();
