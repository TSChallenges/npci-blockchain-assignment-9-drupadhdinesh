/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connect, hash } from '@hyperledger/fabric-gateway';

import { newGrpcConnection, newIdentity, newSigner, tlsCertPathRbi, peerEndpointRbi, peerNameRbi, certDirectoryPathRbi, mspIdRbi, keyDirectoryPathRbi, tlsCertPathHdfc, peerEndpointHdfc, peerNameHdfc, certDirectoryPathHdfc, mspIdHdfc, keyDirectoryPathHdfc } from './connect';
import { ContractWrapper } from './contractWrapper';
import { RED, RESET } from './utils';

const channelName = 'mychannel';
const chaincodeName = 'secured';

// Use a random key so that we can run multiple times
const now = Date.now().toString();
let assetKey: string;

async function main(): Promise<void> {

    // The gRPC client connection from Rbi should be shared by all Gateway connections to this endpoint.
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

    // The gRPC client connection from Hdfc should be shared by all Gateway connections to this endpoint.
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

        // Get the smart contract from the network for Rbi.
        const contractRbi = gatewayRbi.getNetwork(channelName).getContract(chaincodeName);
        const contractWrapperRbi  = new ContractWrapper(contractRbi, mspIdRbi);

        // Get the smart contract from the network for Hdfc.
        const contractHdfc = gatewayHdfc.getNetwork(channelName).getContract(chaincodeName);
        const contractWrapperHdfc  = new ContractWrapper(contractHdfc, mspIdHdfc);

        // Create an asset by organization Rbi, this only requires the owning organization to endorse.
        assetKey = await contractWrapperRbi.createAsset(mspIdRbi,
            `Asset owned by ${mspIdRbi} is not for sale`, { ObjectType: 'asset_properties', Color: 'blue', Size: 35 });

        // Read the public details by Rbi.
        await contractWrapperRbi.readAsset(assetKey, mspIdRbi);

        // Read the public details by Hdfc.
        await contractWrapperHdfc.readAsset(assetKey, mspIdRbi);

        // Rbi should be able to read the private data details of the asset.
        await contractWrapperRbi.getAssetPrivateProperties(assetKey, mspIdRbi);

        // Hdfc is not the owner and does not have the private details, read expected to fail.
        try {
            await contractWrapperHdfc.getAssetPrivateProperties(assetKey, mspIdRbi);
        } catch (e) {
            console.log(`${RED}*** Successfully caught the failure: getAssetPrivateProperties - ${String(e)}${RESET}`);
        }

        // Rbi updates the assets public description.
        await contractWrapperRbi.changePublicDescription({assetId: assetKey,
            ownerOrg: mspIdRbi,
            publicDescription: `Asset ${assetKey} owned by ${mspIdRbi} is for sale`});

        // Read the public details by Rbi.
        await contractWrapperRbi.readAsset(assetKey, mspIdRbi);

        // Read the public details by Hdfc.
        await contractWrapperHdfc.readAsset(assetKey, mspIdRbi);

        // This is an update to the public state and requires the owner(Rbi) to endorse and sent by the owner org client (Rbi).
        // Since the client is from Hdfc, which is not the owner, this will fail.
        try{
            await contractWrapperHdfc.changePublicDescription({assetId: assetKey,
                ownerOrg: mspIdRbi,
                publicDescription: `Asset ${assetKey} owned by ${mspIdHdfc} is NOT for sale`});
        } catch(e) {
            console.log(`${RED}*** Successfully caught the failure: changePublicDescription - ${String(e)}${RESET}`);
        }

        // Read the public details by Rbi.
        await contractWrapperRbi.readAsset(assetKey, mspIdRbi);

        // Read the public details by Hdfc.
        await contractWrapperHdfc.readAsset(assetKey, mspIdRbi);

        // Agree to a sell by Rbi.
        await contractWrapperRbi.agreeToSell({
            assetId: assetKey,
            price: 110,
            tradeId: now,
        });

        // Check the private information about the asset from Hdfc. Rbi would have to send Hdfc asset details,
        // so the hash of the details may be checked by the chaincode.
        await contractWrapperHdfc.verifyAssetProperties(assetKey, {color:'blue', size:35});

        // Agree to a buy by Hdfc.
        await contractWrapperHdfc.agreeToBuy( {assetId: assetKey,
            price: 100,
            tradeId: now}, { ObjectType: 'asset_properties', Color: 'blue', Size: 35 });

        // Rbi should be able to read the sale price of this asset.
        await contractWrapperRbi.getAssetSalesPrice(assetKey, mspIdRbi);

        // Hdfc has not set a sale price and this should fail.
        try{
            await contractWrapperHdfc.getAssetSalesPrice(assetKey, mspIdRbi);
        } catch(e) {
            console.log(`${RED}*** Successfully caught the failure: getAssetSalesPrice - ${String(e)}${RESET}`);
        }

        // Rbi has not agreed to buy so this should fail.
        try{
            await contractWrapperRbi.getAssetBidPrice(assetKey, mspIdHdfc);
        } catch(e) {
            console.log(`${RED}*** Successfully caught the failure: getAssetBidPrice - ${String(e)}${RESET}`);
        }
        // Hdfc should be able to see the price it has agreed.
        await contractWrapperHdfc.getAssetBidPrice(assetKey, mspIdHdfc);

        // Rbi will try to transfer the asset to Hdfc
        // This will fail due to the sell price and the bid price are not the same.
        try{
            await contractWrapperRbi.transferAsset({ assetId: assetKey, price: 110, tradeId: now}, [ mspIdRbi, mspIdHdfc ], mspIdRbi, mspIdHdfc);
        } catch(e) {
            console.log(`${RED}*** Successfully caught the failure: transferAsset - ${String(e)}${RESET}`);
        }
        // Agree to a sell by Rbi, the seller will agree to the bid price of Hdfc.
        await contractWrapperRbi.agreeToSell({assetId:assetKey, price:100, tradeId:now});

        // Read the public details by  Rbi.
        await contractWrapperRbi.readAsset(assetKey, mspIdRbi);

        // Read the public details by  Hdfc.
        await contractWrapperHdfc.readAsset(assetKey, mspIdRbi);

        // Rbi should be able to read the private data details of the asset.
        await contractWrapperRbi.getAssetPrivateProperties(assetKey, mspIdRbi);

        // Rbi should be able to read the sale price of this asset.
        await contractWrapperRbi.getAssetSalesPrice(assetKey, mspIdRbi);

        // Hdfc should be able to see the price it has agreed.
        await contractWrapperHdfc.getAssetBidPrice(assetKey, mspIdHdfc);

        // Hdfc user will try to transfer the asset to Rbi.
        // This will fail as the owner is Rbi.
        try{
            await contractWrapperHdfc.transferAsset({ assetId: assetKey, price: 100, tradeId: now}, [ mspIdRbi, mspIdHdfc ], mspIdRbi, mspIdHdfc);
        } catch(e) {
            console.log(`${RED}*** Successfully caught the failure: transferAsset - ${String(e)}${RESET}`);
        }

        // Rbi will transfer the asset to Hdfc.
        // This will now complete as the sell price and the bid price are the same.
        await contractWrapperRbi.transferAsset({ assetId: assetKey, price: 100, tradeId: now}, [ mspIdRbi, mspIdHdfc ], mspIdRbi, mspIdHdfc);

        // Read the public details by  Rbi.
        await contractWrapperRbi.readAsset(assetKey, mspIdHdfc);

        // Read the public details by  Hdfc.
        await contractWrapperHdfc.readAsset(assetKey, mspIdHdfc);

        // Hdfc should be able to read the private data details of this asset.
        await contractWrapperHdfc.getAssetPrivateProperties(assetKey, mspIdHdfc);

        // Rbi should not be able to read the private data details of this asset, expected to fail.
        try{
            await contractWrapperRbi.getAssetPrivateProperties(assetKey, mspIdHdfc);
        } catch(e) {
            console.log(`${RED}*** Successfully caught the failure: getAssetPrivateProperties - ${String(e)}${RESET}`);
        }

        // This is an update to the public state and requires only the owner to endorse.
        // Hdfc wants to indicate that the items is no longer for sale.
        await contractWrapperHdfc.changePublicDescription( {assetId: assetKey, ownerOrg: mspIdHdfc, publicDescription: `Asset ${assetKey} owned by ${mspIdHdfc} is NOT for sale`});

        // Read the public details by Rbi.
        await contractWrapperRbi.readAsset(assetKey, mspIdHdfc);

        // Read the public details by Hdfc.
        await contractWrapperHdfc.readAsset(assetKey, mspIdHdfc);

    } finally {
        gatewayRbi.close();
        gatewayHdfc.close();
        clientRbi.close();
        clientHdfc.close();
    }
}

main().catch((error: unknown) => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});
