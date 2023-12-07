import express from 'express'
// import mysql from 'mysql'
import sql from 'mssql'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { BlobServiceClient } from '@azure/storage-blob'

import csv from 'fast-csv'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors(
    {
        origin: "*",
        methods: ["POST", "GET", "PUT"],
        credentials: true
    }
));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const mssqlconfig = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER,
    port: 1433,
    database: process.env.MSSQL_DATABASE,
    authentication: {
        type: 'default',
    },
    options: {
        encrypt: true,
    },
};

let pool;
async function checkDatabaseConnection() {
    try {
        pool = await sql.connect(mssqlconfig);
        if (pool.connected) {
            console.log("DataBase Connected Successfully!!");
        } else {
            console.error('Failed to connect to the database');
        }
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
}
checkDatabaseConnection();

var smtpConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
};

const upload = multer();

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

// app.get('/getEmployee', (req, res) => {
//     const sql = "SELECT * FROM employee";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Get employee error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

app.get('/api/getEmployee', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM employee');
        res.json({ Status: 'Success', Result: result.recordset });
    } catch (err) {
        console.error('Error querying the database:', err.message);
        res.json({ Error: 'Get employee error in SQL' });
    }
});

// app.get('/get/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM employee where id = ?";
//     con.query(sql, [id], (err, result) => {
//         if(err) return res.json({Error: "Get employee error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

app.get('/api/get/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM employee where id = @id');
        res.json({ Status: 'Success', Result: result.recordset });
    } catch (err) {
        console.error('Error querying the database:', err.message);
        res.json({ Error: 'Get employee error in SQL' });
    }
});

// app.put('/update/:id', upload.single('image'), async (req, res) => {
//     const id = req.params.id;
//     const currentDate = new Date();
//     const uniqueFilename = `${currentDate.getTime()}${path.extname(req.file.originalname)}`;

//     if(req.file) {
//         const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AzureWebJobsStorage);
//         const containerClient = blobServiceClient.getContainerClient('images');
//         const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilename);
        
//         // Use the upload method with the file buffer
//         const uploadBlobResponse = await blockBlobClient.upload(req.file.buffer, req.file.buffer.length);
        
//         console.log(`Upload block blob ${uniqueFilename} successfully`, uploadBlobResponse.requestId);
//     }

//     if (req.file && req.body.address) {
//         const sql = "UPDATE employee SET address = ?, image = ? WHERE id = ?";
//         con.query(sql, [req.body.address, uniqueFilename, id], (err, result) => {
//           if (err) return res.json({ Error: "update employee error in sql" });
//           return res.json({ Status: "Success" });
//         });
//       } else if (req.file) {
//         const sql = "UPDATE employee SET image = ? WHERE id = ?";
//         con.query(sql, [uniqueFilename, id], (err, result) => {
//           if (err) return res.json({ Error: "update employee error in sql" });
//           return res.json({ Status: "Success" });
//         });
//       } else {
//         const sql = "UPDATE employee SET address = ? WHERE id = ?";
//         con.query(sql, [req.body.address, id], (err, result) => {
//           if (err) return res.json({ Error: "update employee error in sql" });
//           return res.json({ Status: "Success" });
//         });
//     }
// });

app.put('/api/update/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    let uniqueFilename = null; // Declare uniqueFilename outside the if block

    if (req.file) {
        const currentDate = new Date();
        uniqueFilename = `${currentDate.getTime()}${path.extname(req.file.originalname)}`;
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AzureWebJobsStorage);
        const containerClient = blobServiceClient.getContainerClient('images');
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilename);

        // Use the upload method with the file buffer
        const uploadBlobResponse = await blockBlobClient.upload(req.file.buffer, req.file.buffer.length);

        console.log(`Upload block blob ${uniqueFilename} successfully`, uploadBlobResponse.requestId);
    }

    let sqlQuery = "UPDATE employee SET ";
    const values = [];

    if (req.body.address) {
        sqlQuery += "address = @address, ";
        values.push({ name: 'address', type: sql.NVarChar, value: req.body.address });
    }

    if (uniqueFilename) { // Check if uniqueFilename is defined
        sqlQuery += "image = @image, ";
        values.push({ name: 'image', type: sql.NVarChar, value: uniqueFilename });
    }

    // Remove trailing comma and add the WHERE clause
    sqlQuery = sqlQuery.slice(0, -2) + " WHERE id = @id";
    values.push({ name: 'id', type: sql.Int, value: id });

    try {
        const request = pool.request();
        values.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        const result = await request.query(sqlQuery);
        res.json({ Status: 'Success' });
    } catch (err) {
        console.error('Error updating the database:', err.message);
        res.json({ Error: 'Update employee error in SQL' });
    }
});


// app.put('/changepass/:id', (req, res) => {
//     const id = req.params.id;
//     const currentpass = req.body.current;
//     const newpass = req.body.new;
//     const sql = "SELECT password FROM employee WHERE id = ?";
//     con.query(sql, [id], (err, result) => {
//       if (err) return res.json({ Error: "error in mysql fetch" });
//       bcrypt.compare(currentpass.toString(), result[0].password, (err, isMatch) => {
//         if (err) return res.json({ Error: "error in bcrypt" });
//         if (isMatch) {
//           bcrypt.hash(newpass.toString(), 10, (err, hash) => {
//             if (err) return res.json({ Error: "error in bcrypt" });
//             const sql = "UPDATE employee SET password = ? WHERE id = ?";
//             con.query(sql, [hash, id], (err, result) => {
//               if (err) return res.json({ Error: "error in mysql update" });
//               return res.json({ Status: "Success" });
//             });
//           });
//         } else {
//           return res.json({ Error: "Current password mismatch!!!" });
//         }
//       });
//     });
// })

app.put('/api/changepass/:id', async (req, res) => {
    const id = req.params.id;
    const currentpass = req.body.current;
    const newpass = req.body.new;

    try {
        const result = await pool.request().input('id', sql.Int, id).query('SELECT password FROM employee WHERE id = @id');
        if (result.recordset.length === 0) {
            return res.json({ Error: 'Employee not found' });
        }

        const storedPassword = result.recordset[0].password;

        bcrypt.compare(currentpass.toString(), storedPassword, async (err, isMatch) => {
            if (err) return res.json({ Error: 'Error in bcrypt' });

            if (isMatch) {
                const hashedNewPassword = await bcrypt.hash(newpass.toString(), 10);
                const updateResult = await pool
                    .request()
                    .input('id', sql.Int, id)
                    .input('password', sql.NVarChar, hashedNewPassword)
                    .query('UPDATE employee SET password = @password WHERE id = @id');

                return res.json({ Status: 'Success' });
            } else {
                return res.json({ Error: 'Current password mismatch!!!' });
            }
        });
    } catch (err) {
        console.error('Error querying the database:', err.message);
        return res.json({ Error: 'Error in SQL fetch' });
    }
});

// app.delete('/delete/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "Delete FROM employee WHERE id = ?";
//     con.query(sql, [id], (err, result) => {
//         if(err) return res.json({Error: "delete employee error in sql"});
//         return res.json({Status: "Success"})
//     })
// })

app.delete('/api/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM employee WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.json({ Error: 'No employee found for deletion' });
        }

        return res.json({ Status: 'Success' });
    } catch (err) {
        console.error('Error deleting from the database:', err.message);
        return res.json({ Error: 'Delete employee error in SQL' });
    }
});

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

app.get('/api/dashboard',verifyUser, (req, res) => {
    return res.json({Status: "Success", role: req.role, id: req.id})
})

app.get('/api/fdashboard',verifyUser, (req, res) => {
    return res.json({Status: "Success", role: req.role, id: req.id})
})

// app.get('/adminCount', (req, res) => {
//     const sql = "Select * from users where role = 'admin'";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Error in runnig query"});
//         return res.json(result);
//     })
// })

app.get('/api/adminCount', async (req, res) => {
    try {
        const result = await pool.request().query("SELECT * FROM users WHERE role = 'admin'");
        return res.json(result.recordset);
    } catch (err) {
        console.error('Error running the query:', err.message);
        return res.json({ Error: 'Error in running the query' });
    }
});

// app.get('/employeeCount', (req, res) => {
//     const sql = "Select count(id) as employee from employee";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Error: "Error in runnig query"});
//         return res.json(result);
//     })
// })

app.get('/api/employeeCount', async (req, res) => {
    try {
        const result = await pool.request().query("SELECT COUNT(id) AS employee FROM employee");
        return res.json(result.recordset);
    } catch (err) {
        console.error('Error running the query:', err.message);
        return res.json({ Error: 'Error in running the query' });
    }
});


// app.post('/login', (req, res) => {
//     const sql = "SELECT * FROM users Where email = ? AND  password = ?";
//     con.query(sql, [req.body.email, req.body.password], (err, result) => {
//         if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
//         if(result.length > 0) {
//             const id = result[0].id;
//             const token = jwt.sign({role: "admin"}, "jwt-secret-key", {expiresIn: '1d'});
//             res.cookie('token', token);
//             return res.json({Status: "Success"})
//         } else {
//             return res.json({Status: "Error", Error: "Wrong Email or Password"});
//         }
//     })
// })

app.post('/api/login', async (req, res) => {
    try {
        const result = await pool
            .request()
            .input('email', sql.NVarChar, req.body.email)
            .input('password', sql.NVarChar, req.body.password)
            .query('SELECT * FROM users WHERE email = @email AND password = @password');

        if (result.recordset.length > 0) {
            const id = result.recordset[0].id;
            const token = jwt.sign({ role: 'admin', id: id }, 'jwt-secret-key', { expiresIn: '1d' });
            res.cookie('token', token);
            return res.json({ Status: 'Success' });
        } else {
            return res.json({ Status: 'Error', Error: 'Wrong Email or Password' });
        }
    } catch (err) {
        console.error('Error running the query:', err.message);
        return res.json({ Status: 'Error', Error: 'Error in running query' });
    }
});

// app.post('/employeelogin', (req, res) => {
//     const sql = "SELECT * FROM employee Where email = ?";
//     con.query(sql, [req.body.email], (err, result) => {
//         if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
//         if(result.length > 0) {
//             bcrypt.compare(req.body.password.toString(), result[0].password, (err, response)=> {
//                 if(err) return res.json({Error: "password error"});
//                 if(response) {
//                     const token = jwt.sign({role: "faculty", id: result[0].id}, "jwt-secret-key", {expiresIn: '1d'});
//                     res.cookie('token', token);
//                     return res.json({Status: "Success", id: result[0].id})
//                 } else {
//                     return res.json({Status: "Error", Error: "Wrong Email or Password"});
//                 }                
//             })
            
//         } else {
//             return res.json({Status: "Error", Error: "Wrong Email or Password"});
//         }
//     })
// })

app.post('/api/employeelogin', async (req, res) => {
    try {
        const result = await pool
            .request()
            .input('email', sql.NVarChar, req.body.email)
            .query('SELECT * FROM employee WHERE email = @email');

        if (result.recordset.length > 0) {
            bcrypt.compare(req.body.password.toString(), result.recordset[0].password, (err, response) => {
                if (err) return res.json({ Status: 'Error', Error: 'Password error' });

                if (response) {
                    const token = jwt.sign({ role: 'faculty', id: result.recordset[0].id }, 'jwt-secret-key', { expiresIn: '1d' });
                    res.cookie('token', token);
                    return res.json({ Status: 'Success', id: result.recordset[0].id });
                } else {
                    return res.json({ Status: 'Error', Error: 'Wrong Email or Password' });
                }
            });
        } else {
            return res.json({ Status: 'Error', Error: 'Wrong Email or Password' });
        }
    } catch (err) {
        console.error('Error running the query:', err.message);
        return res.json({ Status: 'Error', Error: 'Error in running query' });
    }
});

app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});
})

// app.post('/create', (req, res) => {
//     var name = req.body.name
//     var mail = req.body.email
//     var department = req.body.department
//     const passwordLength = 10;
//     const randomBytes = crypto.randomBytes(passwordLength);
//     const password = randomBytes.toString('hex').slice(0, passwordLength);
//     console.log(password);
//     const sql = "INSERT INTO employee (`name`,`email`,`password`, `department`) VALUES (?)";
//     bcrypt.hash(password.toString(), 10, (err, hash) => {
//         if(err) return res.json({Error: "Error in hashing password"});
//         const values = [
//             name,
//             mail,
//             hash,
//             department
//         ]
//         console.log(values)
//         con.query(sql, [values], (err, result) => {
//             if(err) return res.json({Error: "Email Already Exists!!"});
              
//             var transporter = nodemailer.createTransport(smtpConfig);
            
//             var mailOptions = {
//             from: process.env.MAIL_USER,
//             to: mail,
//             subject: 'Account Creation',
//             text: `Your account has been created successfully!\n\nUsername: ${mail}\nPassword: ${password}\n\nUse this password to login and change your password.`
//             };
              
//             transporter.sendMail(mailOptions, function(error, info){
//             if (error) {
//                 console.log(error);
//                 return res.json({Error: "Mail request Failed!!"});
//             } else {
//                 console.log('Email sent: ' + info.response);
//                 return res.json({Status: "Success"});
//             }
//             });
//         })
//     })
// })

app.post('/api/create', async (req, res) => {
    try {
        const name = req.body.name;
        const mail = req.body.email;
        const department = req.body.department;
        const address = req.body.address || '';

        const passwordLength = 10;
        const randomBytes = crypto.randomBytes(passwordLength);
        const password = randomBytes.toString('hex').slice(0, passwordLength);

        const hash = await bcrypt.hash(password.toString(), 10);

        const sqlQuery = "INSERT INTO employee (name, email, password, department, address) VALUES (@name, @mail, @hash, @department, @address)";
        const request = pool.request()
            .input('name', sql.NVarChar, name)
            .input('mail', sql.NVarChar, mail)
            .input('hash', sql.NVarChar, hash)
            .input('department', sql.NVarChar, department)
            .input('address', sql.NVarChar, address);

        const result = await request.query(sqlQuery);

        // Send account creation email
        const transporter = nodemailer.createTransport(smtpConfig);

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: mail,
            subject: 'Account Creation',
            text: `Your account has been created successfully!\n\nUsername: ${mail}\nPassword: ${password}\n\nUse this password to login and change your password.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.json({ Error: 'Mail request Failed!!' });
            } else {
                console.log('Email sent: ' + info.response);
                return res.json({ Status: 'Success' });
            }
        });
    } catch (err) {
        console.error('Error in account creation:', err.message);
        return res.json({ Error: 'Error in account creation' });
    }
});


// app.post('/examdetails', uploadpdf.fields([{ name: 'csvFile' }, { name: 'pdfFile' }]), (req, res) => {
//     const { csvFile, pdfFile } = req.files;
//     uploadCsv( "../client/public/pdf/" + csvFile[0].filename, req)

//     const values = [
//         req.body.examName,
//         req.body.year,
//         req.body.department,
//         pdfFile[0].filename
//     ]

//     const sql = "INSERT INTO examschedulepdf (`examname`, `year`, `department`, `filename`) VALUES (?)"
//     con.query(sql, [values], (err, result) => {
//         if(err) return res.json({Error: "Upload Failure"});
//         return res.json({Status: "Success"});
//     })
// })

app.post('/api/examdetails', uploadpdf.fields([{ name: 'csvFile' }, { name: 'pdfFile' }]), async (req, res) => {
    try {
        const { csvFile, pdfFile } = req.files;
        uploadCsv("../client/public/pdf/" + csvFile[0].filename, req);

        const values = [
            req.body.examName,
            req.body.year,
            req.body.department,
            pdfFile[0].filename
        ];

        const sqlQuery = "INSERT INTO examschedulepdf (examname, year, department, filename) VALUES (@examName, @year, @department, @filename)";
        const request = pool.request()
            .input('examName', sql.NVarChar, values[0])
            .input('year', sql.NVarChar, values[1])
            .input('department', sql.NVarChar, values[2])
            .input('filename', sql.NVarChar, values[3]);

        const result = await request.query(sqlQuery);
        return res.json({ Status: 'Success' });
    } catch (err) {
        console.error('Error uploading exam details:', err.message);
        return res.json({ Error: 'Upload Failure' });
    }
});

// function uploadCsv(path,req){
//     let stream = fs.createReadStream(path)
//     let csvDataColl = []
//     let fileStream = csv
//     .parse()
//     .on('data', function(data){
//         data.push(req.body.examName)
//         data.push(req.body.year)
//         data.push(req.body.department)
//         csvDataColl.push(data)
//     })
//     .on('end', function(){
//         csvDataColl.shift()
//         let query = "INSERT INTO examdetails (`date`,`slot`,`starttime`,`endtime`,`roomnumber`,`course`,`facultyname`,`facultymail`,`examname`,`academicyear`,`department`) VALUES (?)"        
//         for (let i = 0; i < csvDataColl.length; i++) {
//             const rowData = csvDataColl[i];          
//             con.query(query, [rowData], (error, res) => {

//                 var transporter = nodemailer.createTransport(smtpConfig);
            
//                 var mailOptions = {
//                 from: process.env.MAIL_USER,
//                 to: rowData[7],
//                 subject: 'Exam Invigilation Duty',
//                 text: `You have alloted to the invigilation duty for the ${rowData[8]} exam ${rowData[9]}!\n\nCourse: ${rowData[5]}\nDate: ${rowData[0]}\nSlot: ${rowData[1]}\nRoom Number: ${rowData[4]}\nStart Time: ${rowData[2]}\n\nPlease be present at the exam hall 15 minutes before the exam starts.`
//                 };
                  
//                 transporter.sendMail(mailOptions, function(error, info){
//                 if (error) {
//                     console.log(error);
//                 } else {
//                     console.log('Email sent: ' + info.response);
//                 }
//                 });
//             });
//         }
//         fs.unlinkSync(path) 
//     })
//     stream.pipe(fileStream)
// }

async function uploadCsv(path, req) {
    const csvDataColl = [];
    const stream = fs.createReadStream(path);
    const fileStream = csv.parse()
        .on('data', function (data) {
            data.push(req.body.examName);
            data.push(req.body.year);
            data.push(req.body.department);
            csvDataColl.push(data);
        })
        .on('end', async function () {
            csvDataColl.shift();

            const query = "INSERT INTO examdetails (date, slot, starttime, endtime, roomnumber, course, facultyname, facultymail, examname, academicyear, department) VALUES (@date, @slot, @starttime, @endtime, @roomnumber, @course, @facultyname, @facultymail, @examname, @academicyear, @department)";

            for (const rowData of csvDataColl) {
                const request = pool.request()
                    .input('date', sql.NVarChar, rowData[0])
                    .input('slot', sql.NVarChar, rowData[1])
                    .input('starttime', sql.NVarChar, rowData[2])
                    .input('endtime', sql.NVarChar, rowData[3])
                    .input('roomnumber', sql.NVarChar, rowData[4])
                    .input('course', sql.NVarChar, rowData[5])
                    .input('facultyname', sql.NVarChar, rowData[6])
                    .input('facultymail', sql.NVarChar, rowData[7])
                    .input('examname', sql.NVarChar, rowData[8])
                    .input('academicyear', sql.NVarChar, rowData[9])
                    .input('department', sql.NVarChar, rowData[10]);

                await request.query(query);

                const transporter = nodemailer.createTransport(smtpConfig);
                const mailOptions = {
                    from: process.env.MAIL_USER,
                    to: rowData[7],
                    subject: 'Exam Invigilation Duty',
                    text: `You have been allotted to invigilate the ${rowData[8]} exam for ${rowData[9]}!\n\nCourse: ${rowData[5]}\nDate: ${rowData[0]}\nSlot: ${rowData[1]}\nRoom Number: ${rowData[4]}\nStart Time: ${rowData[2]}\n\nPlease be present at the exam hall 15 minutes before the exam starts.`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }

            fs.unlinkSync(path);
        });

    stream.pipe(fileStream);
}

// app.post('/timetable', (req, res) => {
//     const sql = "SELECT filename FROM examschedulepdf WHERE examname = ? AND year = ? AND department = ?"
//     con.query(sql, [req.body.examName, req.body.year, req.body.department], (err, result) => {
//         if(err) return res.json({Error: "SQL error!!"});
//         if (result.length > 0) {

//             const sql1 = "SELECT * FROM examdetails WHERE examname = ? AND academicyear = ? AND department = ? ORDER BY date"
//             con.query(sql1, [req.body.examName, req.body.year, req.body.department], (err, result1) => {
//                 if(err) return res.json({Error: "SQL error!!"});
//                 if (result.length > 0) {        
//                     return res.json({ Status: "Success", Result: result, Result1: result1});
//                 } else {
//                     return res.json({Error: "No File Found!!"});
//                 }
//             })
//         } else {
//             return res.json({Error: "No File Found!!"});
//         }
//     })
// })

app.post('/api/timetable', async (req, res) => {
    try {
        const sqlQuery = "SELECT filename FROM examschedulepdf WHERE examname = @examName AND year = @year AND department = @department";
        const request = pool.request()
            .input('examName', sql.NVarChar, req.body.examName)
            .input('year', sql.NVarChar, req.body.year)
            .input('department', sql.NVarChar, req.body.department);

        const result = await request.query(sqlQuery);

        if (result.recordset.length > 0) {
            const sqlQuery1 = "SELECT * FROM examdetails WHERE examname = @examName AND academicyear = @year AND department = @department ORDER BY date";
            const request1 = pool.request()
                .input('examName', sql.NVarChar, req.body.examName)
                .input('year', sql.NVarChar, req.body.year)
                .input('department', sql.NVarChar, req.body.department);

            const result1 = await request1.query(sqlQuery1);

            if (result1.recordset.length > 0) {
                return res.json({ Status: 'Success', Result: result.recordset, Result1: result1.recordset });
            } else {
                return res.json({ Error: 'No File Found!!' });
            }
        } else {
            return res.json({ Error: 'No File Found!!' });
        }
    } catch (err) {
        console.error('Error retrieving timetable:', err.message);
        return res.json({ Error: 'SQL error!!' });
    }
});

// var email;
// app.get('/getExams/:id', (req, res) => {
//     const id = req.params.id;
//     // Fid -> Femail
//     const sql1 = "SELECT * FROM employee WHERE id = ?";
//     con.query(sql1,[id], (err, result) => {
//         if(err) console.log("Femail fetch error")
//         else email = result[0].email
//     })
//     //Femail -> resp exams
//     const sql = "SELECT * FROM examdetails WHERE facultymail = ?";
//     con.query(sql,[email], (err, result) => {
//         if(err) return res.json({Error: "Get exams error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

app.get('/api/getExams/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch faculty email
        const sql1 = "SELECT * FROM employee WHERE id = @id";
        const result1 = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(sql1);

        if (result1.recordset.length > 0) {
            const email = result1.recordset[0].email;

            // Fetch exams for faculty
            const sql2 = "SELECT * FROM examdetails WHERE facultymail = @email";
            const result2 = await pool.request()
                .input('email', sql.NVarChar, email)
                .query(sql2);

            return res.json({ Status: 'Success', Result: result2.recordset });
        } else {
            return res.json({ Error: 'Faculty not found!!' });
        }
    } catch (err) {
        console.error('Error getting exams:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});


// app.get('/getAllExams', (req, res) => {
//     //Femail -> resp exams
//     const sql = "SELECT * FROM examdetails WHERE date > CURDATE()";
//     con.query(sql,(err, result) => {
//         if(err) return res.json({Error: "Get exams error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

app.get('/api/getAllExams', async (req, res) => {
    try {
        // Fetch exams with a date greater than the current date
        const sql = "SELECT * FROM examdetails WHERE date > CURRENT_TIMESTAMP";
        const result = await pool.request().query(sql);

        return res.json({ Status: 'Success', Result: result.recordset });
    } catch (err) {
        console.error('Error getting all exams:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});


// app.get('/examslot/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM examdetails WHERE id = ?";
//     con.query(sql,[id], (err, result) => {
//         if(err) return res.json({Error: "Get exams error in sql"});
//         else{
//             const values = [
//                 result[0].date,
//                 result[0].slot,
//                 result[0].date,
//                 result[0].facultymail
//             ]
//             const sql1 = "SELECT * FROM examdetails WHERE ((date = (?) AND slot <> (?)) OR (date <> (?))) AND facultymail <> (?) LIMIT 0, 25;";
//             con.query(sql1, values, (err, result1) => {
//                 if(err) return res.json({Error: "Get exams error in sql"});
//                 else{
//                     // console.log(result1)
//                     return res.json({Status: "Success", Result: result1})
//                 }
//             })
//         }
//     })
// })

app.get('/api/examslot/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch exam details for the given ID
        const sql = "SELECT * FROM examdetails WHERE id = @id";
        const result = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(sql);

        if (result.recordset.length > 0) {
            const examDetails = result.recordset[0];

            const values = [
                examDetails.date,
                examDetails.slot,
                examDetails.date,
                examDetails.facultymail
            ];

            // Fetch other exams for the same date and different slot or different date
            const sql1 = "SELECT * FROM examdetails WHERE ((date = @date AND slot <> @slot) OR (date <> @date)) AND facultymail <> @facultymail";
            const result1 = await pool.request()
                .input('date', sql.NVarChar, values[0])
                .input('slot', sql.NVarChar, values[1])
                .input('facultymail', sql.NVarChar, values[3])
                .query(sql1);

            return res.json({ Status: 'Success', Result: result1.recordset });
        } else {
            return res.json({ Error: 'Exam not found!!' });
        }
    } catch (err) {
        console.error('Error getting exam slots:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});


// app.get('/getstatus/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM employee WHERE id = ?";
//     var stats = "Pending";
//     con.query(sql,[id], (err, result) => {
//         if(err) return res.json({Error: "Get exams error in sql"});
//         else{
//             var mail = result[0].email;
//             const sql1 = "select * from examdetails where id in (SELECT fexamid FROM requests WHERE fmail =(?) AND status = ? ORDER BY id ASC);";
//             con.query(sql1, [mail, stats], (err, result1) => {
//                 if(err) return res.json({Error: "Get exams error in sql1"});
//                 else{
//                     const sql2 = "select * from examdetails where id in (SELECT texamid FROM requests WHERE fmail =(?) AND status = ? ORDER BY id ASC);";
//                     con.query(sql2, [mail, stats], (err, result2) => {
//                         if(err) return res.json({Error: "Get exams error in sql1"});
//                         else{
//                             console.log(result1)
//                             return res.json({Status: "Success", Result: result1, Result1: result2})
//                         }
//                     })
//                 }
//             })
//         }
//     })
// })

app.get('/api/getstatus/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch employee details for the given ID
        const sql = "SELECT * FROM employee WHERE id = @id";
        const result = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(sql);

        if (result.recordset.length > 0) {
            const employeeDetails = result.recordset[0];
            const mail = employeeDetails.email;
            const stats = "Pending";

            // Fetch exams requested by the employee (faculty)
            const sql1 = "SELECT * FROM examdetails WHERE id IN (SELECT fexamid FROM requests WHERE fmail = @mail AND status = @stats ORDER BY id ASC)";
            const result1 = await pool.request()
                .input('mail', sql.NVarChar, mail)
                .input('stats', sql.NVarChar, stats)
                .query(sql1);

            // Fetch exams requested for the employee (faculty)
            const sql2 = "SELECT * FROM examdetails WHERE id IN (SELECT texamid FROM requests WHERE fmail = @mail AND status = @stats ORDER BY id ASC)";
            const result2 = await pool.request()
                .input('mail', sql.NVarChar, mail)
                .input('stats', sql.NVarChar, stats)
                .query(sql2);

            return res.json({ Status: 'Success', Result: result1.recordset, Result1: result2.recordset });
        } else {
            return res.json({ Error: 'Employee not found!!' });
        }
    } catch (err) {
        console.error('Error getting status:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});

// app.get('/getrequeststatus/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM employee WHERE id = ?";
//     var stats = "Pending"
//     con.query(sql,[id], (err, result) => {
//         if(err) return res.json({Error: "Get exams error in sql"});
//         else{
//             var mail = result[0].email;
//             console.log(mail);
//             const sql1 = "select * from examdetails where id in (SELECT fexamid FROM requests WHERE tmail =(?) AND status = ? ORDER BY id ASC);";
//             con.query(sql1, [mail, stats], (err, result1) => {
//                 if(err) return res.json({Error: "Get exams error in sql1"});
//                 else{
//                     const sql2 = "select * from examdetails where id in (SELECT texamid FROM requests WHERE tmail =(?) AND status = ? ORDER BY id ASC);";
//                     con.query(sql2, [mail, stats], (err, result2) => {
//                         if(err) return res.json({Error: "Get exams error in sql1"});
//                         else{
//                             console.log(result1)
//                             return res.json({Status: "Success", Result: result1, Result1: result2})
//                         }
//                     })
//                 }
//             })
//         }
//     })
// })

app.get('/api/getrequeststatus/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch employee details for the given ID
        const sql = "SELECT * FROM employee WHERE id = @id";
        const result = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(sql);

        if (result.recordset.length > 0) {
            const employeeDetails = result.recordset[0];
            const mail = employeeDetails.email;
            const stats = "Pending";

            // Fetch exams requested by the employee (student)
            const sql1 = "SELECT * FROM examdetails WHERE id IN (SELECT fexamid FROM requests WHERE tmail = @mail AND status = @stats ORDER BY id ASC)";
            const result1 = await pool.request()
                .input('mail', sql.NVarChar, mail)
                .input('stats', sql.NVarChar, stats)
                .query(sql1);

            // Fetch exams requested for the employee (student)
            const sql2 = "SELECT * FROM examdetails WHERE id IN (SELECT texamid FROM requests WHERE tmail = @mail AND status = @stats ORDER BY id ASC)";
            const result2 = await pool.request()
                .input('mail', sql.NVarChar, mail)
                .input('stats', sql.NVarChar, stats)
                .query(sql2);

            return res.json({ Status: 'Success', Result: result1.recordset, Result1: result2.recordset });
        } else {
            return res.json({ Error: 'Employee not found!!' });
        }
    } catch (err) {
        console.error('Error getting request status:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});


// app.post('/setrequest/:id1/:id2/:id3', (req, res) => {
//     const fid = req.params.id1;
//     const tid = req.params.id2;
//     const tmail = req.params.id3;
//     const sql = "SELECT * FROM examdetails WHERE id = ?";
//     con.query(sql,[fid], (err, result) => {
//         if(err) return res.json({Error: "Get exams error in sql"});
//         else{
//             var fmail = result[0].facultymail;
//             var stats = "Pending";
//             const values = [
//                 fmail,
//                 tmail,
//                 fid,
//                 tid,
//                 stats
//             ]
//             const sql1 = "INSERT INTO requests (`fmail`,`tmail`,`fexamid`,`texamid`, `status`) VALUES (?)";
//             con.query(sql1, [values], (err, result1) => {
//                 if(err) return res.json({Error: err});
//                 else{

//                     var transporter = nodemailer.createTransport(smtpConfig);
            
//                     var mailOptions = {
//                     from: process.env.MAIL_USER,
//                     to: tmail,
//                     subject: 'Request for Exchange of Invigilation Duty',
//                     text: `Request received for exchange of invigilation duty from ${fmail}\n\nPlease check your Inbox Request section in Exam_Alteration_Helper System to either approve or reject.`
//                     };
                      
//                     transporter.sendMail(mailOptions, function(error, info){
//                     if (error) {
//                         console.log(error);
//                     } else {
//                         console.log('Email sent: ' + info.response);
//                     }
//                     });

//                     return res.json({Status: "Success", Result: result1})
//                 }
//             })
//         }
//     })
// })

app.post('/api/setrequest/:id1/:id2/:id3', async (req, res) => {
    try {
        const fid = req.params.id1;
        const tid = req.params.id2;
        const tmail = req.params.id3;

        // Fetch exam details for the faculty's exam
        const sql = "SELECT * FROM examdetails WHERE id = @fid";
        const result = await pool.request()
            .input('fid', sql.NVarChar, fid)
            .query(sql);

        if (result.recordset.length > 0) {
            const fmail = result.recordset[0].facultymail;
            const stats = "Pending";

            // Insert the request into the 'requests' table
            const sql1 = "INSERT INTO requests (fmail, tmail, fexamid, texamid, status) VALUES (@fmail, @tmail, @fid, @tid, @stats)";
            const result1 = await pool.request()
                .input('fmail', sql.NVarChar, fmail)
                .input('tmail', sql.NVarChar, tmail)
                .input('fid', sql.NVarChar, fid)
                .input('tid', sql.NVarChar, tid)
                .input('stats', sql.NVarChar, stats)
                .query(sql1);

            // Send email notification
            const transporter = nodemailer.createTransport(smtpConfig);
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: tmail,
                subject: 'Request for Exchange of Invigilation Duty',
                text: `Request received for exchange of invigilation duty from ${fmail}\n\nPlease check your Inbox Request section in Exam_Alteration_Helper System to either approve or reject.`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            return res.json({ Status: 'Success', Result: result1.recordset });
        } else {
            return res.json({ Error: 'Exam not found!!' });
        }
    } catch (err) {
        console.error('Error setting request:', err.message);
        return res.json({ Error: err.message });
    }
});

// app.get('/getcurrentstatus/:id1/:id2', (req, res) => {
//     const fid = req.params.id1;
//     const tid = req.params.id2;
//     const sql = "SELECT status FROM requests WHERE fexamid = ? AND texamid = ?";
//     con.query(sql, [fid, tid], (err, result) => {
//       if (err) {
//         return res.json({ Error: "Get exams error in SQL" });
//       } else {
//         if (result.length === 0) {
//           return res.json({ Status: "Success", Result: 0 });
//         } else {
//             // console.log(result[0].status)
//           return res.json({ Status: "Success", Result: result[0].status });
//         }
//       }
//     });
// });

app.get('/api/getcurrentstatus/:id1/:id2', async (req, res) => {
    try {
        const fid = req.params.id1;
        const tid = req.params.id2;

        // Fetch status from the 'requests' table
        const sql = "SELECT status FROM requests WHERE fexamid = @fid AND texamid = @tid";
        const result = await pool.request()
            .input('fid', sql.NVarChar, fid)
            .input('tid', sql.NVarChar, tid)
            .query(sql);

        if (result.recordset.length === 0) {
            return res.json({ Status: 'Success', Result: 0 });
        } else {
            return res.json({ Status: 'Success', Result: result.recordset[0].status });
        }
    } catch (err) {
        console.error('Error getting current status:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});

// app.put('/approverequest/:id/:id2/:name1/:name2/:mail1/:mail2', (req, res) => {
//     const fid = req.params.id;
//     const tid = req.params.id2;
//     const fname = req.params.name1;
//     const tname = req.params.name2;
//     const fmail = req.params.mail1;
//     const tmail = req.params.mail2;
//     const approve = "Approved";
  
//     con.beginTransaction((err) => {
//         if (err) {
//             return res.json({ Error: "Failed to begin transaction" });
//         }
      
//         const sql1 = "UPDATE requests SET status = ? WHERE fexamid = ? AND texamid = ?;";
//         con.query(sql1, [approve, fid, tid], (err, result) => {
//             if (err) {
//                 con.rollback(() => {
//                     return res.json({ Error: "Error updating requests table" });
//                 });
//             } else {
//                 const sql2 = "UPDATE examdetails SET facultyname = ?, facultymail = ? WHERE id = ?;";
//                 con.query(sql2, [tname, tmail, fid], (err, result) => {
//                     if (err) {
//                         con.rollback(() => {
//                             return res.json({ Error: "Error updating examdetails table" });
//                         });
//                     } else {
//                         const sql3 = "UPDATE examdetails SET facultyname = ?, facultymail = ? WHERE id = ?;";
//                         con.query(sql3, [fname, fmail, tid], (err, result) => {
//                             if (err) {
//                                 con.rollback(() => {
//                                     return res.json({ Error: "Error updating examdetails table" });
//                                 });
//                             } else {
//                                 con.commit((err) => {
//                                     if (err) {
//                                         con.rollback(() => {
//                                             return res.json({ Error: "Failed to commit transaction" });
//                                         });
//                                     } else {

//                                         var transporter = nodemailer.createTransport(smtpConfig);
            
//                                         var mailOptions = {
//                                         from: process.env.MAIL_USER,
//                                         to: tmail,
//                                         subject: 'Request for Exchange of Invigilation Duty',
//                                         text: `The faculty has accepted your swap request from ${tmail}\n\nPlease check your Exam_Alteration_Helper System.`
//                                         };
                                          
//                                         transporter.sendMail(mailOptions, function(error, info){
//                                         if (error) {
//                                             console.log(error);
//                                         } else {
//                                             console.log('Email sent: ' + info.response);
//                                         }
//                                         });

//                                         return res.json({ Status: "Success" });
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     });
// });

app.put('/api/approverequest/:id/:id2/:name1/:name2/:mail1/:mail2', async (req, res) => {
    const fid = req.params.id;
    const tid = req.params.id2;
    const fname = req.params.name1;
    const tname = req.params.name2;
    const fmail = req.params.mail1;
    const tmail = req.params.mail2;
    const approve = "Approved";

    try {
        // Start a transaction
        await pool.transaction(async (transaction) => {
            // Update status in the 'requests' table
            const sql1 = "UPDATE requests SET status = @approve WHERE fexamid = @fid AND texamid = @tid";
            await transaction.request()
                .input('approve', sql.NVarChar, approve)
                .input('fid', sql.NVarChar, fid)
                .input('tid', sql.NVarChar, tid)
                .query(sql1);

            // Update faculty details in the 'examdetails' table for the faculty's exam
            const sql2 = "UPDATE examdetails SET facultyname = @tname, facultymail = @tmail WHERE id = @fid";
            await transaction.request()
                .input('tname', sql.NVarChar, tname)
                .input('tmail', sql.NVarChar, tmail)
                .input('fid', sql.NVarChar, fid)
                .query(sql2);

            // Update faculty details in the 'examdetails' table for the target exam
            const sql3 = "UPDATE examdetails SET facultyname = @fname, facultymail = @fmail WHERE id = @tid";
            await transaction.request()
                .input('fname', sql.NVarChar, fname)
                .input('fmail', sql.NVarChar, fmail)
                .input('tid', sql.NVarChar, tid)
                .query(sql3);
        });

        // Send email notification
        const transporter = nodemailer.createTransport(smtpConfig);
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: tmail,
            subject: 'Request for Exchange of Invigilation Duty',
            text: `The faculty has accepted your swap request from ${tmail}\n\nPlease check your Exam_Alteration_Helper System.`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.json({ Status: 'Success' });
    } catch (err) {
        console.error('Error approving request:', err.message);
        return res.json({ Error: err.message });
    }
});

// app.put('/rejectrequest/:id/:id2/:name1/:name2/:mail1/:mail2', (req, res) => {
//     const fid = req.params.id;
//     const tid = req.params.id2;
//     const approve = "Rejected";   
//     const sql = "UPDATE requests SET status = ? WHERE fexamid = ? AND texamid = ?;";
//     con.query(sql, [approve, fid, tid], (err, result) => {
//       if (err) {
//         return res.json({ Error: "Get exams error in SQL" });
//       } else {
//         return res.json({ Status: "Success"});
//       }
//     });
// });

app.put('/api/rejectrequest/:id/:id2/:name1/:name2/:mail1/:mail2', async (req, res) => {
    try {
        const fid = req.params.id;
        const tid = req.params.id2;
        const approve = "Rejected";

        // Update status in the 'requests' table
        const sql = "UPDATE requests SET status = @approve WHERE fexamid = @fid AND texamid = @tid";
        const result = await pool.request()
            .input('approve', sql.NVarChar, approve)
            .input('fid', sql.NVarChar, fid)
            .input('tid', sql.NVarChar, tid)
            .query(sql);

        return res.json({ Status: 'Success' });
    } catch (err) {
        console.error('Error rejecting request:', err.message);
        return res.json({ Error: 'Get exams error in SQL' });
    }
});


// app.get('/getRatings', (req, res) => {
//     const sql = "SELECT Employee.name, Employee.department, Employee.image, Leaderboard.rating FROM Leaderboard JOIN Employee ON Leaderboard.fid = Employee.id";
//     con.query(sql,(err, result) => {
//         if(err) return res.json({Error: "Get employee error in sql"});
//         return res.json({Status: "Success", Result: result})
//     })
// })

app.get('/api/getRatings', async (req, res) => {
    try {
        // Fetch data from 'Leaderboard' and 'Employee' tables
        const sql = "SELECT Employee.name, Employee.department, Employee.image, Leaderboard.rating FROM Leaderboard JOIN Employee ON Leaderboard.fid = Employee.id";
        const result = await pool.request().query(sql);

        return res.json({ Status: 'Success', Result: result.recordset });
    } catch (err) {
        console.error('Error getting ratings:', err.message);
        return res.json({ Error: 'Get employee error in SQL' });
    }
});

app.get('/api/', (req, res) => {
    return res.send("Exam Alteration Helper Server Up & Running!!")
})

app.listen(process.env.SERVER_PORT, ()=> {
    console.log("Running on port "+process.env.SERVER_PORT);
})
