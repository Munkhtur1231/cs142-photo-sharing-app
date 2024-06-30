import React from "react";
import axios from "axios";
import "./styles.css";

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_name: "",
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: "",
      password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLoginName = this.handleLoginName.bind(this);
    this.handleFirstName = this.handleFirstName.bind(this);
    this.handleLastName = this.handleLastName.bind(this);
    this.handleLocation = this.handleLocation.bind(this);
    this.handleDescription = this.handleDescription.bind(this);
    this.handleOccupation = this.handleOccupation.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeToLogin = this.handleChangeToLogin.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    if (
      this.state.first_name !== "" &&
      this.state.last_name !== "" &&
      this.state.password !== ""
    ) {
      axios
        .post("/user", {
          login_name: this.state.login_name,
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          location: this.state.location,
          description: this.state.description,
          occupation: this.state.occupation,
          password: this.state.password,
        })
        .then((response) => {
          console.log(response);
          window.location.assign("/photo-share.html#/login");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  handleLoginName(event) {
    this.setState({ login_name: event.target.value });
  }
  handleFirstName(event) {
    this.setState({ first_name: event.target.value });
  }
  handleLastName(event) {
    this.setState({ last_name: event.target.value });
  }
  handleLocation(event) {
    this.setState({ location: event.target.value });
  }
  handleDescription(event) {
    this.setState({ description: event.target.value });
  }
  handleOccupation(event) {
    this.setState({ occupation: event.target.value });
  }
  handleChangePassword(event) {
    this.setState({ password: event.target.value });
  }
  handleChangeToLogin(event) {
    event.preventDefault();
    window.location.assign("/photo-share.html#/login");
  }
  render() {
    return (
      <div className="container">
        <form onSubmit={this.handleSubmit}>
          <h3>Register</h3>
          <label>
            Login Name:
            <input type="text" onChange={this.handleLoginName}></input>
          </label>
          <label>
            First Name:
            <input type="text" onChange={this.handleFirstName}></input>
          </label>
          <label>
            Last Name:
            <input type="text" onChange={this.handleLastName}></input>
          </label>
          <label>
            Location:
            <input type="text" onChange={this.handleLocation}></input>
          </label>
          <label>
            description:
            <input type="text" onChange={this.handleDescription}></input>
          </label>
          <label>
            Occupation:
            <input type="text" onChange={this.handleOccupation}></input>
          </label>
          <label>
            Password:
            <input type="password" onChange={this.handleChangePassword} />
          </label>
          <div className="btn-container">
            <button type="submit">Submit</button>
            <button type="button" onClick={this.handleChangeToLogin}>
              Already Have An Account?
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default Register;
