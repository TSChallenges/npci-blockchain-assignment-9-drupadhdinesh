#!/usr/bin/env sh
#
# SPDX-License-Identifier: Apache-2.0
#
export PATH="${PWD}"/../../fabric/build/bin:"${PWD}"/../bin:"$PATH"

export crypto_dir=$PWD/crypto-config

export orderer_org_dir=${crypto_dir}/ordererOrganizations/example.com
export Rbi_dir=${crypto_dir}/peerOrganizations/Rbi.example.com
export Hdfc_dir=${crypto_dir}/peerOrganizations/Hdfc.example.com

export orderer1_dir=${orderer_org_dir}/orderers/orderer.example.com
export orderer2_dir=${orderer_org_dir}/orderers/orderer2.example.com
export orderer3_dir=${orderer_org_dir}/orderers/orderer3.example.com
export orderer4_dir=${orderer_org_dir}/orderers/orderer4.example.com
export orderer5_dir=${orderer_org_dir}/orderers/orderer5.example.com

export peer0Rbi_dir=${Rbi_dir}/peers/peer0.Rbi.example.com
export peer1Rbi_dir=${Rbi_dir}/peers/peer1.Rbi.example.com

export peer0Hdfc_dir=${Hdfc_dir}/peers/peer0.Hdfc.example.com
export peer1Hdfc_dir=${Hdfc_dir}/peers/peer1.Hdfc.example.com

export orderer_org_tls=${PWD}/data_ca/ordererca/ca/ca-cert.pem
export Rbi_tls=${PWD}/data_ca/Rbica/ca/ca-cert.pem
export Hdfc_tls=${PWD}/data_ca/Hdfcca/ca/ca-cert.pem

# import utilies
. ca/ca_utils.sh

######################################################################################
#  Create admin certificates for the CAs
######################################################################################

# Enroll CA Admin for ordererca
createEnrollment "5052" "admin" "adminpw" "" "${orderer_org_dir}/ca" "${orderer_org_tls}"

# Enroll CA Admin for Rbica
createEnrollment "5053" "admin" "adminpw" "Rbi" "${Rbi_dir}/ca" "${Rbi_tls}"

# Enroll CA Admin for Hdfcca
createEnrollment "5054" "admin" "adminpw" "Hdfc" "${Hdfc_dir}/ca" "${Hdfc_tls}"


######################################################################################
#  Create admin and user certificates for the Organizations
######################################################################################

# Enroll Admin certificate for the ordering service org
registerAndEnroll "5052" "osadmin" "osadminpw" "admin" "" "${orderer_org_dir}/users/Admin@example.com" "${orderer_org_dir}" "${orderer_org_tls}"

# Enroll Admin certificate for Rbi
registerAndEnroll "5053" "Rbiadmin" "Rbiadminpw" "admin" "Rbi" "${Rbi_dir}/users/Admin@Rbi.example.com" "${Rbi_dir}" "${Rbi_tls}"

# Enroll User certificate for Rbi
registerAndEnroll "5053" "Rbiuser1" "Rbiuser1pw" "client" "Rbi" "${Rbi_dir}/users/User1@Rbi.example.com" "${Rbi_dir}" "${Rbi_tls}"

# Enroll Admin certificate for Hdfc
registerAndEnroll "5054" "Hdfcadmin" "Hdfcadminpw" "admin" "Hdfc" "${Hdfc_dir}/users/Admin@Hdfc.example.com" "${Hdfc_dir}" "${Hdfc_tls}"

# Enroll User certificate for Rbi
registerAndEnroll "5054" "Hdfcuser1" "Hdfcuser1pw" "client" "Hdfc" "${Hdfc_dir}/users/User1@Hdfc.example.com" "${Hdfc_dir}" "${Hdfc_tls}"

######################################################################################
#  Create the certificates for the Ordering Organization
######################################################################################

# Create enrollment and TLS certificates for orderer1
registerAndEnroll "5052" "orderer1" "orderer1pw" "orderer" "" "${orderer1_dir}" "${orderer_org_dir}" "${orderer_org_tls}"

# Create enrollment and TLS certificates for orderer2
registerAndEnroll "5052" "orderer2" "orderer2pw" "orderer" "" "${orderer2_dir}" "${orderer_org_dir}" "${orderer_org_tls}"

# Create enrollment and TLS certificates for orderer3
registerAndEnroll "5052" "orderer3" "orderer3pw" "orderer" "" "${orderer3_dir}" "${orderer_org_dir}" "${orderer_org_tls}"

# Create enrollment and TLS certificates for orderer4
registerAndEnroll "5052" "orderer4" "orderer4pw" "orderer" "" "${orderer4_dir}" "${orderer_org_dir}" "${orderer_org_tls}"

# Create enrollment and TLS certificates for orderer5
registerAndEnroll "5052" "orderer5" "orderer5pw" "orderer" "" "${orderer5_dir}" "${orderer_org_dir}" "${orderer_org_tls}"


######################################################################################
#  Create the certificates for Rbi
######################################################################################

# Create enrollment and TLS certificates for peer0Rbi
registerAndEnroll "5053" "Rbipeer0" "Rbipeer0pw" "peer" "Rbi" "${peer0Rbi_dir}" "${Rbi_dir}" "${Rbi_tls}"

# Create enrollment and TLS certificates for peer1Rbi
registerAndEnroll "5053" "Rbipeer1" "Rbipeer1pw" "peer" "Rbi" "${peer1Rbi_dir}" "${Rbi_dir}" "${Rbi_tls}"


######################################################################################
#  Create the certificates for Hdfc
######################################################################################

# Create enrollment and TLS certificates for peer0Hdfc
registerAndEnroll "5054" "Hdfcpeer0" "Hdfcpeer0pw" "peer" "Hdfc" "${peer0Hdfc_dir}" "${Hdfc_dir}" "${Hdfc_tls}"

# Create enrollment and TLS certificates for peer1Hdfc
registerAndEnroll "5054" "Hdfcpeer1" "Hdfcpeer1pw" "peer" "Hdfc" "${peer1Hdfc_dir}" "${Hdfc_dir}" "${Hdfc_tls}"


######################################################################################
#  Create the Membership Service Providers (MSPs)
######################################################################################

# Create the MSP for the Orderering Org
createMSP "ordererca" "" "${orderer_org_dir}"

# Create the MSP for Rbi
createMSP "Rbica" "Rbi" "${Rbi_dir}"

# Create the MSP for Hdfc
createMSP "Hdfcca" "Hdfc" "${Hdfc_dir}"

######################################################################################
#  Generate CCP files for Rbi and Hdfc
######################################################################################

# Generate CCP files for Rbi and Hdfc"
echo "Generating CCP files for Rbi and Hdfc"
./ca/ccp-generate.sh
echo "Generated CCP files for Rbi and Hdfc"
