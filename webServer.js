/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
let fs = require("fs");
let cs142password = require("./cs142password.js");
let processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const { request } = require("http");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
const cs142models = require("./modelData/photoApp.js").cs142models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  // response.status(200).send(cs142models.userListModel());
  User.find({}, function (err, info) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    } else {
      let userList = JSON.parse(JSON.stringify(info));
      let list = [];

      userList.forEach((e) => {
        let { _id, first_name, last_name, lastActivity, latestPhoto } = {
          ...e,
        };
        list.push({ _id, first_name, last_name, lastActivity, latestPhoto });
      });

      response.status(200).send(list);
    }
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  const id = request.params.id;
  User.findOne({ _id: id }, (err, info) => {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    } else {
      const user = JSON.parse(JSON.stringify(info));
      response.status(200).send(user);
    }
  });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  let id = request.params.id;

  Photo.find({ user_id: id }, (err, info) => {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    let photos = JSON.parse(JSON.stringify(info));
    let numberOfPhotos = photos.length;
    let numberOfComments = 0;
    // async photo
    async.each(photos, fetchPhotos, allDone);
    function fetchPhotos(photoFile, photoCallBack) {
      // async comment
      async.each(photoFile.comments, fetchComments, done);
      function fetchComments(comment, commentCallBack) {
        numberOfComments++;
        User.findOne({ _id: comment.user_id }, (err, info) => {
          if (!err) {
            comment.user = info;
            commentCallBack(err);
          }
        });
      }
      function done(err) {
        if (err) {
          console.log(err.message);
        }
        photoCallBack(err);
      }
    } // end of async comment
    function allDone(error) {
      if (error) {
        response.status(500).send(error.message);
      } else {
        let numbers = {
          numberOfComments: numberOfComments,
          numberOfPhotos: numberOfPhotos,
        };
        photos.push(numbers);
        response.json(photos);
      }
    } // end of async photo
  });
});

app.post("/admin/login", function (request, response) {
  var loginName = request.body.login_name;
  var password = request.body.password;
  User.findOne({ login_name: loginName }, (err, info) => {
    if (err) {
      console.log(err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (!info) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    let doesPasswordMatch = cs142password.doesPasswordMatch(
      info.password_digest,
      info.salt,
      password
    );
    // console.log(info);
    if (info === null || info === undefined || !doesPasswordMatch) {
      console.log("User login name or password not found.");
      response.status(400).send("Not found");
      return;
    }
    // console.log(info);
    info.lastActivity = "User logged in";
    info.save();
    request.session.loginUser = info;
    response.status(200).send(JSON.stringify(info));
  });
});

app.post("/admin/logout", function (request, response) {
  if (request.session.loginUser) {
    User.findOne({ _id: request.session.loginUser._id }, (err, info) => {
      if (!err) {
        info.lastActivity = "User logged out";
        info.save();
      }
    });
    request.session.destroy((error) => {
      if (error) {
        console.log(error);
        return;
      }
      response.status(200).send("Loged out");
    });
  } else {
    response.status(500).send("Not logged in");
  }
});

app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (!request.session.loginUser) {
    response.status(401).send("User not found");
    return;
  }
  let photoId = request.params.photo_id;
  let time = new Date();
  time = time.toString();
  let comment = {
    user_id: request.session.loginUser._id,
    comment: request.body.description,
    date_time: time,
  };
  Photo.findOne({ _id: photoId }, (err, info) => {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    info.comments.push(comment);
    info.save();
  });
  User.findOne({ _id: request.session.loginUser._id }, (err, info) => {
    if (!err) {
      info.lastActivity = "Added a comment";
      info.save();
    }
  });
  response.status(200).send("Commented successfully.");
});

app.post("/photos/new", (request, response) => {
  if (!request.session.loginUser) {
    response.status(500).send("User not found");
    return;
  }
  let fileName;
  processFormBody(request, response, (error) => {
    if (error || !request.file) {
      response.status(400).send(JSON.stringify(error));
      return;
    }
    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;
    fileName = filename;
    // photo : _id, date_time, file_name, user_id
    fs.writeFile(`./images/${filename}`, request.file.buffer, (error) => {
      if (error) {
        console.log(error);
        return;
      } else {
        console.log("Photo saved");
      }
    });
    let date = new Date().toISOString();
    Photo.create(
      {
        date_time: date,
        file_name: filename,
        user_id: request.session.loginUser._id,
        comments: [],
      },
      (error) => {
        if (error) {
          response.status(500).send(JSON.stringify(error));
          return;
        }
      }
    );
    User.findOne({ _id: request.session.loginUser._id }, (err, info) => {
      if (!err) {
        info.lastActivity = "Posted a photo";
        info.latestPhoto = fileName;
        info.save();
      }
    });
    response.status(200).send("Photo uploaded successfully");
  });
});

app.post("/user", (request, response) => {
  User.findOne({ login_name: request.body.login_name }, (error, info) => {
    if (info) {
      response.status(400).send("User already registered");
      return;
    }
  });
  let password = cs142password.makePasswordEntry(request.body.password);
  User.create(
    {
      login_name: request.body.login_name,
      first_name: request.body.first_name,
      last_name: request.body.last_name,
      location: request.body.location,
      description: request.body.description,
      occupation: request.body.occupation,
      password_digest: password.hash,
      salt: password.salt,
    },
    (error, newUser) => {
      if (error) {
        response.status(400).send("User registration failed");
        return;
      }
      newUser.save();
      response.status(200).send("User Registered Successfully");
    }
  );
});

app.post("/photos/delete/:photoId", (request, response) => {
  let photoId = request.params.photoId;
  let user_id = request.body.user_id;
  if (!request.session.loginUser) {
    response.status(401).send("User not found");
    return;
  }
  if (user_id !== request.session.loginUser._id) {
    response.status(400).send("Unable to delete");
    return;
  }
  Photo.remove({ _id: photoId }, (error, info) => {
    if (error) {
      response.status(400).send(JSON.stringify(error));
      return;
    }
    response.status(200).send("Photo deleted");
  });
});

app.post("/comment/delete", (request, response) => {
  let comment = request.body.comment;
  let photoId = request.body.photoId;
  if (!request.session.loginUser) {
    response.status(401).send("User not found");
    return;
  }
  if (request.session.loginUser._id !== comment.user._id) {
    response.status(400).send("Unable to delete comment");
    return;
  }
  Photo.findOne({ _id: photoId }, (error, info) => {
    if (error) {
      response.status(500).send(JSON.stringify(error));
      return;
    }
    info.comments = info.comments.filter(
      (el) => el._id.toString() !== comment._id
    );
    info.save();
    response.status(200).send("Commend deleted");
  });
});
app.post("/user/delete", (request, response) => {
  if (!request.session.loginUser) {
    response.status(401).send("User not found");
    return;
  }
  const user = request.session.loginUser;
  const password = request.body.password;
  const doesPasswordMatch = cs142password.doesPasswordMatch(
    user.password_digest,
    user.salt,
    password
  );
  if (!doesPasswordMatch) {
    response.status(500).send("Wrong Password");
    return;
  }
  // Hereglegchiin zuragnuudiig ustgah
  // Photo.deleteMany({ user_id: user._id }, (error, info) => {
  //   if (error) {
  //     response.status(500).send(JSON.stringify(error));
  //     return;
  //   }
  // });
  // Hereglegchiin bichsen commentuudiig ustgah
  Photo.find({}, (error, info) => {
    if (error) {
      response.status(500).send(JSON.stringify(error));
      return;
    }
    info.forEach((photo) => {
      photo.comments = photo.comments.filter(
        (el) => el.user_id.toString() !== user._id
      );
      photo.save();
    });
  });
  // Hereglegchiig ustgah
  User.deleteOne({ _id: user._id }, (error, data) => {
    if (error) {
      response.status(500).send(JSON.stringify(error));
      return;
    }
    response.status(200).send("User deleted");
  });
});

app.post("/photo/like/:photoId", (request, response) => {
  if (!request.session.loginUser) {
    response.status(401).send("User not found");
    return;
  }
  let currentUserId = request.session.loginUser._id;
  let photoId = request.params.photoId;
  Photo.findOne({ _id: photoId }, (error, info) => {
    if (error) {
      response.status(500).send(JSON.stringify(error));
      return;
    }
    let isUserLiked = false;
    info.likedUsers = info.likedUsers.filter((id) => {
      if (id.toString() !== currentUserId) {
        return id;
      } else {
        isUserLiked = true;
        info.numberOfLikes--;
      }
    });
    if (!isUserLiked) {
      info.likedUsers.push(currentUserId);
      info.numberOfLikes++;
    }
    info.save();
    response.status(200).send(info);
  });
});

const server = app.listen(3002, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
