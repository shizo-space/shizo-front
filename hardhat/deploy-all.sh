#!/usr/bin/bash

export HOST=$(hostname)

export CONTRACT=$(npx hardhat deploy --export-all ../src/contracts/hardhat_contracts.json --network localhost --gasprice 10000000000000 --reset | grep Chest | cut -d ' ' -f 7)

npx hardhat request-random-words --contract $CONTRACT --network localhost
npx hardhat request-random-words --contract $CONTRACT --network localhost
npx hardhat request-random-words --contract $CONTRACT --network localhost

cd subgraphs
envsubst < subgraph-template.yaml > subgraph.yaml
docker-compose up -d
sleep 5 # wait
yarn create-local
yarn deploy-local
