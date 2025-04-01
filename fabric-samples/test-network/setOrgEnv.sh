#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0




# default to using Rbi
ORG=${1:-Rbi}

# Exit on first error, print all commands.
set -e
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_CA=${DIR}/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
PEER0_Rbi_CA=${DIR}/test-network/organizations/peerOrganizations/Rbi.example.com/tlsca/tlsca.Rbi.example.com-cert.pem
PEER0_Hdfc_CA=${DIR}/test-network/organizations/peerOrganizations/Hdfc.example.com/tlsca/tlsca.Hdfc.example.com-cert.pem
PEER0_Sbi_CA=${DIR}/test-network/organizations/peerOrganizations/Sbi.example.com/tlsca/tlsca.Sbi.example.com-cert.pem


if [[ ${ORG,,} == "Rbi" || ${ORG,,} == "digibank" ]]; then

   CORE_PEER_LOCALMSPID=RbiMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/Rbi.example.com/users/Admin@Rbi.example.com/msp
   CORE_PEER_ADDRESS=localhost:7051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/Rbi.example.com/tlsca/tlsca.Rbi.example.com-cert.pem

elif [[ ${ORG,,} == "Hdfc" || ${ORG,,} == "magnetocorp" ]]; then

   CORE_PEER_LOCALMSPID=HdfcMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/Hdfc.example.com/users/Admin@Hdfc.example.com/msp
   CORE_PEER_ADDRESS=localhost:9051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/Hdfc.example.com/tlsca/tlsca.Hdfc.example.com-cert.pem

else
   echo "Unknown \"$ORG\", please choose Rbi/Digibank or Hdfc/Magnetocorp"
   echo "For example to get the environment variables to set upa Hdfc shell environment run:  ./setOrgEnv.sh Hdfc"
   echo
   echo "This can be automated to set them as well with:"
   echo
   echo 'export $(./setOrgEnv.sh Hdfc | xargs)'
   exit 1
fi

# output the variables that need to be set
echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_CA=${ORDERER_CA}"
echo "PEER0_Rbi_CA=${PEER0_Rbi_CA}"
echo "PEER0_Hdfc_CA=${PEER0_Hdfc_CA}"
echo "PEER0_Sbi_CA=${PEER0_Sbi_CA}"

echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"

echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"
