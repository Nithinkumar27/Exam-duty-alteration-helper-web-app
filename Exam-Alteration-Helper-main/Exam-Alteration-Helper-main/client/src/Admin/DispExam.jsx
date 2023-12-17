import { Products } from './DispExamProd';
//  import contents from './content';
 import axios from 'axios'
 import React, { useEffect, useState } from 'react'
 
 export default function ExamList() {
    const [data, setData] = useState([])

  useEffect(()=> {
    axios.get('http://localhost:8081/fdashboard')
		.then(res => {
            axios.get('http://localhost:8081/getAllExams/')
            .then(res => {
              if(res.data.Status === "Success") {
                setData(res.data.Result);
              } else {
                alert("Error")
              }
            })
            .catch(err => console.log(err));
		})
  }, [])
     return(
            <div className='App'>
                {data.map(contents => (
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
                    />
                ))}
            </div>
     )
 }