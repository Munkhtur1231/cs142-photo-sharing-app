import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import axios from "axios";
/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      photosInfo: [],
      isLoading: true,
    };
    this.pollingInterval = null;
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    axios
      .get("user/list")
      .then((response) => {
        const users = response.data;
        const userPromises = users.map((user) =>
          axios.get(`/photosOfUser/${user._id}`).then((response) => {
            const photos = response.data;
            user.numbers = photos[photos.length - 1];
            return user;
          })
        );

        Promise.all(userPromises)
          .then((updatedUsers) => {
            this.setState({ users: updatedUsers, isLoading: false });
          })
          .catch((error) => {
            console.log(error);
            this.setState({ isLoading: false });
          });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false });
      });

    this.pollingInterval = setInterval(this.fetchUsersData, 10000);
  }
  componentWillUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
  userNamesList() {
    return this.state.users.map((el) => {
      return (
        <div key={el._id}>
          <ListItem button={true} to={`/users/${el._id}`} component={Link}>
            <ListItemText primary={`${el.first_name} ${el.last_name}`} />
            {el.lastActivity === "Posted a photo" ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="lastActivity">{el.lastActivity}</div>
                <img
                  className="lastActivityPhoto"
                  src={`../../images/${el.latestPhoto}`}
                  alt=""
                />
              </div>
            ) : (
              <div className="lastActivity">{el.lastActivity}</div>
            )}
            <div className="box bg-green">{el.numbers.numberOfPhotos}</div>
            <div className="box bg-red">{el.numbers.numberOfComments}</div>
          </ListItem>
          <Divider />
        </div>
      );
    });
  }
  render() {
    if (this.state.isLoading) {
      return <div className="App">Loading...</div>;
    }
    return (
      <div>
        <Typography>
          User Name List
          <span className="lastActivityHeader">Last Activities</span>
        </Typography>

        <List component="nav">{this.userNamesList()}</List>
      </div>
    );
  }
}

export default UserList;
