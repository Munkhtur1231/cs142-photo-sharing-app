import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister/index.jsx";
import Register from "./components/LoginRegister/register.jsx";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let userIsLoggedIn;
    if (localStorage.getItem("userIsLoggedIn") === "true") {
      userIsLoggedIn = true;
    } else {
      userIsLoggedIn = false;
    }
    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                {userIsLoggedIn ? <UserList /> : null}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper
                className="cs142-main-grid-item"
                style={{ height: "100%" }}
              >
                <Switch>
                  <Route path="/login" component={LoginRegister} />
                  <Route path="/register" component={Register} />
                  {userIsLoggedIn ? (
                    <Route
                      path="/users/:userId"
                      render={(props) => <UserDetail {...props} />}
                    />
                  ) : (
                    <Redirect path="/users/:userId" to={"/login"} />
                  )}
                  {userIsLoggedIn ? (
                    <Route
                      path="/photos/:userId"
                      render={(props) => <UserPhotos {...props} />}
                    />
                  ) : (
                    <Redirect path="/photos/:userId" to={"/login"} />
                  )}
                  {userIsLoggedIn ? (
                    <Route path="/users" component={UserList} />
                  ) : (
                    <Redirect path="/users" to={"/login"} />
                  )}
                </Switch>
                <Redirect to={"/login"} />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
