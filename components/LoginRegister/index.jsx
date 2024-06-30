import React from "react";
import axios from "axios";
import { AppBar, Toolbar, Typography, Grid, Form, Input } from "@mui/material";
import "./styles.css";

class MyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      password: "",
      loginMessage: "",
    };
    this.handleChangeLoginName = this.handleChangeLoginName.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeToRegister = this.handleChangeToRegister.bind(this);
  }
  handleChangeLoginName(event) {
    this.setState({ loginName: event.target.value });
  }
  handleChangePassword(event) {
    this.setState({ password: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.loginName !== "" && this.state.password !== "") {
      axios
        .post("/admin/login", {
          login_name: this.state.loginName,
          password: this.state.password,
        })
        .then((response) => {
          this.setState({ loginMessage: data });
          localStorage.setItem("userIsLoggedIn", "true");
          let data = response.data;
          data = JSON.stringify(data);
          localStorage.setItem("user", data);
          window.location.reload();
          // window.location.href = `/photo-share.html#/users/${response.data._id}`;
          console.log("logged in");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  handleChangeToRegister(event) {
    event.preventDefault();
    window.location.assign("/photo-share.html#/register");
  }
  render() {
    let userIsLoggedIn;
    if (localStorage.getItem("userIsLoggedIn") === "true") {
      userIsLoggedIn = true;
    } else {
      userIsLoggedIn = false;
    }
    if (!userIsLoggedIn) {
      return (
        <div className="container">
          <form onSubmit={this.handleSubmit}>
            <h3>Login</h3>
            <label>
              Name:
              <input
                type="text"
                value={this.state.inputValue}
                onChange={this.handleChangeLoginName}
              ></input>
            </label>
            <label>
              Password:
              <input type="password" onChange={this.handleChangePassword} />
            </label>
            <div className="btn-container">
              <button type="submit">Submit</button>
              <button type="button" onClick={this.handleChangeToRegister}>
                Don't Have An Account?
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      return null;
    }
  }
}
export default MyForm;
