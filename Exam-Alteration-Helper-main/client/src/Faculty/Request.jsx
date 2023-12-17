import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Products } from './ProductsRequest';

function Request() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [stats, setStatus] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8081/examslot/' + id)
      .then(res => {
        setData(res.data.Result);
      })
      .catch(err => console.log(err));
  }, []);

  const getstatus = (tid) => {
    return axios.get('http://localhost:8081/getcurrentstatus/' + id + '/' + tid)
      .then(res => {
        if (res.data.Status === "Success") {
          return res.data.Result;
        } else {
          alert("Error in status fetching");
          return null;
        }
      })
      .catch(err => {
        console.log(err);
        return null;
      });
  };

  useEffect(() => {
    Promise.all(data.map(contents => getstatus(contents.id)))
      .then(statuses => {
        setStatus(statuses);
      })
      .catch(err => console.log(err));
  }, [data]);

  return (
    <div className='App'>
      {data.map((contents, index) => (
        <Products
          key={contents.id}
          id={contents.id}
          year={contents.academicyear}
          name={contents.examname}
          dept={contents.department}
          date={contents.date}
          starttime={contents.starttime}
          endtime={contents.endtime}
          slot={contents.slot}
          roomnumber={contents.roomnumber}
          course={contents.course}
          faculty={contents.facultyname}
          mail={contents.facultymail}
          status={stats[index]}
        />
      ))}
    </div>
  );
}

export default Request;
