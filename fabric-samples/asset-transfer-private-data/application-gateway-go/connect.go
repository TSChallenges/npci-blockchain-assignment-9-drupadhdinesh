/*
Copyright 2024 IBM All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"crypto/x509"
	"fmt"
	"os"
	"path"

	"github.com/hyperledger/fabric-gateway/pkg/identity"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

const (
	cryptoPathRbi         = "../../test-network/organizations/peerOrganizations/Rbi.example.com"
	keyDirectoryPathRbi   = cryptoPathRbi + "/users/User1@Rbi.example.com/msp/keystore"
	certDirectoryPathRbi  = cryptoPathRbi + "/users/User1@Rbi.example.com/msp/signcerts"
	tlsCertPathRbi        = cryptoPathRbi + "/peers/peer0.Rbi.example.com/tls/ca.crt"
	peerEndpointRbi       = "dns:///localhost:7051"
	peerNameRbi           = "peer0.Rbi.example.com"
	cryptoPathHdfc        = "../../test-network/organizations/peerOrganizations/Hdfc.example.com"
	keyDirectoryPathHdfc  = cryptoPathHdfc + "/users/User1@Hdfc.example.com/msp/keystore"
	certDirectoryPathHdfc = cryptoPathHdfc + "/users/User1@Hdfc.example.com/msp/signcerts"
	tlsCertPathHdfc       = cryptoPathHdfc + "/peers/peer0.Hdfc.example.com/tls/ca.crt"
	peerEndpointHdfc      = "dns:///localhost:9051"
	peerNameHdfc          = "peer0.Hdfc.example.com"
)

// newGrpcConnection creates a gRPC connection to the Gateway server.
func newGrpcConnection(tlsCertPath, peerEndpoint, peerName string) *grpc.ClientConn {
	certificatePEM, err := os.ReadFile(tlsCertPath)
	if err != nil {
		panic(fmt.Errorf("failed to read TLS certificate file: %w", err))
	}

	certificate, err := identity.CertificateFromPEM(certificatePEM)
	if err != nil {
		panic(err)
	}

	certPool := x509.NewCertPool()
	certPool.AddCert(certificate)
	transportCredentials := credentials.NewClientTLSFromCert(certPool, peerName)

	connection, err := grpc.NewClient(peerEndpoint, grpc.WithTransportCredentials(transportCredentials))
	if err != nil {
		panic(fmt.Errorf("failed to create gRPC connection: %w", err))
	}

	return connection
}

// newIdentity creates a client identity for this Gateway connection using an X.509 certificate.
func newIdentity(certDirectoryPath, mspId string) *identity.X509Identity {
	certificatePEM, err := readFirstFile(certDirectoryPath)
	if err != nil {
		panic(fmt.Errorf("failed to read certificate file: %w", err))
	}

	certificate, err := identity.CertificateFromPEM(certificatePEM)
	if err != nil {
		panic(err)
	}

	id, err := identity.NewX509Identity(mspId, certificate)
	if err != nil {
		panic(err)
	}

	return id
}

// newSign creates a function that generates a digital signature from a message digest using a private key.
func newSign(keyDirectoryPath string) identity.Sign {
	privateKeyPEM, err := readFirstFile(keyDirectoryPath)
	if err != nil {
		panic(fmt.Errorf("failed to read private key file: %w", err))
	}

	privateKey, err := identity.PrivateKeyFromPEM(privateKeyPEM)
	if err != nil {
		panic(err)
	}

	sign, err := identity.NewPrivateKeySign(privateKey)
	if err != nil {
		panic(err)
	}

	return sign
}

func readFirstFile(dirPath string) ([]byte, error) {
	dir, err := os.Open(dirPath)
	if err != nil {
		return nil, err
	}

	fileNames, err := dir.Readdirnames(1)
	if err != nil {
		return nil, err
	}

	return os.ReadFile(path.Join(dirPath, fileNames[0]))
}
