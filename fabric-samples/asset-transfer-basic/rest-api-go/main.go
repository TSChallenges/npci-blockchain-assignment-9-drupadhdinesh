package main

import (
	"fmt"
	"rest-api-go/web"
)

func main() {
	//Initialize setup for Rbi
	cryptoPath := "../../test-network/organizations/peerOrganizations/Rbiexample.com"
	orgConfig := web.OrgSetup{
		OrgName:      "Rbi,
		MSPID:        "RbiP",
		CertPath:     cryptoPath + "/users/User1@Rbiexample.com/msp/signcerts/cert.pem",
		KeyPath:      cryptoPath + "/users/User1@Rbiexample.com/msp/keystore/",
		TLSCertPath:  cryptoPath + "/peers/peer0.Rbiexample.com/tls/ca.crt",
		PeerEndpoint: "dns:///localhost:7051",
		GatewayPeer:  "peer0.Rbiexample.com",
	}

	orgSetup, err := web.Initialize(orgConfig)
	if err != nil {
		fmt.Println("Error initializing setup for Rbi ", err)
	}
	web.Serve(web.OrgSetup(*orgSetup))
}
