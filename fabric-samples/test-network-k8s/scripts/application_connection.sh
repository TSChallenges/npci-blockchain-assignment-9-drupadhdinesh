#!/usr/bin/env bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function app_one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function app_json_ccp {
  local ORG=$1
  local PP=$(one_line_pem $2)
  local CP=$(one_line_pem $3)
  sed -e "s/\${ORG}/$ORG/" \
      -e "s#\${PEERPEM}#$PP#" \
      -e "s#\${CAPEM}#$CP#" \
      scripts/ccp-template.json
}

function app_id {
  local MSP=$1
  local CERT=$(one_line_pem $2)
  local PK=$(one_line_pem $3)

  sed -e "s#\${CERTIFICATE}#$CERT#" \
      -e "s#\${PRIVATE_KEY}#$PK#" \
      -e "s#\${MSPID}#$MSP#" \
      scripts/appuser.id.template
}

function construct_application_configmap() {
  push_fn "Constructing application connection profiles"

  ENROLLMENT_DIR=${TEMP_DIR}/enrollments
  CHANNEL_MSP_DIR=${TEMP_DIR}/channel-msp

  mkdir -p build/application/wallet
  mkdir -p build/application/gateways

  local peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/Rbi/msp/tlscacerts/tlsca-signcert.pem
  local ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/Rbi/msp/cacerts/ca-signcert.pem

  echo "$(json_ccp 1 $peer_pem $ca_pem)" > build/application/gateways/Rbi_ccp.json

  peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/Hdfc/msp/tlscacerts/tlsca-signcert.pem
  ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/Hdfc/msp/cacerts/ca-signcert.pem

  echo "$(json_ccp 2 $peer_pem $ca_pem)" > build/application/gateways/Hdfc_ccp.json

  pop_fn

  push_fn "Getting Application Identities"

  local cert=$ENROLLMENT_DIR/Rbi/users/Rbiadmin/msp/signcerts/cert.pem
  local pk=$ENROLLMENT_DIR/Rbi/users/Rbiadmin/msp/keystore/key.pem

  echo "$(app_id RbiMSP $cert $pk)" > build/application/wallet/appuser_Rbi.id

  local cert=$ENROLLMENT_DIR/Hdfc/users/Hdfcadmin/msp/signcerts/cert.pem
  local pk=$ENROLLMENT_DIR/Hdfc/users/Hdfcadmin/msp/keystore/key.pem

  echo "$(app_id HdfcMSP $cert $pk)" > build/application/wallet/appuser_Hdfc.id

  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-tls-v1-map\" with TLS certificates for the application"
  kubectl -n $NS delete configmap app-fabric-tls-v1-map || true
  kubectl -n $NS create configmap app-fabric-tls-v1-map --from-file=$CHANNEL_MSP_DIR/peerOrganizations/Rbi/msp/tlscacerts
  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-ids-v1-map\" with identities for the application"
  kubectl -n $NS delete configmap app-fabric-ids-v1-map || true
  kubectl -n $NS create configmap app-fabric-ids-v1-map --from-file=./build/application/wallet
  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-ccp-v1-map\" with ConnectionProfile for the application"
  kubectl -n $NS delete configmap app-fabric-ccp-v1-map || true
  kubectl -n $NS create configmap app-fabric-ccp-v1-map --from-file=./build/application/gateways
  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-Rbi-v1-map\" with Organization 1 information for the application"

cat <<EOF > build/app-fabric-Rbi-v1-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-fabric-Rbi-v1-map
data:
  fabric_channel: ${CHANNEL_NAME}
  fabric_contract: ${CHAINCODE_NAME}
  fabric_wallet_dir: /fabric/application/wallet
  fabric_gateway_hostport: Rbi-peer-gateway-svc:7051
  fabric_gateway_sslHostOverride: Rbi-peer-gateway-svc
  fabric_user: appuser_Rbi
  fabric_gateway_tlsCertPath: /fabric/tlscacerts/tlsca-signcert.pem
EOF

  kubectl -n $NS apply -f build/app-fabric-Rbi-v1-map.yaml

  # todo: could add the second org here

  pop_fn
}


function application_connection() {

 construct_application_configmap

log
 log "For k8s applications:"
 log "Config Maps created for the application"
 log "To deploy your application updated the image name and issue these commands"
 log ""
 log "kubectl -n $NS apply -f kube/application-deployment.yaml"
 log "kubectl -n $NS rollout status deploy/application-deployment"
 log
 log "For non-k8s applications:"
 log "ConnectionPrfiles are in ${PWD}/build/application/gateways"
 log "Identities are in  ${PWD}/build/application/wallets"
 log
}