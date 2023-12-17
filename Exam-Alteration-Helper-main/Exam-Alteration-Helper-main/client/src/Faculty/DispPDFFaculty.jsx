import React, { useState } from 'react';
import axios from 'axios';

function DispPDFFaculty() {
  const [data, setData] = useState({
    examName: '',
    year: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [tabledata, setTabledata] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8081/timetable', data)
      .then(res => {
        if (res.data.Status === "Success") {
            setError('');
            const filename = res.data.Result[0].filename;
            setPdfUrl(`http://localhost:3000/pdf/${filename}`);
            setTabledata(res.data.Result1);
        } else {
          setError(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="d-flex flex-column align-items-center pt-4">
      <h2>Search Time Table</h2><br></br>
      <form className="w-90" onSubmit={handleSubmit}>
        <div className="d-flex">
          <div className="flex-grow-1 me-2">
            <label htmlFor="examName" className="form-label">
              Exam Name
            </label>
            <select
              id="examName"
              className="form-select"
              onChange={e => setData({ ...data, examName: e.target.value })}
            >
              <option value="">Select Exam Name</option>
              <option value="ENDSEM">End Sem</option>
              <option value="MIDTERM">Mid Term</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
          </div>
          <div className="flex-grow-1 me-2">
            <label htmlFor="year" className="form-label">
              Academic Year
            </label>
            <input
              type="text"
              className="form-control"
              id="year"
              placeholder="Enter Academic Year"
              onChange={e => setData({ ...data, year: e.target.value })}
            />
          </div>
          <div className="flex-grow-1">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <select
              id="department"
              className="form-select"
              onChange={e => setData({ ...data, department: e.target.value })}
            >
              <option value="">Select Exam Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MEE">MEE</option>
              <option value="CCE">CCE</option>
            </select>
          </div>
        </div>
        <div className="text-center mt-3">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
        <div className="text-center">
          <div className="text-danger">
            {error && error}
          </div>
        </div>
      </form>
      {pdfUrl && (
        <div className="mt-4">
          <embed src={pdfUrl} width="1200" height="600" type="application/pdf" />
        </div>
      )}

      {tabledata && (
        <div className="mt-4">
          <h3>Faculty Allotment</h3>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Slot</th>
                <th scope="col">Start-Time</th>
                <th scope="col">End-Time</th>
                <th scope="col">Room No</th>
                <th scope="col">Course</th>
                <th scope="col">Faculty</th>
              </tr>
            </thead>
            <tbody>
              {tabledata.map((row, index) => (
                <tr key={index}>
                  <td>{row.date.split("T")[0]}</td>
                  <td>{row.slot}</td>
                  <td>{row.starttime}</td>
                  <td>{row.endtime}</td>
                  <td>{row.roomnumber}</td>
                  <td>{row.course}</td>
                  <td>{row.facultyname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DispPDFFaculty;
