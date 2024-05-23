import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  condition: string;
  treatment: string;
}

const PatientRecords: React.FC = () => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/patientRecords`);
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching patient records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const requestEdit = (recordId: string) => {
    console.log(`Requesting edit for record ${recordId}`);
  };

  const shareRecord = (recordId: string) => {
    console.log(`Sharing record ${recordId}`);
  };

  if (loading) {
    return <div>Loading records...</div>;
  }

  return (
    <div>
      <h1>Patient Records</h1>
      {records.length === 0 ? (
        <p>No records to display.</p>
      ) : (
        records.map((record) => (
          <div key={record.id}>
            <h2>{record.name}</h2>
            <p>Age: {record.age}</p>
            <p>Condition: {record.condition}</p>
            <p>Treatment: {record.treatment}</p>
            <button onClick={() => requestEdit(record.id)}>Request Edit</button>
            <button onClick={() => shareRecord(record.id)}>Share Record</button>
          </div>
        ))
      )}
    </div>
  );
};

export default PatientRecords;