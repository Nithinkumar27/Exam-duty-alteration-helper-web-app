// import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios'
import React, { useEffect, useState } from 'react'


const Calender = () => {
    const [events, setEvents] = useState();
  
    useEffect(() => {
        var id;
        axios.get('http://localhost:8081/fdashboard')
        .then(res => {
          id = res.data.id  
                
          axios
            .get('http://localhost:8081/getExams/'+id)
            .then((res) => {
            if (res.data.Status === 'Success') {
              const formattedEvents = res.data.Result.map((exam) => {
                  var temp1=exam.starttime.slice(0,8)
                  var temp2=exam.endtime.slice(0,8)
                  var dat=exam.date.slice(0,10)
                  console.log(temp1)
                  console.log(dat)
                return {
                  id: exam.id,
                  title: exam.course+" -- "+exam.examname,
                  start: `${dat}T${temp1}`,
                  end: `${dat}T${temp2}`,
                };
              });
              // console.log(formattedEvents); // Verify formatted events
              setEvents(formattedEvents);
              console.log(events); // Verify events state
            } else {
              alert('Error');
            }
          })
        .catch((err) => console.log(err));
		})
        .catch(err => console.log(err));
        //
      
    }, []);
  
    console.log(events); // Verify events state outside of useEffect
  
    return (
      <div style={{ padding: '70px' }}>
        <h1>Calendar</h1>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
        />
      </div>
    );
  };
  
  export default Calender;
  