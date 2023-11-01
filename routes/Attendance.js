const express=require('express');
const router=express.Router();
const pool = require("../dbconnection");


// router.post('/in',(req,res)=>{
// const {student_id,enrollment_id,date,in_time}=req.body;
// let out_time='00:00'
// const query = 'INSERT INTO attendance (student_id, enrollment_id, date, in_time, out_time) VALUES (?, ?, ?, ?,?)';
// connection.query(query, [student_id, enrollment_id, date, in_time,out_time], (err, result) => {
//   if (err) {
//     console.error('Error inserting data:', err);
//     res.status(500).json({ error: 'Error inserting data' });
//   } else {
//     res.status(200).json({ message: 'Data inserted successfully' });
//   }
// });
// });
router.post('/in', (req, res) => {
  const { student_id, enrollment_id, date, in_time } = req.body;
  const out_time = '00:00:00';
  
  let enrl_id = enrollment_id;
  let enrollmentCleanedId = parseInt(enrl_id, 10).toString();

  // Use pool.getConnection() to get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      console.error('Error acquiring a connection:', err);
      res.status(500).json({ error: 'Error acquiring a connection' });
      return;
    }

    // Check if a record with the same date and enrollment_id already exists
    const selectQuery = 'SELECT * FROM  attendance WHERE out_time = ? AND date = ? AND enrollment_id = ?';

    connection.query(selectQuery, [out_time, date, enrollmentCleanedId], (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error selecting data:', selectErr);
        res.status(500).json({ error: 'Error selecting data' });
        connection.release(); // Release the connection back to the pool
      } else {
        if (selectResult.length > 0) {
          // If a matching record exists, update the out_time
          const updateQuery = 'UPDATE attendance SET out_time = ? WHERE out_time = ? AND date = ? AND enrollment_id = ?';
          connection.query(updateQuery, [in_time, out_time, date, enrollmentCleanedId], (updateErr, updateResult) => {
            if (updateErr) {
              console.error('Error updating data:', updateErr);
              res.status(500).json({ error: 'Error updating data' });
              connection.release(); // Release the connection back to the pool
            } else {
              res.status(200).json({ message: 'Data updated successfully' });
              console.log('Data updated successfully');
              connection.release(); // Release the connection back to the pool
            }
          });
        } else {
          // If no matching record exists, insert a new record
          const insertQuery = 'INSERT INTO attendance (student_id, enrollment_id, date, in_time, out_time) VALUES (?, ?, ?, ?, ?)';
          connection.query(insertQuery, [student_id, enrollmentCleanedId, date, in_time, out_time], (insertErr, insertResult) => {
            if (insertErr) {
              console.error('Error inserting data:', insertErr);
              res.status(500).json({ error: 'Error inserting data' });
              connection.release(); // Release the connection back to the pool
            } else {
              res.status(200).json({ message: 'Data inserted successfully' });
              console.log('Data inserted successfully');
              connection.release(); // Release the connection back to the pool
            }
          });
        }
      }
    });
  });
});


//IN-OUT


//IN-OUT Condition
router.post('/in-out', (req, res) => {
  const { student_id, enrollment_id, date, in_time } = req.body;
  const out_time = '00:00:00';

  let enrl_id = enrollment_id;
  let enrollmentCleanedId = parseInt(enrl_id, 10).toString();

  // Use pool.getConnection() to get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      console.error('Error acquiring a connection:', err);
      res.status(500).json({ error: 'Error acquiring a connection' });
      return;
    }

    // Check if a record with the same date and enrollment_id already exists
    const selectQuery = 'SELECT * FROM  attendance WHERE out_time = ? AND date = ? AND enrollment_id = ?';

    connection.query(selectQuery, [out_time, date, enrollmentCleanedId], (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error selecting data:', selectErr);
        res.status(500).json({ error: 'Error selecting data' });
        connection.release(); // Release the connection back to the pool
      } else {
        if (selectResult.length > 0) {
          res.send({ status: 'out', msg: 'Your Out' });
          connection.release(); // Release the connection back to the pool
        } else {
          res.send({ status: 'in', msg: 'Your In' });
          connection.release(); // Release the connection back to the pool
        }
      }
    });
  });
});

// Endpoint to retrieve student data by enrollment_id
router.get('/student/:enrollmentId', (req, res) => {
  const enrollmentCleanedId = req.params.enrollmentId;
  const enrollmentId = parseInt(enrollmentCleanedId, 10).toString();

  // Use pool.getConnection() to get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      console.error('Error acquiring a connection:', err);
      res.status(500).json({ error: 'Error acquiring a connection' });
      return;
    }

    const query = 'SELECT student_id FROM enrollment WHERE enrollment_id = ?';
    connection.query(query, [enrollmentId], (err, results) => {
      if (err) {
        console.error('Error fetching student_id:', err);
        res.status(500).json({ error: 'Internal server error' });
        connection.release(); // Release the connection back to the pool
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: 'Enrollment not found' });
          connection.release(); // Release the connection back to the pool
        } else {
          const studentId = results[0].student_id;
          const studentQuery = 'SELECT student_id, first_name, last_name, upload_photo FROM student WHERE student_id = ?';
          connection.query(studentQuery, [studentId], (err, studentResults) => {
            if (err) {
              console.error('Error fetching student data:', err);
              res.status(500).json({ error: 'Internal server error' });
              connection.release(); // Release the connection back to the pool
            } else {
              if (studentResults.length === 0) {
                res.status(404).json({ error: 'Student not found' });
                connection.release(); // Release the connection back to the pool
              } else {
                const studentData = studentResults[0];
                res.json(studentData);
                connection.release(); // Release the connection back to the pool
              }
            }
          });
        }
      }
    });
  });
});


// Create an API endpoint to fetch attendance data with filters
router.get('/filter', (req, res) => {
  const { student_id, enrollment_id, course_id, batch_no, startDate, endDate } = req.query;

  // Start building the base query without any conditions
  let query = `SELECT e.student_id, s.first_name, s.middle_name, s.last_name,  a.*, e.course_id, e.batch_no
  FROM attendance a
  INNER JOIN enrollment e ON a.enrollment_id = e.enrollment_id
  INNER JOIN student s ON e.student_id = s.student_id
  `;

  // Create an array to store the values for conditions
  const conditionValues = [];

  // Create an array to store the conditions
  const conditions = [];

  // Check if each filter parameter is provided, and if so, add it to the query and conditionValues
  if (student_id) {
    conditions.push('e.student_id = ?');
    conditionValues.push(student_id);
  }

  if (enrollment_id) {
    conditions.push('e.enrollment_id = ?');
    conditionValues.push(enrollment_id);
  }

  if (course_id) {
    conditions.push('e.course_id = ?');
    conditionValues.push(course_id);
  }

  if (batch_no) {
    conditions.push('e.batch_no = ?');
    conditionValues.push(batch_no);
  }

  if (startDate && endDate) {
    conditions.push('a.date BETWEEN ? AND ?');
    conditionValues.push(startDate, endDate);
  }

  // Check if any conditions were added, and if so, append the WHERE clause to the query
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Use pool.getConnection() to get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      console.error('Error acquiring a connection:', err);
      res.status(500).json({ error: 'Error acquiring a connection' });
      return;
    }

    connection.query(query, conditionValues, (err, results) => {
      if (err) {
        console.error('Error fetching attendance data:', err);
        res.status(500).json({ error: 'Internal server error' });
        connection.release(); // Release the connection back to the pool
      } else {
        res.json(results);
        connection.release(); // Release the connection back to the pool
      }
    });
  });
});



// Fetch attendance data by attendance_id
router.get('/:attendanceId', (req, res) => {
  const attendanceId = req.params.attendanceId;
  const query = 'SELECT * FROM attendance WHERE attendance_id = ?';

  // Use pool.getConnection() to get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      console.error('Error acquiring a connection:', err);
      res.status(500).json({ error: 'Error acquiring a connection' });
      return;
    }

    connection.query(query, [attendanceId], (err, results) => {
      if (err) {
        console.error('Error fetching attendance data:', err);
        res.status(500).json({ error: 'Failed to fetch attendance data' });
        connection.release(); // Release the connection back to the pool
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: 'Attendance not found' });
          connection.release(); // Release the connection back to the pool
        } else {
          res.json(results[0]);
          connection.release(); // Release the connection back to the pool
        }
      }
    });
  });
});




// Update attendance data by attendance_id
router.put('/:attendanceId', (req, res) => {
  const attendanceId = req.params.attendanceId;
  const updatedData = req.body;


  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      return res.status(500).send('Database error');
    }
    const query = `UPDATE attendance SET ? WHERE attendance_id = ?`;

  connection.query(query, [updatedData, attendanceId], (err, results) => {
    if (err) {
      console.error('Error updating attendance data:', err);
      res.status(500).json({ error: 'Failed to update attendance data' });
      connection.release();
    } else {
      res.json({ message: 'Attendance data updated successfully' });
      connection.release();
    }
  });
  
  });


});


//
router.delete('/:attendanceId', (req, res) => {
  const attendanceId = req.params.attendanceId;

  pool.getConnection((err, connection) => {
    if (err) {
      // Handle connection error
      return res.status(500).send('Database error');
    }
  const query = `DELETE FROM attendance WHERE attendance_id = ?`;

  connection.query(query, [attendanceId], (err, results) => {
    if (err) {
      console.error('Error deleting attendance data:', err);
      res.status(500).json({ error: 'Failed to delete attendance data' });
      connection.release();
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Attendance not found' });
        connection.release();
      } else {
        res.json({ message: 'Attendance data deleted successfully' });
        connection.release();
      }
    }
  });
  
  });



});








module.exports=router