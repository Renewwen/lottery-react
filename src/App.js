import React, { Component } from 'react';
import './App.css';
import lottery from './lottery';

const { Harmony } = require('@harmony-js/core');
const { ChainID, ChainType } = require('@harmony-js/utils');

const url = 'http://localhost:9500';
const hmy = new Harmony(url, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyLocal
});
console.log(hmy);
console.log(lottery);

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call({
      gasLimit: '1000000',
      gasPrice: new hmy.utils.Unit('10').asGwei().toWei(),
    });
    const players = await lottery.methods.getPlayers().call({
      gasLimit: '1000000',
      gasPrice: new hmy.utils.Unit('10').asGwei().toWei(),
    });
    const balance = await hmy.blockchain.getBalance({address: lottery.address});

    this.setState({ manager, players, balance });
    console.log("--------- current state ---------");
    console.log(manager);
    console.log(players);
    console.log(balance);
  }

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction success...' })
    console.log(this.state.value);

    const mathWalletAccount = await window.harmony.getAccount();

    console.log('before enter().send');
    console.log(mathWalletAccount);

    const accountOne = hmy.wallet.addByPrivateKey("45e497bd45a9049bcb649016594489ac67b9f052a6cdf5cb74ee2427a60bf25e");

    await lottery.methods.enter().send({
      from: accountOne,
      value: new hmy.utils.Unit(this.state.value).asOne().toWei(),
      gasLimit: '1000000',
      gasPrice: new hmy.utils.Unit('10').asGwei().toWei(),
    });
    this.setState({ message: 'You have been entered!' })
  };

  onClick = async () => {
    const accountOne = hmy.wallet.addByPrivateKey("45e497bd45a9049bcb649016594489ac67b9f052a6cdf5cb74ee2427a60bf25e");

    this.setState({ message: 'Waiting on transaction success...' });
    await lottery.methods.pickWinner().send({
      from: accountOne,
      value: new hmy.utils.Unit('1').asOne().toWei(),
      gasLimit: '1000000',
      gasPrice: new hmy.utils.Unit('10').asGwei().toWei(),
    });
    this.setState({ message: 'A winner has been picked!' });
  };

  render() {
    return (
      <div>
        <h2> Lottery Contract </h2>
        <p> 
          This contract is managed by {this.state.manager}. <br />
          There are currently {this.state.players.length} people entered, <br />
        </p>

        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ONE to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />
        <h4> Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a Winner!</button>

        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  };
}

export default App;
