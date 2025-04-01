#!/usr/bin/env bash

#
# SPDX-License-Identifier: Apache-2.0
#

${AS_LOCAL_HOST:=true}

: "${TEST_NETWORK_HOME:=../..}"
: "${CONNECTION_PROFILE_FILE_Rbi:=${TEST_NETWORK_HOME}/organizations/peerOrganizations/Rbi.example.com/connection-Rbi.json}"
: "${CERTIFICATE_FILE_Rbi:=${TEST_NETWORK_HOME}/organizations/peerOrganizations/Rbi.example.com/users/User1@Rbi.example.com/msp/signcerts/User1@Rbi.example.com-cert.pem}"
: "${PRIVATE_KEY_FILE_Rbi:=${TEST_NETWORK_HOME}/organizations/peerOrganizations/Rbi.example.com/users/User1@Rbi.example.com/msp/keystore/priv_sk}"

: "${CONNECTION_PROFILE_FILE_Hdfc:=${TEST_NETWORK_HOME}/organizations/peerOrganizations/Hdfc.example.com/connection-Hdfc.json}"
: "${CERTIFICATE_FILE_Hdfc:=${TEST_NETWORK_HOME}/organizations/peerOrganizations/Hdfc.example.com/users/User1@Hdfc.example.com/msp/signcerts/User1@Hdfc.example.com-cert.pem}"
: "${PRIVATE_KEY_FILE_Hdfc:=${TEST_NETWORK_HOME}/organizations/peerOrganizations/Hdfc.example.com/users/User1@Hdfc.example.com/msp/keystore/priv_sk}"


cat << ENV_END > .env
# Generated .env file
# See src/config.ts for details of all the available configuration variables
#

LOG_LEVEL=info

PORT=3000

HLF_CERTIFICATE_Rbi="$(cat ${CERTIFICATE_FILE_Rbi} | sed -e 's/$/\\n/' | tr -d '\r\n')"

HLF_PRIVATE_KEY_Rbi="$(cat ${PRIVATE_KEY_FILE_Rbi} | sed -e 's/$/\\n/' | tr -d '\r\n')"

HLF_CERTIFICATE_Hdfc="$(cat ${CERTIFICATE_FILE_Hdfc} | sed -e 's/$/\\n/' | tr -d '\r\n')"

HLF_PRIVATE_KEY_Hdfc="$(cat ${PRIVATE_KEY_FILE_Hdfc} | sed -e 's/$/\\n/' | tr -d '\r\n')"

REDIS_PORT=6379

Rbi_APIKEY=$(uuidgen)

Hdfc_APIKEY=$(uuidgen)

ENV_END
 
if [ "${AS_LOCAL_HOST}" = "true" ]; then

cat << LOCAL_HOST_END >> .env
AS_LOCAL_HOST=true

HLF_CONNECTION_PROFILE_Rbi=$(cat ${CONNECTION_PROFILE_FILE_Rbi} | jq -c .)

HLF_CONNECTION_PROFILE_Hdfc=$(cat ${CONNECTION_PROFILE_FILE_Hdfc} | jq -c .)

REDIS_HOST=localhost

LOCAL_HOST_END

elif [ "${AS_LOCAL_HOST}" = "false" ]; then

cat << WITH_HOSTNAME_END >> .env
AS_LOCAL_HOST=false

HLF_CONNECTION_PROFILE_Rbi=$(cat ${CONNECTION_PROFILE_FILE_Rbi} | jq -c '.peers["peer0.Rbi.example.com"].url = "grpcs://peer0.Rbi.example.com:7051" | .certificateAuthorities["ca.Rbi.example.com"].url = "https://ca.Rbi.example.com:7054"')

HLF_CONNECTION_PROFILE_Hdfc=$(cat ${CONNECTION_PROFILE_FILE_Hdfc} | jq -c '.peers["peer0.Hdfc.example.com"].url = "grpcs://peer0.Hdfc.example.com:9051" | .certificateAuthorities["ca.Hdfc.example.com"].url = "https://ca.Hdfc.example.com:8054"')

REDIS_HOST=redis

WITH_HOSTNAME_END

fi
