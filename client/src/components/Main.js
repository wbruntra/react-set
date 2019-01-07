import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'react-materialize';

class Main extends Component {
  state = {
    popupVisible: true,
  };

  togglePopup = () => {
    this.setState(state => ({
      popupVisible: !state.popupVisible,
    }));
  };

  render() {
    const { popupVisible } = this.state;
    return (
      <div className="container">
        <ul className="collection">
          <li className="collection-item">
            <Link to="/solo">Solo</Link>
          </li>
          <li className="collection-item">
            <Link to="/guest">Guest</Link>
          </li>
          <li className="collection-item">
            <Link to="/host">Host</Link>
          </li>
          <li className="collection-item">
            <p
              onClick={() => {
                // window.$('#popup').modal('open');
                this.togglePopup();
              }}
            >
              Hello world
            </p>
          </li>
        </ul>
        {/* <div className="modal popup-message" style={{display:popupVisible ? 'block' : 'none'}}>
          <div className="modal-content">
            <h4 className="center-align">Declaring...</h4>
          </div>
        </div> */}
        {/* <Modal id="popup">Hello, world!</Modal> */}
      </div>
    );
  }
}

export default Main;
