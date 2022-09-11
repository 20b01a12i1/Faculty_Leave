var express = require("express");
var router = express.Router();
var mysql = require("mysql");

// const { listenerCount } = require("process");

const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Srivalli@2",
  database: "hackathon",
});

/* GET home page. */
router.get("/", function (req, res, next) {
  let username = req.cookies.username;
  if (username) {
    const sql = "select password,designation from faculty where fid=?";
    db.query(sql, [username], (err, result) => {
      if (result[0].designation == "HOD") {
        res.render("hod");
      } else {
        res.render("page1", { fid: username });
      }
    });
  } else {
    res.render("index", { msg: "" });
  }
});

router.get("/login", function (req, res) {
  let bad_auth = req.query.msg ? true : false;
  console.log(bad_auth);
  if (bad_auth) {
    return res.render("index", { msg: "Invalid User!!" });
  } else {
    return res.render("index", { msg: "" });
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("username");
  return res.redirect("/login");
});

module.exports = router;
