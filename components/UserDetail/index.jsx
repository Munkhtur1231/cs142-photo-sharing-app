import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import axios from "axios";
/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
    };
  }

  // async fetchUsers() {
  //   const userId = this.props.match.params.userId;
  //   let data = await fetchModel(`/user/${userId}`);
  //   this.setState({ user: data.data });
  // }
  fetchUsers() {
    const userId = this.props.match.params.userId;
    let url = `user/${userId}`;
    axios
      .get(url)
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    this.fetchUsers();
  }

  componentDidUpdate(prevProps) {
    const curId = this.props.match.params.userId;
    const prevId = prevProps.match.params.userId;
    if (curId !== prevId) {
      this.fetchUsers();
    }
  }

  render() {
    const name = this.state.user.first_name + " " + this.state.user.last_name;
    return (
      <div>
        <Typography variant="body1" className="header">
          {name}
        </Typography>
        <Typography className="detail">
          <b>ID:</b> {this.state.user._id}
        </Typography>
        <Typography className="detail">
          <b>Location:</b> {this.state.user.location}
        </Typography>
        <Typography className="detail">
          <b>Description:</b> {this.state.user.description}
        </Typography>
        <Typography className="detail">
          <b>Occupation:</b> {this.state.user.occupation}
        </Typography>
        <Link to={"/photos/" + this.state.user._id} className="photoLink">
          Go to Photos
        </Link>
      </div>
    );
  }
}

export default UserDetail;
