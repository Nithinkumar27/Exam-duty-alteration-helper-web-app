import './ExamList.css';
import ExamList from './ExamList'; 
import React from 'react'

const FHome = () => {
  return (
    <div className='summa'>
      <h3 style={{ textAlign: 'center' ,padding:'30px',color:'burlywood'}}>UPCOMING EXAM SLOTS </h3>
        <ExamList></ExamList>
    </div>
  )
}

export default FHome