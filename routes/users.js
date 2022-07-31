var express = require("express");
var router = express.Router();
var path = require("path");
var mysql = require("mysql");

const { listenerCount } = require("process");

const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Srivalli@2",
  database: "hackathon",
});

db.getConnection((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected!!");
  }
});

/* GET users listing. */
router.post("/check", function (req, res, next) {
  const fid = req.body.username;
  const pass = req.body.password;
  const sql = "select password,designation from faculty where fid=?";
  db.query(sql, [fid], (err, result) => {
    // console.log(result[0].password)
    if (pass == result[0].password) {
      if (result[0].designation == "HOD") {
        res.render("hod");
      } else {
        res.render("page1", { fid: req.body.username });
      }
    } else {
      res.render("index");
    }
  });
});

router.get("/page2/:fid", (req, res) => {
  const fid = req.params.fid;
  console.log(fid);
  res.render("page2", { fid: fid });
});

router.post("/data/:fid/:lid", function (req, res, next) {
  const name = req.body.name;
  const class1 = req.body.class1;
  const hour = req.body.hour;
  const adjusted = req.body.adj;
  var fid = req.params.fid;
  var lid = req.params.lid;
  var count = req.body.testing;
  console.log(req.body);
  console.log(Object.keys(req.body).length);
  console.log(name)
  console.log(name.length)
  if (Object.keys(req.body).length == 5) {
    var aid = Math.floor(Math.random() * 100001) + "";
    const sql = "insert into adjustment values(?,?,?,?,?,?)";
    db.query(sql, [aid, lid, name, class1, hour, adjusted], (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Inserted!!!");
      }
    });
  } 
  else {
    for (let i = 0; i < name.length; i++) {
      var aid = Math.floor(Math.random() * 100001) + "";
      const sql = "insert into adjustment values(?,?,?,?,?,?)";
      db.query(
        sql,
        [aid, lid, name[i], class1[i], hour[i], adjusted[i]],
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Inserted!!!");
          }
        }
      );
    }
  }
});
router.post("/leavesinsert/:fid", function (req, res, next) {
  const fromdate = req.body.from;
  const todate = req.body.todate;
  const days = req.body.nodays;
  var fid = req.params.fid;
  var lid = Math.floor(Math.random() * 100001) + "";
  var status = "pending";
  const sql =
    "insert into leave1 (lid,fid,fromdate,todate,total,status) values (?,?,?,?,?,?)";
  db.query(sql, [lid, fid, fromdate, todate, days, status], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result.affectedRows);

      res.render("faculty", { fid: fid, lid: lid });
    }
  });
});

router.get("/display", (req, res) => {
  const que = `select * from leave1 where status="pending"`;
  db.query(que, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.render("hod1", { data: result });
    }
  });
});

router.get("/report", (req, res) => {
  const que = `select fid,sum(total) noofdays from leave1 where status="Accepted" group by(fid) `;

  db.query(que, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.render("report", { data: result });
    }
  });
});

router.get("/status/:fid", (req, res) => {
  var fid = req.params.fid;
  const sql1 = `select * from leave1 where fid=? order by fromdate desc`;
  db.query(sql1, [fid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result[0]);
      res.render("status", { fid: fid, msg: result[0] });
    }
  });
});


router.get("/updatestatus/:fid", (req, res) => {
  const fid = req.params.fid;
  const status = req.query.status;
  const sql = `UPDATE leave1 SET status = ? WHERE fid=? and status="pending"`;
  db.query(sql, [status, fid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("result");
    }
  });
});
router.get("/adjustment/:lid", (req, res) => {
  const lid = req.params.lid;
  const sql = `select * from adjustment where lid=?`;
  db.query(sql, [lid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render("hod2", { data: result, title: "Data" });
    }
  });
});

module.exports = router;
