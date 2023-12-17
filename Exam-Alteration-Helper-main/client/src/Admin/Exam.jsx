import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Exam = () => {
  const navigate = useNavigate()
  
  const [examName, setExamName] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [csvFile, setCSVFile] = useState(null);
  const [pdfFile, setPDFFile] = useState(null);

  const handleCSVFileChange = (e) => {
    setCSVFile(e.target.files[0]);
  };

  const handlePDFFileChange = (e) => {
    setPDFFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('examName', examName);
    formData.append('year', year);
    formData.append('department', department);
    formData.append('csvFile', csvFile);
    formData.append('pdfFile', pdfFile);

    axios.post('http://localhost:8081/examdetails', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        alert('Exam details uploaded successfully');
        navigate('/dispexam')
      })
      .catch((err) => console.log(err));
  };

  const handleInputChange = (event, field) => {
    if (field === 'examName') {
      setExamName(event.target.value);
    } else if (field === 'year') {
      setYear(event.target.value);
    } else if (field === 'department') {
      setDepartment(event.target.value);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center pt-4">
      <h2>Add Exam Schedule</h2>
      <form className="row g-3 w-50" onSubmit={handleSubmit}>
        <div className="col-12">
          <label htmlFor="examName" className="form-label">
            Exam Name
          </label>
          <select
            id="examName"
            className="form-select"
            value={examName}
            onChange={(e) => handleInputChange(e, 'examName')}
          >
            <option value="">Select Exam Name</option>
            <option value="ENDSEM">End Sem</option>
            <option value="MIDTERM">Mid Term</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </div>
        <div className="col-12">
          <label htmlFor="year" className="form-label">
            Academic Year
          </label>
          <input
            type="text"
            className="form-control"
            id="year"
            value={year}
            placeholder="Enter Academic Year"
            onChange={(e) => handleInputChange(e, 'year')}
          />
        </div>
        <div className="col-12">
          <label htmlFor="department" className="form-label">
            Department
          </label>
          <select
            id="department"
            className="form-select"
            value={department}
            onChange={(e) => handleInputChange(e, 'department')}
          >
            <option value="">Select Exam Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MEE">MEE</option>
            <option value="CCE">CCE</option>
          </select>
        </div>
        <div className="col-12">
          <label htmlFor="csvFile" className="form-label">
            CSV File
          </label>
          <input
            type="file"
            className="form-control"
            id="csvFile"
            accept=".csv"
            onChange={handleCSVFileChange}
          />
        </div>
        <div className="col-12">
          <label htmlFor="pdfFile" className="form-label">
            PDF File
          </label>
          <input
            type="file"
            className="form-control"
            id="pdfFile"
            accept=".pdf"
            onChange={handlePDFFileChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default Exam;
