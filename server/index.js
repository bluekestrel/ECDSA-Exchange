const express = require('express');
const cors = require('cors');
const EC = require('elliptic').ec;

const app = express();
const ec = new EC('secp256k1');
const port = 3042;
const INIT_BALANCE_LEN = 3; // arbitrarily set to 3

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

function random_balance(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generate_balances_and_keys() {
  let balances = [];
  let keys = [];
  for (let i = 0; i < INIT_BALANCE_LEN; i++) {
    // Create the public/private key pair, and generate a balance
    const new_key = ec.genKeyPair();
    const pubkey = new_key.getPublic().encode('hex');
    const privkey = new_key.getPrivate().toString(16);
    const init_balance = random_balance(10, 100);

    balances.push({
      'id': pubkey,
      'balance': init_balance
    });
    keys.push({
      'publickey' : pubkey,
      'privatekey': privkey
    });
  }

  return {balances, keys};
}

/*
const balances = {
  "1": 100,
  "2": 50,
  "3": 75,
}
*/

function print_accounts() {
  console.log("\nAvailable Accounts\n====================");
  for (let i = 0; i < balances.length; i++) {
    let str_to_print = `(${i}) ${balances[i].id} (${balances[i].balance} ETH)`;
    console.log(str_to_print);
  }

  console.log("\nPrivate Keys\n====================");
  for (let i = 0; i < keys.length; i++) {
    let str_to_print = `(${i}) ${keys[i].privatekey}`
    console.log(str_to_print);
  }
}

let {balances, keys} = generate_balances_and_keys();

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount; // double + ?
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // TODO: can generate balances here or I guess just outside any of the express statements as well,
  //       but need to log the account 'id' i.e. public key w/ balance and corresponding private keys
  // (which means the private key needs to be saved off to some other value and mapped accordingly)

  print_accounts();
});
