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
  const sql = "select password,designation,dept from faculty where fid=?";
  db.query(sql, [fid], (err, result) => {
    // console.log(result[0].password)
    if (pass == result[0].password) {
      if (result[0].designation == "HOD") {
        res.cookie("username",fid)
        res.cookie("dept",result[0].dept)
        // console.log(result[0].dept)
        res.render("hod");
      } else {
        res.cookie("username",fid)
        res.render("page1", { fid: req.body.username,msg1:"",msg2:"" });
      }
    } else {
      return res.redirect('/login?msg=fail')
    }
  });
});

router.get('/hod',(req,res)=>{
  res.render("hod")
})
router.get('/page1',(req,res)=>{
  res.render("page1",{msg1:"",msg2:""})
})
router.get("/page2", (req, res) => {
  const fid = req.cookies.username;
  console.log(fid);
  res.render("page2", { fid: fid });
});

router.post("/data", function (req, res, next) {
  const name = req.body.name;
  const class1 = req.body.class1;
  const period = req.body.hour;
  const adjusted = req.body.adj;
  const branch=req.body.branch;
  const section =req.body.section;
  var lid = req.cookies.lid;
  var fid = req.cookies.username;
  const dt=new Date().toLocaleDateString()
  var count = req.body.testing;
  console.log(req.body);
  console.log(lid)
  console.log(Object.keys(req.body).length);
  console.log(name)
  // console.log(name.length)
  if (Object.keys(req.body).length == 7) {
    var aid = Math.floor(Math.random() * 100001) + "";
    const sql = "insert into adjustment values(?,?,?,?,?,?,?,?,?)";
    db.query(sql, [aid, lid, name, class1, period, adjusted,branch,section,dt], (err) => {
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
      const sql = "insert into adjustment values(?,?,?,?,?,?,?,?,?)";
      db.query(
        sql,
        [aid, lid, name[i], class1[i], period[i], adjusted[i],branch[i],section[i],dt],
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
  res.render("page1",{msg1:"Your Leave Application is Submitted!!",msg2:"Please wait for the response!!!"})

});
router.post("/leavesinsert", function (req, res, next) {
  const fromdate = req.body.from;
  const todate = req.body.todate;
  const purpose=req.body.purpose;
  const address=req.body.address;
  var fid = req.cookies.username;
  var lid = Math.floor(Math.random() * 100001) + "";
  res.cookie("lid",lid)
  var status = "pending";
  const sql =
    "insert into leave1 (lid,fid,fromdate,todate,status,purpose,address) values (?,?,?,?,?,?,?)";
  db.query(sql, [lid, fid, fromdate, todate,status,purpose,address], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result.affectedRows);

      res.render("faculty", { fid: fid, lid: lid });
    }
  });
});

router.get("/display", (req, res) => {
  const dept1=req.cookies.dept;
  console.log(dept1)
  const que = `select l.lid,l.fid,DATE_FORMAT(l.fromdate,'%d-%m-%Y') as fromdate,DATE_FORMAT(l.todate,'%d-%m-%Y') as todate,DATEDIFF( l.todate,l.fromdate) as total,l.purpose,l.address from leave1 l,faculty f  where status="pending" and f.fid=l.fid and f.dept=?`;
  db.query(que,[dept1], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result.length);
      res.render("hod1", { data: result,len:result.length });
    }
  });
});
router.get("/totalreport", (req, res) => {
  const search=req.query.start
  console.log(search)
  const que = `select fid,sum(DATEDIFF( todate,fromdate)) as totalnoofdays from leave1 where status="Accepted" group by(fid) `;
  db.query(que, [search],(err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.render("totalreport", { data: result });
    }
  });
})

router.get("/report", (req, res) => {
  res.render('report')
});

router.post("/monthreport", (req, res) => {
  const search=req.body.start
  console.log(search)
  const que = `select fid,sum(DATEDIFF( todate,fromdate)) as totalnoofdays from leave1 where date_format(fromdate,'%Y-%m')=(?) and status="Accepted" group by(fid) `;
  db.query(que, [search],(err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.render("datatable", { data: result,len:result.length });
    }
  });
});

router.get("/status", (req, res) => {
  var fid = req.cookies.username;
  console.log(fid)
  const sql1 = `select lid,DATE_FORMAT(fromdate,'%d-%m-%Y') as fromdate,DATE_FORMAT(todate,'%d-%m-%Y') as todate,status,purpose,address from leave1 where fid=? order by fromdate desc limit 3`;
  db.query(sql1, [fid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      console.log(fid)
      res.render("status", { fid: fid, msg: result,msg1:"",msg2:"" });
    }
  });
});


router.get("/updatestatus/:lid", (req, res) => {
  const lid = req.params.lid;
  const status = req.query.status;
  const sql = `UPDATE leave1 SET status = ? WHERE lid=? and status="pending"`;
  db.query(sql, [status, lid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("result");
      res.redirect("/users/display")
    }
  });
});
router.get("/adjustment/:lid", (req, res) => {
  const lid = req.params.lid;
  const sql = `select lid,aid,DATE_FORMAT(cdate,'%d-%m-%Y') as cdate,class,period,adjusted,branch,section from adjustment where lid=?`;
  db.query(sql, [lid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render("hod2", { data: result, title: "Data" });
    }
  });
});

router.get("/facultyreport/:lid", (req, res) => {
  const lid=req.params.lid;
  const fid=req.cookies.username;
  console.log(fid)
  const sql=`SELECT f.fname,f.dept,f.designation,f.phoneno,DATEDIFF( todate,fromdate) as days,l.fromdate,l.todate,l.purpose,l.address,a.adjusted,a.cdate,a.period,a.branch,a.class,a.applieddate FROM leave1 l,faculty f,adjustment a where l.lid=? and a.lid=? and f.fid=?`
  db.query(sql,[lid,lid,fid],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      res.render('form',{data:result});
    }
  })

});

module.exports = router;
