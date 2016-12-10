import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './Header';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to ReactJS</h2>
            <p>Edited by Vlado</p>
        </div>
          <Navigation/>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
          <Footer/>
      </div>
    );
  }
}

export default App;
