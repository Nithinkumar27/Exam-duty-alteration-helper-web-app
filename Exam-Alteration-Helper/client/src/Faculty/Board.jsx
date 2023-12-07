import React, {  useEffect,useState } from 'react'
import Profiles from './Profile';
import axios from 'axios'
import './Board.css';
export default function Board() {
    const [data, setData] = useState([])
    useEffect(()=> {
        var id;
        axios.get('/api/fdashboard')
            .then(res => {
                console.log(res);
                id = res.data.id;
                console.log(id)
                //
                axios.get('/api/getRatings')
                .then(res => {
                  if(res.data.Status === "Success") {
                    console.log(res.data.Result);
                    setData(res.data.Result);
                  } else {
                    alert("Error")
                  }
                })
                .catch(err => console.log(err));
            })
      }, [])

  return (
    <div className="board">
        <h1 className='leaderboard'>Leaderboard</h1>

        <Profiles Leaderboard={data}></Profiles>

    </div>
  )
}