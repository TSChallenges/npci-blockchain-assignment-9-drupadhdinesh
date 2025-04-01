/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connect, Contract, hash } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import {
    certDirectoryPathRbi, certDirectoryPathHdfc, keyDirectoryPathRbi, keyDirectoryPathHdfc, newGrpcConnection, newIdentity,
    newSigner, peerEndpointRbi, peerEndpointHdfc, peerNameRbi, peerNameHdfc, tlsCertPathRbi, tlsCertPathHdfc
} from './connect';

const channelName = 'mychannel';
const chaincodeName = 'private';
const mspIdRbi = 'RbiMSP';
const mspIdHdfc = 'HdfcMSP';

const utf8Decoder = new TextDecoder();

// Collection names.
const RbiPrivateCollectionName = 'RbiMSPPrivateCollection';
const HdfcPrivateCollectionName = 'HdfcMSPPrivateCollection';

const RED = '\x1b[31m\n';
const RESET = '\x1b[0m';

// Use a unique key so that we can run multiple times.
const now = Date.now();
const assetID1 = `asset${String(now)}`;
const assetID2 = `asset${String(now + 1)}`;

async function main(): Promise<void> {
    const clientRbi = await newGrpcConnection(
        tlsCertPathRbi,
        peerEndpointRbi,
        peerNameRbi
    );

    const gatewayRbi = connect({
        client: clientRbi,
        identity: await newIdentity(certDirectoryPathRbi, mspIdRbi),
        signer: await newSigner(keyDirectoryPathRbi),
        hash: hash.sha256,
    });

    const clientHdfc = await newGrpcConnection(
        tlsCertPathHdfc,
        peerEndpointHdfc,
        peerNameHdfc
    );

    const gatewayHdfc = connect({
        client: clientHdfc,
        identity: await newIdentity(certDirectoryPathHdfc, mspIdHdfc),
        signer: await newSigner(keyDirectoryPathHdfc),
        hash: hash.sha256,
    });

    try {
        // Get the smart contract as an Rbi client.
        const contractRbi = gatewayRbi
            .getNetwork(channelName)
            .getContract(chaincodeName);

        // Get the smart contract as an Hdfc client.
        const contractHdfc = gatewayHdfc
            .getNetwork(channelName)
            .getContract(chaincodeName);

        console.log('\n~~~~~~~~~~~~~~~~ As Rbi Client ~~~~~~~~~~~~~~~~');

        // Create new assets on the ledger.
        await createAssets(contractRbi);

        // Read asset from the Rbi's private data collection with ID in the given range.
        await getAssetByRange(contractRbi);

        try {
            // Attempt to transfer asset without prior approval from Hdfc, transaction expected to fail.
            console.log('\nAttempt TransferAsset without prior AgreeToTransfer');
            await transferAsset(contractRbi, assetID1);
            doFail('TransferAsset transaction succeeded when it was expected to fail');
        } catch (e) {
            console.log('*** Received expected error:', e);
        }

        console.log('\n~~~~~~~~~~~~~~~~ As Hdfc Client ~~~~~~~~~~~~~~~~');

        // Read the asset by ID.
        await readAssetByID(contractHdfc, assetID1);

        // Make agreement to transfer the asset from Rbi to Hdfc.
        await agreeToTransfer(contractHdfc, assetID1);

        console.log('\n~~~~~~~~~~~~~~~~ As Rbi Client ~~~~~~~~~~~~~~~~');

        // Read transfer agreement.
        await readTransferAgreement(contractRbi, assetID1);

        // Transfer asset to Hdfc.
        await transferAsset(contractRbi, assetID1);

        // Again ReadAsset: results will show that the buyer identity now owns the asset.
        await readAssetByID(contractRbi, assetID1);

        // Confirm that transfer removed the private details from the Rbi collection.
        const RbiReadSuccess = await readAssetPrivateDetails(contractRbi, assetID1, RbiPrivateCollectionName);
        if (RbiReadSuccess) {
            doFail(`Asset private data still exists in ${RbiPrivateCollectionName}`);
        }

        console.log('\n~~~~~~~~~~~~~~~~ As Hdfc Client ~~~~~~~~~~~~~~~~');

        // Hdfc can read asset private details: Hdfc is owner, and private details exist in new owner's collection.
        const HdfcReadSuccess = await readAssetPrivateDetails(contractHdfc, assetID1, HdfcPrivateCollectionName);
        if (!HdfcReadSuccess) {
            doFail(`Asset private data not found in ${HdfcPrivateCollectionName}`);
        }

        try {
            console.log('\nAttempt DeleteAsset using non-owner organization');
            await deleteAsset(contractHdfc, assetID2);
            doFail('DeleteAsset transaction succeeded when it was expected to fail');
        } catch (e) {
            console.log('*** Received expected error:', e);
        }

        console.log('\n~~~~~~~~~~~~~~~~ As Rbi Client ~~~~~~~~~~~~~~~~');

        // Delete AssetID2 as Rbi.
        await deleteAsset(contractRbi, assetID2);

        // Trigger a purge of the private data for the asset.
        // The previous delete is optional if purge is used.
        await purgeAsset(contractRbi, assetID2);
    } finally {
        gatewayRbi.close();
        clientRbi.close();

        gatewayHdfc.close();
        clientHdfc.close();
    }
}

main().catch((error: unknown) => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createAssets(contract: Contract): Promise<void> {
    const assetType = 'ValuableAsset';

    console.log(`\n--> Submit Transaction: CreateAsset, ID: ${assetID1}`);

    const asset1Data = {
        objectType: assetType,
        assetID: assetID1,
        color: 'green',
        size: 20,
        appraisedValue: 100,
    };

    await contract.submit('CreateAsset', {
        transientData: { asset_properties: JSON.stringify(asset1Data) },
    });

    console.log('*** Transaction committed successfully');
    console.log(`\n--> Submit Transaction: CreateAsset, ID: ${assetID2}`);

    const asset2Data = {
        objectType: assetType,
        assetID: assetID2,
        color: 'blue',
        size: 35,
        appraisedValue: 727,
    };

    await contract.submit('CreateAsset', {
        transientData: { asset_properties: JSON.stringify(asset2Data) },
    });

    console.log('*** Transaction committed successfully');
}

async function getAssetByRange(contract: Contract): Promise<void> {
    // GetAssetByRange returns assets on the ledger with ID in the range of startKey (inclusive) and endKey (exclusive).
    console.log(`\n--> Evaluate Transaction: GetAssetByRange from ${RbiPrivateCollectionName}`);

    const resultBytes = await contract.evaluateTransaction(
        'GetAssetByRange',
        assetID1,
        `asset${String(now + 2)}`
    );

    const resultString = utf8Decoder.decode(resultBytes);
    if (!resultString) {
        doFail('Received empty query list for GetAssetByRange');
    }
    const result: unknown = JSON.parse(resultString);
    console.log('*** Result:', result);
}

async function readAssetByID(contract: Contract, assetID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: ReadAsset, ID: ${assetID}`);
    const resultBytes = await contract.evaluateTransaction('ReadAsset', assetID);

    const resultString = utf8Decoder.decode(resultBytes);
    if (!resultString) {
        doFail('Received empty result for ReadAsset');
    }
    const result: unknown = JSON.parse(resultString);
    console.log('*** Result:', result);
}

async function agreeToTransfer(contract: Contract, assetID: string): Promise<void> {
    // Buyer from Hdfc agrees to buy the asset.
    // To purchase the asset, the buyer needs to agree to the same value as the asset owner.

    const dataForAgreement = { assetID, appraisedValue: 100 };
    console.log('\n--> Submit Transaction: AgreeToTransfer, payload:', dataForAgreement);

    await contract.submit('AgreeToTransfer', {
        transientData: { asset_value: JSON.stringify(dataForAgreement) },
    });

    console.log('*** Transaction committed successfully');
}

async function readTransferAgreement(contract: Contract, assetID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: ReadTransferAgreement, ID: ${assetID}`);

    const resultBytes = await contract.evaluateTransaction(
        'ReadTransferAgreement',
        assetID
    );

    const resultString = utf8Decoder.decode(resultBytes);
    if (!resultString) {
        doFail('Received no result for ReadTransferAgreement');
    }
    const result: unknown = JSON.parse(resultString);
    console.log('*** Result:', result);
}

async function transferAsset(contract: Contract, assetID: string): Promise<void> {
    console.log(`\n--> Submit Transaction: TransferAsset, ID: ${assetID}`);

    const buyerDetails = { assetID, buyerMSP: mspIdHdfc };
    await contract.submit('TransferAsset', {
        transientData: { asset_owner: JSON.stringify(buyerDetails) },
    });

    console.log('*** Transaction committed successfully');
}

async function deleteAsset(contract: Contract, assetID: string): Promise<void> {
    console.log('\n--> Submit Transaction: DeleteAsset, ID:', assetID);
    const dataForDelete = { assetID };
    await contract.submit('DeleteAsset', {
        transientData: { asset_delete: JSON.stringify(dataForDelete) },
    });

    console.log('*** Transaction committed successfully');
}

async function purgeAsset(contract: Contract, assetID: string): Promise<void> {
    console.log('\n--> Submit Transaction: PurgeAsset, ID:', assetID);
    const dataForPurge = { assetID };
    await contract.submit('PurgeAsset', {
        transientData: { asset_purge: JSON.stringify(dataForPurge) },
    });

    console.log('*** Transaction committed successfully');
}

async function readAssetPrivateDetails(contract: Contract, assetID: string, collectionName: string): Promise<boolean> {
    console.log(`\n--> Evaluate Transaction: ReadAssetPrivateDetails from ${collectionName}, ID: ${assetID}`);

    const resultBytes = await contract.evaluateTransaction(
        'ReadAssetPrivateDetails',
        collectionName,
        assetID
    );

    const resultJson = utf8Decoder.decode(resultBytes);
    if (!resultJson) {
        console.log('*** No result');
        return false;
    }
    const result: unknown = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return true;
}

export function doFail(msgString: string): never {
    console.error(`${RED}\t${msgString}${RESET}`);
    throw new Error(msgString);
}
