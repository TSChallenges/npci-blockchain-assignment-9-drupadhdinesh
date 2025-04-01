#!/usr/bin/env bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ca/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ca/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=1
P0PORT=7051
CAPORT=5053
PEERPEM=./crypto-config/peerOrganizations/Rbi.example.com/msp/tlscacerts/tlsca.Rbi.example.com-cert.pem
CAPEM=./crypto-config/peerOrganizations/Rbi.example.com/ca/msp/cacerts/ca.Rbi.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ./crypto-config/peerOrganizations/Rbi.example.com/connection-Rbi.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ./crypto-config/peerOrganizations/Rbi.example.com/connection-Rbi.yaml

ORG=2
P0PORT=7054
CAPORT=5054
PEERPEM=./crypto-config/peerOrganizations/Hdfc.example.com/msp/tlscacerts/tlsca.Hdfc.example.com-cert.pem
CAPEM=./crypto-config/peerOrganizations/Hdfc.example.com/ca/msp/cacerts/ca.Hdfc.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ./crypto-config/peerOrganizations/Hdfc.example.com/connection-Hdfc.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ./crypto-config/peerOrganizations/Hdfc.example.com/connection-Hdfc.yaml
