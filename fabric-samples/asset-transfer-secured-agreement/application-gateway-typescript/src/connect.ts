/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

// MSP Id's of Organizations
export const mspIdRbi = 'RbiMSP';
export const mspIdHdfc = 'HdfcMSP';

// Path to Rbi crypto materials.
export const cryptoPathRbi = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'Rbi.example.com');

// Path to user private key directory.
export const keyDirectoryPathRbi = path.resolve(cryptoPathRbi, 'users', 'User1@Rbi.example.com', 'msp', 'keystore');

// Path to user certificate.
export const certDirectoryPathRbi = path.resolve(cryptoPathRbi, 'users', 'User1@Rbi.example.com', 'msp', 'signcerts');

// Path to peer tls certificate.
export const tlsCertPathRbi = path.resolve(cryptoPathRbi, 'peers', 'peer0.Rbi.example.com', 'tls', 'ca.crt');

// Path to Hdfc crypto materials.
export const cryptoPathHdfc = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network',
    'organizations',
    'peerOrganizations',
    'Hdfc.example.com'
);

// Path to Hdfc user private key directory.
export const keyDirectoryPathHdfc = path.resolve(
    cryptoPathHdfc,
    'users',
    'User1@Hdfc.example.com',
    'msp',
    'keystore'
);

// Path to Hdfc user certificate.
export const certDirectoryPathHdfc = path.resolve(
    cryptoPathHdfc,
    'users',
    'User1@Hdfc.example.com',
    'msp',
    'signcerts'
);

// Path to Hdfc peer tls certificate.
export const tlsCertPathHdfc = path.resolve(
    cryptoPathHdfc,
    'peers',
    'peer0.Hdfc.example.com',
    'tls',
    'ca.crt'
);
// Gateway peer endpoint.
export const peerEndpointRbi = 'localhost:7051';
export const peerEndpointHdfc = 'localhost:9051';

// Gateway peer container name.
export const peerNameRbi = 'peer0.Rbi.example.com';
export const peerNameHdfc = 'peer0.Hdfc.example.com';

// Collection Names
export const RbiPrivateCollectionName = 'RbiMSPPrivateCollection';
export const HdfcPrivateCollectionName = 'HdfcMSPPrivateCollection';

export async function newGrpcConnection(
    tlsCertPath: string,
    peerEndpoint: string,
    peerName: string
): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerName,
    });
}

export async function newIdentity(certDirectoryPath: string, mspId: string): Promise<Identity> {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

export async function newSigner(keyDirectoryPath: string): Promise<Signer> {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

async function getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}
