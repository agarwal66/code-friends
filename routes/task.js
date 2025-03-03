var express = require("express");
var router = express.Router();
var unirest = require("unirest");

var Task = require("../models/task"); // Ensure Task model is imported

router.get("/createTask", function (req, res) {
  var newTask = new Task();
  newTask.save(function (err, data) {
    if (err) {
      console.log(err);
      return res.render("error");
    }
    res.redirect("/task/" + data._id);
  });
});

router.get("/task/:id", function (req, res) {
  Task.findOne({ _id: req.params.id }, function (err, data) {
    if (err || !data) {
      console.log("Error: " + err);
      return res.render("error", { invalid: "This Collab doesn't exist" });
    }
    res.render("task", { content: data.content, roomID: data.id });
  });
});

router.post("/task/:id", async (req, res) => {
  console.log("Received code:", req.body.code);

  var unreq = unirest("POST", "https://judge029.p.rapidapi.com/submissions");
  unreq.headers({
    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
    "x-rapidapi-key":  process.env.RAPIDAPI_KEY, // Replace with your actual API Key
    "content-type": "application/json",
    accept: "application/json",
  });

  unreq.type("json").send({
    language_id: 53,
    source_code: req.body.code,
    stdin: req.body.input,
  });

  unreq.end(async (response) => {
    if (response.error || !response.body.token) {
      console.log("Judge0 API Error:", response.error);
      return res.send({ error: "Failed to submit code, please try again!" });
    }

    let token = response.body.token;
    console.log("Submission Token:", token);

    setTimeout(() => {
      var rereq = unirest(
        "GET",
        `https://judge029.p.rapidapi.com/submissions/${token}`
      );

      rereq.headers({
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key":  process.env.RAPIDAPI_KEY, // Same API key as above
      });

      rereq.end((responses) => {
        if (responses.error) {
          console.log(responses.error);
          return res.send({ error: "Error fetching result!" });
        }
        res.send(responses.body);
      });
    }, 5000); // Wait 5 seconds before fetching the result
  });
});

module.exports = router;