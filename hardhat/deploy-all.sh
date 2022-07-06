#!/usr/bin/bash

export HOST=$(hostname)

npx hardhat deploy --export-all ../src/contracts/hardhat_contracts.json --network localhost --gasprice 1000000000 --reset > cont.txt
cat cont.txt
export CONTRACT=$(cat cont.txt | grep Chest | cut -d ' ' -f 7)

npx hardhat request-random-words --contract $CONTRACT --network localhost
npx hardhat request-random-words --contract $CONTRACT --network localhost
npx hardhat request-random-words --contract $CONTRACT --network localhost

npx hardhat send --amount 10 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --to 0xc0880c939d9561962405ACfF07aa83F9b55ABa30 --network localhost

cd subgraphs
envsubst < subgraph-template.yaml > subgraph.yaml
docker-compose down
sudo rm -rf data
# docker-compose up -d
# sleep 20 # wait
# yarn create-local
# yarn deploy-local
