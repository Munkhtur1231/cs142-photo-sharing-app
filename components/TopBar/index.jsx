import React from "react";
import { AppBar, Toolbar, Typography, Grid } from "@mui/material";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import axios from "axios";
/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: window.location.hash,
      users: [],
    };
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handlePhotoUpload = this.handlePhotoUpload.bind(this);
    this.handleDeleteUser = this.handleDeleteUser.bind(this);
  }

  changeUrl(newLocation) {
    this.setState({ location: newLocation });
  }

  componentDidMount() {
    this.fetchUsers("/user/list");
  }

  fetchUsers(url) {
    axios
      .get(url)
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleDeleteUser(event) {
    event.preventDefault();
    let password = prompt("Enter Password To Delete");
    axios
      .post("/user/delete", { password })
      .then((response) => {
        localStorage.setItem("userIsLoggedIn", "false");
        localStorage.setItem("user", "null");
        window.location.assign("/photo-share.html#/login");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  findUserName() {
    const str = this.state.location.split("/");
    const userId = str[str.length - 1];
    // const user = window.cs142models.userModel(userId);
    let user;
    for (let e of this.state.users) {
      if (userId === e._id) {
        user = e;
        break;
      }
    }
    const userName = user.first_name + " " + user.last_name;
    return userName;
  }

  changeHeader() {
    let str;
    if (this.state.location.startsWith("#/users")) {
      str = "Information of ";
    } else if (this.state.location.startsWith("#/photos")) {
      str = "Photos of ";
    } else {
      return "";
    }
    const userName = this.findUserName();
    return str + userName;
  }
  renderButtons() {
    return (
      <>
        <Grid item xs={2}>
          <label className="file-upload">
            <input type="file" onChange={this.handlePhotoUpload} />
            Upload
          </label>
        </Grid>
        <Grid item xs={3}>
          <button type="button" onClick={this.handleLogOut}>
            Log out
          </button>
        </Grid>
        <Grid item xs={3}>
          <button type="button" onClick={this.handleDeleteUser}>
            Delete User
          </button>
        </Grid>
      </>
    );
  }
  renderTime() {
    let date = new Date();
    date = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    return (
      <Grid item xs={3}>
        <b>{date}</b>
      </Grid>
    );
  }
  handleLogOut(event) {
    localStorage.setItem("userIsLoggedIn", "false");
    localStorage.setItem("user", "null");
    axios
      .post("/admin/logout", {})
      .then((response) => {
        console.log("logged out");
        window.location.assign("/photo-share.html#/login");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handlePhotoUpload(event) {
    event.preventDefault();
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      const domForm = new FormData();
      domForm.append("uploadedphoto", img);
      axios
        .post("/photos/new", domForm)
        .then((response) => {
          console.log(response);
          window.location.assign("/photo-share.html#/login");
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  render() {
    let userIsLoggedIn;
    if (localStorage.getItem("userIsLoggedIn") === "true") {
      userIsLoggedIn = true;
    } else {
      userIsLoggedIn = false;
    }
    document.body.addEventListener(
      "click",
      () => {
        requestAnimationFrame(() => {
          if (this.state.location !== window.location.hash) {
            this.changeUrl(window.location.hash);
          }
        });
      },
      true
    );
    if (!localStorage["user"]) {
      var name = "Please login";
    } else if (localStorage["user"] !== "null") {
      var user = localStorage.getItem("user");
      user = JSON.parse(JSON.parse(JSON.stringify(user)));
      var name = user.first_name + " " + user.last_name;
    } else {
      var name = "Please log in first";
    }
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Grid item xs={10}>
            <Typography variant="h5">{name}</Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="h6">{this.changeHeader()}</Typography>
          </Grid>
          {userIsLoggedIn ? this.renderButtons() : this.renderTime()}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
