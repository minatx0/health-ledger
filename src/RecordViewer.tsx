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
  const [filter, setFilter] = useState<string>('');

  const logActivity = (message: string) => {
    console.log(`[${new Date().toISOString()}] - ${message}`);
  };

  useEffect(() => {
    const fetchRecords = async () => {
      logActivity('Fetching patient records...');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/patientRecords`);
        setRecords(response.data);
        logActivity('Successfully fetched patient records.');
      } catch (error) {
        console.error('Error fetching patient records:', error);
        logActivity('Failed to fetch patient records.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const requestEdit = (recordId: string) => {
    logActivity(`Requesting edit for record ${recordId}`);
    console.log(`Requesting edit for record ${recordId}`);
  };

  const shareRecord = (recordId: string) => {
    logActivity(`Sharing record ${recordId}`);
    console.log(`Sharing record ${recordId}`);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredRecords = records.filter(record =>
    record.condition.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div>Loading records...</div>;
  }

  return (
    <div>
      <h1>Patient Records</h1>
      <input
        type="text"
        value={filter}
        onChange={handleFilterChange}
        placeholder="Filter by condition"
      />
      {filteredRecords.length === 0 ? (
        <p>No records to display.</p>
      ) : (
        filteredRecords.map((record) => (
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