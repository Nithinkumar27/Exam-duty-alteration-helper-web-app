import React, { useEffect, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import { InboxProducts } from './InboxProduct';

import './SwapCSS.css';

function InboxRequest() {
  const [fdata, setFData] = useState([]);
  const [tdata, setTData] = useState([]);

  useEffect(() => {
    var id;
    axios.get('http://localhost:8081/fdashboard')
      .then(res => {
        console.log(res);
        id = res.data.id;
        
        axios.get('http://localhost:8081/getrequeststatus/' + id)
          .then(res => {
            if (res.data.Status === "Success") {
              setFData(res.data.Result);
              setTData(res.data.Result1);
              console.log(res.data.Result)
              console.log(res.data.Result1)
            } else {
            }
          })
          .catch(err => console.log(err));
      });
  }, []);

  const parentStyles = {
    display: 'flex',
    flexDirection: 'row',
    // Add other styles as needed
  };

  return (
    <div className='App' style={{ display: 'flex', flexDirection: 'column'}}>
      {fdata.length > 0 && tdata.length > 0 && (
        (() => {
          const products = [];
          const length = Math.min(fdata.length, tdata.length);

          for (let i = 0; i < length; i++) {
            const fdataElement = tdata[i];
            const tdataElement = fdata[i];

            products.push(
              <InboxProducts
                key={fdataElement.id}
                id={fdataElement.id}
                year={fdataElement.academicyear}
                name={fdataElement.examname}
                dept={fdataElement.department}
                date={fdataElement.date}
                starttime={fdataElement.starttime}
                endtime={fdataElement.endtime}
                slot={fdataElement.slot}
                roomnumber={fdataElement.roomnumber}
                course={fdataElement.course}
                faculty={fdataElement.facultyname}
                mail={fdataElement.facultymail}

                key1={tdataElement.id}
                id1={tdataElement.id}
                year1={tdataElement.academicyear}
                name1={tdataElement.examname}
                dept1={tdataElement.department}
                date1={tdataElement.date}
                starttime1={tdataElement.starttime}
                endtime1={tdataElement.endtime}
                slot1={tdataElement.slot}
                roomnumber1={tdataElement.roomnumber}
                course1={tdataElement.course}
                faculty1={tdataElement.facultyname}
                mail1={tdataElement.facultymail}
              />
            );
          }
          return products;
        })()
      )}
    </div>
  );
}

export default InboxRequest;