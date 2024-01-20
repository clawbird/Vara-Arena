# Vara-Arena

## Summary

- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Contributing](#contributing)

## Prerequisites

* Node 18.x
* Docker
* NPM -- note that `yarn` package manager is not supported
* Rust Nightly 2023-09-18

## Quickstart

* Install Rust and build
  ```sh
  RUST_NIGHTLY="2023-09-18"
  rustup toolchain install "nightly-${RUST_NIGHTLY}" && \
  rustup component add rust-src rustfmt clippy --toolchain "nightly-${RUST_NIGHTLY}" && \
  rustup target add wasm32-unknown-unknown --toolchain "nightly-${RUST_NIGHTLY}" && \
  rustup toolchain install "nightly-${RUST_NIGHTLY}" --profile minimal --component rustfmt
  rustup default "nightly-${RUST_NIGHTLY}" && \
  rustup override set "nightly-${RUST_NIGHTLY}" && \
  cargo version && \
  rustc --version && \
  cargo test && \
  cargo install --git=https://github.com/rustwasm/wasm-pack && \
  cargo build --release
  ```
* [Follow the Vara-Arena Indexer Instructions](./indexer/README.md)
* Optional: Install Node.js without NVM and skip the next couple of steps that use NVM instead.
* Install NVM https://nodejs.org/en/download/package-manager#nvm.
   ```sh
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```
* install Node.js 18 using NVM
   ```sh
   nvm install 18 && nvm use 18
   ```
* Install Subsquid https://docs.subsquid.io/squid-cli/installation/

* Change directory into the indexer/ subdirectory
  ```sh
  cd indexer
  ```
* Generate .env file from .env.example
  ```
  cp .env.example .env
  ```
* Obtain Subsquid Cloud deployment key `DEPLOYMENT_KEY` from https://app.subsquid.io/
* Add your Subsquid deployment key that you obtained from https://app.subsquid.io/squids as the value of `DEPLOYMENT_KEY` in the .env file
* Source the .env file
  ```sh
  source .env
  ```
* Update Subsquid CLI secrets https://docs.subsquid.io/squid-cli/secrets/
  ```sh
  sqd secrets:set RPC_ENDPOINT
  ```
* Paste `wss://testnet-archive.vara.network`
* Press CMD+D to save/exit
* Check configured Subsquid CLI secrets
  ```sh
  sqd secrets:ls
  ```
* FIXME: It does not appear to read Subsquid secret that has been set with `sqd secrets:set RPC_ENDPOINT` and then pasting `wss://testnet-archive.vara.network` and pressing CTRL+D twice to save it. Due to this issue it was necessary to hard-code the URL in squid.yaml for it to work
* Login to Subsquid Cloud using the Subsquid CLI using a script that reads your deployment key from the .env file. Note: This avoids the security risk of entering the deployment key directly in the terminal
  ```sh
  ./sqd-auth.sh
  ```
* Run the following in the indexer/ subdirectory:
  ```sh
  npm i -g @subsquid/cli@latest
  sqd --version
  sqd --help
  npm i
  sqd up
  sqd build
  sqd run .
  docker ps -a
  ```
* View  GraphiQL playground available at http://localhost:4350/graphql
* Optional:
  * View Postgresql DB by entering the docker container's shell and running the following commands
    ```sh
    docker exec -it --user=root indexer-db-1 /bin/bash

    root@123:/# pg_isready
    /var/run/postgresql:5432 - accepting connections
    root@123:/# psql -U postgres
    postgres=# \l
    ```

* Open a new terminal window. Change to to frontend/ subdirectory.
  ```sh
  cd frontend
  ```
* Install dependencies and build the frontend:
  ```sh
  npm i
  npm run predeploy
  ```

## Contributing

* Vara-Arena tasks: https://github.com/orgs/ImpulseDAO/projects/2/views/1
