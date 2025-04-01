## Adding Sbi to the test network

You can use the `addSbi.sh` script to add another organization to the Fabric test network. The `addSbi.sh` script generates the Sbi crypto material, creates an Sbi organization definition, and adds Sbi to a channel on the test network.

You first need to run `./network.sh up createChannel` in the `test-network` directory before you can run the `addSbi.sh` script.

```
./network.sh up createChannel
cd addSbi
./addSbi.sh up
```

If you used `network.sh` to create a channel other than the default `mychannel`, you need pass that name to the `addSbi.sh` script.
```
./network.sh up createChannel -c channel1
cd addSbi
./addSbi.sh up -c channel1
```

You can also re-run the `addSbi.sh` script to add Sbi to additional channels.
```
cd ..
./network.sh createChannel -c channel2
cd addSbi
./addSbi.sh up -c channel2
```

For more information, use `./addSbi.sh -h` to see the `addSbi.sh` help text.
