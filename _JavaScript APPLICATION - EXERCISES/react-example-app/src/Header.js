import React, { Component } from 'react';
import './Header.css';

class Navigation extends Component {
    render() {
        return (
            <div className="header">
                <a href="#">Home </a>
                <a href="#">Login </a>
                <a href="#">LogOut </a>
            </div>
        )
    }
}

export default Navigation;