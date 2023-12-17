import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

import csv from 'fast-csv'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors(
    {
        origin: ["http://localhost:3000"],
        methods: ["POST", "GET", "PUT"],
        credentials: true
    }
));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

var smtpConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../client/public/images')
    },
    filename: (req, file, cb) => {
        const currentDate = new Date();
        const uniqueFilename = `${currentDate.getTime()}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
})

const upload = multer({
    storage: storage
})

const storagepdf = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../client/public/pdf')
    },
    filename: (req, file, cb) => {
        const currentDate = new Date();
        const uniqueFilename = `${currentDate.getTime()}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
})

const uploadpdf = multer({
    storage: storagepdf
})

app.get('/getEmployee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.get('/get/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.put('/update/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    if (req.file && req.body.address) {
        const sql = "UPDATE employee SET address = ?, image = ? WHERE id = ?";
        con.query(sql, [req.body.address, req.file.filename, id], (err, result) => {
          if (err) return res.json({ Error: "update employee error in sql" });
          return res.json({ Status: "Success" });
        });
      } else if (req.file) {
        const sql = "UPDATE employee SET image = ? WHERE id = ?";
        con.query(sql, [req.file.filename, id], (err, result) => {
          if (err) return res.json({ Error: "update employee error in sql" });
          return res.json({ Status: "Success" });
        });
      } else {
        const sql = "UPDATE employee SET address = ? WHERE id = ?";
        con.query(sql, [req.body.address, id], (err, result) => {
          if (err) return res.json({ Error: "update employee error in sql" });
          return res.json({ Status: "Success" });
        });
    }
});

app.put('/changepass/:id', (req, res) => {
    const id = req.params.id;
    const currentpass = req.body.current;
    const newpass = req.body.new;
    const sql = "SELECT password FROM employee WHERE id = ?";
    con.query(sql, [id], (err, result) => {
      if (err) return res.json({ Error: "error in mysql fetch" });
      bcrypt.compare(currentpass.toString(), result[0].password, (err, isMatch) => {
        if (err) return res.json({ Error: "error in bcrypt" });
        if (isMatch) {
          bcrypt.hash(newpass.toString(), 10, (err, hash) => {
            if (err) return res.json({ Error: "error in bcrypt" });
            const sql = "UPDATE employee SET password = ? WHERE id = ?";
            con.query(sql, [hash, id], (err, result) => {
              if (err) return res.json({ Error: "error in mysql update" });
              return res.json({ Status: "Success" });
            });
          });
        } else {
          return res.json({ Error: "Current password mismatch!!!" });
        }
      });
    });
})

app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "Delete FROM employee WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "delete employee error in sql"});
        return res.json({Status: "Success"})
    })
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json({Error: "You are not Authenticated"});
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) return res.json({Error: "Token wrong"});
            req.role = decoded.role;
            req.id = decoded.id;
            next();
        } )
    }
}

app.get('/dashboard',verifyUser, (req, res) => {
    return res.json({Status: "Success", role: req.role, id: req.id})
})

app.get('/fdashboard',verifyUser, (req, res) => {
    return res.json({Status: "Success", role: req.role, id: req.id})
})

app.get('/adminCount', (req, res) => {
    const sql = "Select * from users where role = 'admin'";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Error in runnig query"});
        return res.json(result);
    })
})

app.get('/employeeCount', (req, res) => {
    const sql = "Select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Error in runnig query"});
        return res.json(result);
    })
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users Where email = ? AND  password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
        if(result.length > 0) {
            const id = result[0].id;
            const token = jwt.sign({role: "admin"}, "jwt-secret-key", {expiresIn: '1d'});
            res.cookie('token', token);
            return res.json({Status: "Success"})
        } else {
            return res.json({Status: "Error", Error: "Wrong Email or Password"});
        }
    })
})

app.post('/employeelogin', (req, res) => {
    const sql = "SELECT * FROM employee Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
        if(result.length > 0) {
            bcrypt.compare(req.body.password.toString(), result[0].password, (err, response)=> {
                if(err) return res.json({Error: "password error"});
                if(response) {
                    const token = jwt.sign({role: "faculty", id: result[0].id}, "jwt-secret-key", {expiresIn: '1d'});
                    res.cookie('token', token);
                    return res.json({Status: "Success", id: result[0].id})
                } else {
                    return res.json({Status: "Error", Error: "Wrong Email or Password"});
                }                
            })
            
        } else {
            return res.json({Status: "Error", Error: "Wrong Email or Password"});
        }
    })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});
})

app.post('/create', (req, res) => {
    var name = req.body.name
    var mail = req.body.email
    var department = req.body.department
    const passwordLength = 10;
    const randomBytes = crypto.randomBytes(passwordLength);
    const password = randomBytes.toString('hex').slice(0, passwordLength);
    console.log(password);
    const sql = "INSERT INTO employee (`name`,`email`,`password`, `department`) VALUES (?)";
    bcrypt.hash(password.toString(), 10, (err, hash) => {
        if(err) return res.json({Error: "Error in hashing password"});
        const values = [
            name,
            mail,
            hash,
            department
        ]
        console.log(values)
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Error: "Email Already Exists!!"});
              
            var transporter = nodemailer.createTransport(smtpConfig);
            
            var mailOptions = {
            from: process.env.MAIL_USER,
            to: mail,
            subject: 'Account Creation',
            text: `Your account has been created successfully!\n\nUsername: ${mail}\nPassword: ${password}\n\nUse this password to login and change your password.`
            };
              
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                return res.json({Error: "Mail request Failed!!"});
            } else {
                console.log('Email sent: ' + info.response);
                return res.json({Status: "Success"});
            }
            });
        })
    })
})


app.post('/examdetails', uploadpdf.fields([{ name: 'csvFile' }, { name: 'pdfFile' }]), (req, res) => {
    const { csvFile, pdfFile } = req.files;
    uploadCsv( "../client/public/pdf/" + csvFile[0].filename, req)

    const values = [
        req.body.examName,
        req.body.year,
        req.body.department,
        pdfFile[0].filename
    ]

    const sql = "INSERT INTO examschedulepdf (`examname`, `year`, `department`, `filename`) VALUES (?)"
    con.query(sql, [values], (err, result) => {
        if(err) return res.json({Error: "Upload Failure"});
        return res.json({Status: "Success"});
    })
})

function uploadCsv(path,req){
    let stream = fs.createReadStream(path)
    let csvDataColl = []
    let fileStream = csv
    .parse()
    .on('data', function(data){
        data.push(req.body.examName)
        data.push(req.body.year)
        data.push(req.body.department)
        csvDataColl.push(data)
    })
    .on('end', function(){
        csvDataColl.shift()
        let query = "INSERT INTO examdetails (`date`,`slot`,`starttime`,`endtime`,`roomnumber`,`course`,`facultyname`,`facultymail`,`examname`,`academicyear`,`department`) VALUES (?)"        
        for (let i = 0; i < csvDataColl.length; i++) {
            const rowData = csvDataColl[i];          
            con.query(query, [rowData], (error, res) => {

                var transporter = nodemailer.createTransport(smtpConfig);
            
                var mailOptions = {
                from: process.env.MAIL_USER,
                to: rowData[7],
                subject: 'Exam Invigilation Duty',
                text: `You have alloted to the invigilation duty for the ${rowData[8]} exam ${rowData[9]}!\n\nCourse: ${rowData[5]}\nDate: ${rowData[0]}\nSlot: ${rowData[1]}\nRoom Number: ${rowData[4]}\nStart Time: ${rowData[2]}\n\nPlease be present at the exam hall 15 minutes before the exam starts.`
                };
                  
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
                });
            });
        }
        fs.unlinkSync(path) 
    })
    stream.pipe(fileStream)
}

app.post('/timetable', (req, res) => {
    const sql = "SELECT filename FROM examschedulepdf WHERE examname = ? AND year = ? AND department = ?"
    con.query(sql, [req.body.examName, req.body.year, req.body.department], (err, result) => {
        if(err) return res.json({Error: "SQL error!!"});
        if (result.length > 0) {

            const sql1 = "SELECT * FROM examdetails WHERE examname = ? AND academicyear = ? AND department = ? ORDER BY date"
            con.query(sql1, [req.body.examName, req.body.year, req.body.department], (err, result1) => {
                if(err) return res.json({Error: "SQL error!!"});
                if (result.length > 0) {        
                    return res.json({ Status: "Success", Result: result, Result1: result1});
                } else {
                    return res.json({Error: "No File Found!!"});
                }
            })
            // return res.json({ Status: "Success", Result: result});
        } else {
            return res.json({Error: "No File Found!!"});
        }
    })
})
  

var email;
app.get('/getExams/:id', (req, res) => {
    const id = req.params.id;
    // Fid -> Femail
    const sql1 = "SELECT * FROM employee WHERE id = ?";
    con.query(sql1,[id], (err, result) => {
        if(err) console.log("Femail fetch error")
        else email = result[0].email
    })
    //Femail -> resp exams
    const sql = "SELECT * FROM examdetails WHERE facultymail = ?";
    con.query(sql,[email], (err, result) => {
        if(err) return res.json({Error: "Get exams error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.get('/getAllExams', (req, res) => {
    //Femail -> resp exams
    const sql = "SELECT * FROM examdetails WHERE date > CURDATE()";
    con.query(sql,(err, result) => {
        if(err) return res.json({Error: "Get exams error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.get('/examslot/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM examdetails WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Error: "Get exams error in sql"});
        else{
            const values = [
                result[0].date,
                result[0].slot,
                result[0].date,
                result[0].facultymail
            ]
            const sql1 = "SELECT * FROM examdetails WHERE ((date = (?) AND slot <> (?)) OR (date <> (?))) AND facultymail <> (?) LIMIT 0, 25;";
            con.query(sql1, values, (err, result1) => {
                if(err) return res.json({Error: "Get exams error in sql"});
                else{
                    // console.log(result1)
                    return res.json({Status: "Success", Result: result1})
                }
            })
        }
    })
})

app.get('/getstatus/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    var stats = "Pending";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Error: "Get exams error in sql"});
        else{
            var mail = result[0].email;
            const sql1 = "select * from examdetails where id in (SELECT fexamid FROM requests WHERE fmail =(?) AND status = ? ORDER BY id ASC);";
            con.query(sql1, [mail, stats], (err, result1) => {
                if(err) return res.json({Error: "Get exams error in sql1"});
                else{
                    const sql2 = "select * from examdetails where id in (SELECT texamid FROM requests WHERE fmail =(?) AND status = ? ORDER BY id ASC);";
                    con.query(sql2, [mail, stats], (err, result2) => {
                        if(err) return res.json({Error: "Get exams error in sql1"});
                        else{
                            console.log(result1)
                            return res.json({Status: "Success", Result: result1, Result1: result2})
                        }
                    })
                }
            })
        }
    })
})

app.get('/getrequeststatus/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    var stats = "Pending"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Error: "Get exams error in sql"});
        else{
            var mail = result[0].email;
            console.log(mail);
            const sql1 = "select * from examdetails where id in (SELECT fexamid FROM requests WHERE tmail =(?) AND status = ? ORDER BY id ASC);";
            con.query(sql1, [mail, stats], (err, result1) => {
                if(err) return res.json({Error: "Get exams error in sql1"});
                else{
                    const sql2 = "select * from examdetails where id in (SELECT texamid FROM requests WHERE tmail =(?) AND status = ? ORDER BY id ASC);";
                    con.query(sql2, [mail, stats], (err, result2) => {
                        if(err) return res.json({Error: "Get exams error in sql1"});
                        else{
                            console.log(result1)
                            return res.json({Status: "Success", Result: result1, Result1: result2})
                        }
                    })
                }
            })
        }
    })
})

app.post('/setrequest/:id1/:id2/:id3', (req, res) => {
    const fid = req.params.id1;
    const tid = req.params.id2;
    const tmail = req.params.id3;
    const sql = "SELECT * FROM examdetails WHERE id = ?";
    con.query(sql,[fid], (err, result) => {
        if(err) return res.json({Error: "Get exams error in sql"});
        else{
            var fmail = result[0].facultymail;
            var stats = "Pending";
            const values = [
                fmail,
                tmail,
                fid,
                tid,
                stats
            ]
            const sql1 = "INSERT INTO requests (`fmail`,`tmail`,`fexamid`,`texamid`, `status`) VALUES (?)";
            con.query(sql1, [values], (err, result1) => {
                if(err) return res.json({Error: err});
                else{

                    var transporter = nodemailer.createTransport(smtpConfig);
            
                    var mailOptions = {
                    from: process.env.MAIL_USER,
                    to: tmail,
                    subject: 'Request for Exchange of Invigilation Duty',
                    text: `Request received for exchange of invigilation duty from ${fmail}\n\nPlease check your Inbox Request section in Exam_Alteration_Helper System to either approve or reject.`
                    };
                      
                    transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    });

                    return res.json({Status: "Success", Result: result1})
                }
            })
        }
    })
})

app.get('/getcurrentstatus/:id1/:id2', (req, res) => {
    const fid = req.params.id1;
    const tid = req.params.id2;
    const sql = "SELECT status FROM requests WHERE fexamid = ? AND texamid = ?";
    con.query(sql, [fid, tid], (err, result) => {
      if (err) {
        return res.json({ Error: "Get exams error in SQL" });
      } else {
        if (result.length === 0) {
          return res.json({ Status: "Success", Result: 0 });
        } else {
            // console.log(result[0].status)
          return res.json({ Status: "Success", Result: result[0].status });
        }
      }
    });
});

app.put('/approverequest/:id/:id2/:name1/:name2/:mail1/:mail2', (req, res) => {
    const fid = req.params.id;
    const tid = req.params.id2;
    const fname = req.params.name1;
    const tname = req.params.name2;
    const fmail = req.params.mail1;
    const tmail = req.params.mail2;
    const approve = "Approved";
  
    con.beginTransaction((err) => {
        if (err) {
            return res.json({ Error: "Failed to begin transaction" });
        }
      
        const sql1 = "UPDATE requests SET status = ? WHERE fexamid = ? AND texamid = ?;";
        con.query(sql1, [approve, fid, tid], (err, result) => {
            if (err) {
                con.rollback(() => {
                    return res.json({ Error: "Error updating requests table" });
                });
            } else {
                const sql2 = "UPDATE examdetails SET facultyname = ?, facultymail = ? WHERE id = ?;";
                con.query(sql2, [tname, tmail, fid], (err, result) => {
                    if (err) {
                        con.rollback(() => {
                            return res.json({ Error: "Error updating examdetails table" });
                        });
                    } else {
                        const sql3 = "UPDATE examdetails SET facultyname = ?, facultymail = ? WHERE id = ?;";
                        con.query(sql3, [fname, fmail, tid], (err, result) => {
                            if (err) {
                                con.rollback(() => {
                                    return res.json({ Error: "Error updating examdetails table" });
                                });
                            } else {
                                con.commit((err) => {
                                    if (err) {
                                        con.rollback(() => {
                                            return res.json({ Error: "Failed to commit transaction" });
                                        });
                                    } else {

                                        var transporter = nodemailer.createTransport(smtpConfig);
            
                                        var mailOptions = {
                                        from: process.env.MAIL_USER,
                                        to: tmail,
                                        subject: 'Request for Exchange of Invigilation Duty',
                                        text: `The faculty has accepted your swap request from ${tmail}\n\nPlease check your Exam_Alteration_Helper System.`
                                        };
                                          
                                        transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                        });

                                        return res.json({ Status: "Success" });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

app.put('/rejectrequest/:id/:id2/:name1/:name2/:mail1/:mail2', (req, res) => {
    const fid = req.params.id;
    const tid = req.params.id2;
    const approve = "Rejected";   
    const sql = "UPDATE requests SET status = ? WHERE fexamid = ? AND texamid = ?;";
    con.query(sql, [approve, fid, tid], (err, result) => {
      if (err) {
        return res.json({ Error: "Get exams error in SQL" });
      } else {
        return res.json({ Status: "Success"});
      }
    });
});


app.get('/getRatings', (req, res) => {
    const sql = "SELECT Employee.name, Employee.department, Employee.image, Leaderboard.rating FROM Leaderboard JOIN Employee ON Leaderboard.fid = Employee.id";
    con.query(sql,(err, result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.get('/', (req, res) => {
    return res.send("Exam Alteration Helper Server Up & Running!!")
})

con.connect(function(err) {
    if(err) {
        console.log("Error in Connection");
    } else {
        console.log("DataBase Connected Successfully!!");
    }
})

app.listen(process.env.SERVER_PORT, ()=> {
    console.log("Running on port "+process.env.SERVER_PORT);
})
