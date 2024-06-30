import React from "react";
import { Divider, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import axios from "axios";
import { MentionsInput, Mention } from "react-mentions";
import { display } from "@mui/system";
/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allUser: [],
      user: {},
      photosInfo: [],
      commentInput: "",
      toggleLike: false,
      isLoading: true,
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleNewComment = this.handleNewComment.bind(this);
    this.suggestedUsers = this.suggestedUsers.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleToggleLike = this.handleToggleLike.bind(this);
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.fetchUsers(`/user/${userId}`, `/photosOfUser/${userId}`);
  }

  fetchUsers(userUrl, photoUrl) {
    const req1 = axios.get(userUrl);
    const req2 = axios.get(photoUrl);
    const req3 = axios.get("/user/list");
    axios
      .all([req1, req2, req3])
      .then(
        axios.spread((...response) => {
          this.setState({
            user: response[0].data,
            photosInfo: response[1].data,
            allUser: response[2].data,
          });
          this.fetchPhotos();
        })
      )
      .catch((error) => {
        console.log(error);
      });
  }
  fetchPhotos() {
    this.state.allUser.forEach((user) => {
      axios
        .get(`/photosOfUser/${user._id}`)
        .then((response) => {
          user.photos = response.data;
          this.setState({ isLoading: false });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
  // Sugges hiih hereglegchdiin zurag, neriin medeelel
  suggestedUsers(query) {
    if (!query) {
      return this.state.allUser.map((user) => {
        let obj = {
          id: user._id,
          display: `${user.first_name} ${user.last_name}`,
        };
        if (user.photos[0]) {
          obj.avatar = `../../images/${user.photos[0].file_name}`;
        } else {
          obj.avatar = null;
        }
        return obj;
      });
    }
    return this.state.allUser
      .filter((user) =>
        user.first_name.toLowerCase().includes(query.toLowerCase())
      )
      .map((user) => {
        let obj = {
          id: user._id,
          display: `${user.first_name} ${user.last_name}`,
        };
        if (user.photos[0]) {
          obj.avatar = `../../images/${user.photos[0].file_name}`;
        } else {
          obj.avatar = null;
        }
        return obj;
      });
  }
  renderSuggestion(user, search, display) {
    return (
      <div className="mention-suggestion">
        <img src={user.avatar} alt="avatar" className="mention-avatar" />
        <span>{display}</span>
      </div>
    );
  }
  // Bichsen commentoos mention hiisen hereglegchiig link bolgoh
  parseMentions(comment) {
    if (!comment) {
      return;
    }
    let re = /@\[(.*?)]\((.*?)\)/g;
    let lastIndex = 0;
    let parts = [];
    comment.replaceAll(re, (match, name, id, index) => {
      if (!match) {
        return;
      }
      parts.push(comment.slice(lastIndex, index));
      parts.push(
        <Link to={"/users/" + id} className="link">
          {name}
        </Link>
      );
      lastIndex = index + match.length;
    });
    parts.push(comment.slice(lastIndex));
    const resultText = (
      <>
        {parts.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </>
    );
    return resultText;
  }
  // Zuragnii comment buriig butsaana.
  loadComment(comments, photoId) {
    let commentList = [];
    if (comments) {
      comments.forEach((el) => {
        commentList.push(
          <Typography key={el._id}>
            <Link to={"/users/" + el.user._id} className="link">
              {el.user.first_name} {el.user.last_name}:
            </Link>
            {this.parseMentions(el.comment)} /<b>{el.date_time}</b>/
            <button
              className="btn-comment"
              onClick={(event) => this.handleDeleteComment(event, el, photoId)}
            >
              Delete Comment
            </button>
          </Typography>
        );
      });
      return commentList;
    }
    return "";
  }
  handleInput(event, photoId) {
    this.setState((prevState) => ({
      commentInput: {
        ...prevState.commentInput,
        [photoId]: event.target.value,
      },
    }));
  }
  // Shine comment
  handleNewComment(event, photo_id, user_id) {
    if (this.state.commentInput !== "") {
      event.preventDefault();
      axios
        .post(`/commentsOfPhoto/${photo_id}`, {
          description: this.state.commentInput[photo_id],
        })
        .then((response) => {
          console.log(response);
          this.setState((prevState) => ({
            commentInput: {
              ...prevState.commentInput,
              [photo_id]: "",
            },
          }));
          window.location.assign("/photo-share.html#/login");
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  // Delete photo
  handleDeletePhoto(event, photoId, user_id) {
    event.preventDefault();
    axios
      .post(`/photos/delete/${photoId}`, { user_id: user_id })
      .then((response) => {
        console.log(response);
        let location = window.location.href;
        window.location.assign("/photo-share.html#/users");
        setTimeout(() => {
          window.location.assign(location);
        }, 20);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  handleDeleteComment(event, comment, photoId) {
    event.preventDefault();
    axios
      .post("/comment/delete", { comment, photoId })
      .then((response) => {
        console.log(response);
        let location = window.location.href;
        window.location.assign("/photo-share.html#/users");
        setTimeout(() => {
          window.location.assign(location);
        }, 30);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  handleLike(event, photoId) {
    event.preventDefault();
    axios
      .post(`/photo/like/${photoId}`)
      .then((response) => {
        let location = window.location.href;
        window.location.assign("/photo-share.html#/users");
        setTimeout(() => {
          window.location.assign(location);
        }, 50);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  handleToggleLike(event) {
    if (this.state.toggleLike) {
      this.setState({ toggleLike: false });
    } else {
      this.setState({ toggleLike: true });
    }
  }
  showLikedUsers(photo) {
    return (
      <div className="showLikedUsers">
        {photo.likedUsers.map((id) => {
          return (
            <Link key={id} to={"/users/" + id} className="likedUsersLink">
              {this.state.allUser.map((user) => {
                if (user._id === id) {
                  return (
                    <div key={id} className="likedUserList">
                      <img
                        src={`../../images/${user.photos[0].file_name}`}
                        alt=""
                        className="likedUserPhoto"
                      />
                      {`${user.first_name} ${user.last_name}`}
                    </div>
                  );
                }
              })}
            </Link>
          );
        })}
      </div>
    );
  }
  checkCurrentUserLiked(photo) {
    if (localStorage["user"] !== "null") {
      var user = localStorage.getItem("user");
      user = JSON.parse(JSON.parse(JSON.stringify(user)));
      var currentUserId = user._id;
    }
    let isLiked = false;
    photo.likedUsers.forEach((id) => {
      {
        if (id === currentUserId) {
          isLiked = true;
        }
      }
    });
    return isLiked;
  }
  renderPhotos() {
    let i = 0;
    return this.state.photosInfo.map((photo) => {
      if (i++ !== this.state.photosInfo.length - 1) {
        let isLiked = this.checkCurrentUserLiked(photo);
        return (
          <div key={photo._id} className="listItem">
            <img src={`../../images/${photo.file_name}`} alt="" />
            <div>
              <button
                onClick={(e) => this.handleLike(e, photo._id)}
                className={isLiked ? "bg-chocolate" : ""}
              >
                Like
              </button>
              <button
                style={{ marginLeft: "1rem" }}
                onClick={this.handleToggleLike}
              >
                {photo.numberOfLikes}
              </button>
              {this.state.toggleLike ? this.showLikedUsers(photo) : null}
            </div>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <b>Posted date:</b> {photo.date_time}
            </p>
            <div className="headerComment">Comments:</div>
            {this.loadComment(photo.comments, photo._id)}
            <MentionsInput
              value={this.state.commentInput[photo._id] || ""}
              onChange={(event) => this.handleInput(event, photo._id)}
              placeholder="Your comment"
              className="commentInput"
            >
              <Mention
                trigger="@"
                data={this.suggestedUsers}
                renderSuggestion={this.renderSuggestion}
                markup="@[__display__](__id__)"
              />
            </MentionsInput>
            <div style={{ display: "flex" }}>
              <button
                type="button"
                className="btn"
                onClick={(event) => this.handleNewComment(event, photo._id)}
              >
                Add comment
              </button>
              <button
                style={{ marginLeft: "0.5rem" }}
                type="button"
                className="btn"
                onClick={(event) =>
                  this.handleDeletePhoto(event, photo._id, photo.user_id)
                }
              >
                Delete Photo
              </button>
            </div>
            <Divider />
          </div>
        );
      }
    });
  }

  render() {
    return (
      <Typography variant="subtitle1">
        <Link to={"/users/" + this.state.user._id} className="back">
          Back
        </Link>
        <div className="headerName">
          {this.state.user.first_name} {this.state.user.last_name} photos
        </div>
        <div>{this.renderPhotos()}</div>
      </Typography>
    );
  }
}

export default UserPhotos;
