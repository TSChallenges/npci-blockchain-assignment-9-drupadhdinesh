#!/usr/bin/env bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function createSbi {
	infoln "Enrolling the CA admin"
	mkdir -p ../organizations/peerOrganizations/Sbi.example.com/

	export FABRIC_CA_CLIENT_HOME=${PWD}/../organizations/peerOrganizations/Sbi.example.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca-Sbi --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-Sbi.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-Sbi.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-Sbi.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-Sbi.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/../organizations/peerOrganizations/Sbi.example.com/msp/config.yaml"

	infoln "Registering peer0"
  set -x
	fabric-ca-client register --caname ca-Sbi --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-Sbi --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-Sbi --id.name Sbiadmin --id.secret Sbiadminpw --id.type admin --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
	fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-Sbi -M "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates, use --csr.hosts to specify Subject Alternative Names"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca-Sbi -M "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls" --enrollment.profile tls --csr.hosts peer0.Sbi.example.com --csr.hosts localhost --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null


  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/ca.crt"
  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/signcerts/"* "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/server.crt"
  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/keystore/"* "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/server.key"

  mkdir "${PWD}/../organizations/peerOrganizations/Sbi.example.com/msp/tlscacerts"
  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/Sbi.example.com/msp/tlscacerts/ca.crt"

  mkdir "${PWD}/../organizations/peerOrganizations/Sbi.example.com/tlsca"
  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/Sbi.example.com/tlsca/tlsca.Sbi.example.com-cert.pem"

  mkdir "${PWD}/../organizations/peerOrganizations/Sbi.example.com/ca"
  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/peers/peer0.Sbi.example.com/msp/cacerts/"* "${PWD}/../organizations/peerOrganizations/Sbi.example.com/ca/ca.Sbi.example.com-cert.pem"

  infoln "Generating the user msp"
  set -x
	fabric-ca-client enroll -u https://user1:user1pw@localhost:11054 --caname ca-Sbi -M "${PWD}/../organizations/peerOrganizations/Sbi.example.com/users/User1@Sbi.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/Sbi.example.com/users/User1@Sbi.example.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
	fabric-ca-client enroll -u https://Sbiadmin:Sbiadminpw@localhost:11054 --caname ca-Sbi -M "${PWD}/../organizations/peerOrganizations/Sbi.example.com/users/Admin@Sbi.example.com/msp" --tls.certfiles "${PWD}/fabric-ca/Sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/Sbi.example.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/Sbi.example.com/users/Admin@Sbi.example.com/msp/config.yaml"
}
