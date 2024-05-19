import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Button, Table, Modal, FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_URL;

interface MedicalRecord {
  id: string;
  patientName: string;
  doctorName: string;
  description: string;
  date: string;
}

interface User {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
}

const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  role: 'admin',
};

const Dashboard: React.FC = () => {
  const [medicalRecords, setMedicalRecords] = React.useState<MedicalRecord[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [editRecord, setEditRecord] = React.useState<MedicalRecord | null>(null);
  const [permissions, setPermissions] = React.useState<{[key: string]: boolean}>({});

  const fetchMedicalRecords = async () => {
    const response = await fetch(`${API_URL}/medicalRecords`);
    const data = await response.json();
    setMedicalRecords(data);
  };

  const updateRecord = async (record: MedicalRecord) => {
    setShowModal(false);
  };

  const checkPermission = (permission: string) => permissions[permission];

  React.useEffect(() => {
    fetchMedicalRecords();
    setPermissions({
      canViewRecords: true,
      canRequestRecordUpdate: true,
      canManagePermissions: currentUser.role === 'admin',
    });
  }, []);

  return (
    <Container>
      {checkPermission('canViewRecords') && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Doctor Name</th>
              <th>Description</th>
              <th>Date</th>
              {checkPermission('canRequestRecordUpdate') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {medicalRecords.map((record, index) => (
              <tr key={record.id}>
                <td>{index + 1}</td>
                <td>{record.patientName}</td>
                <td>{record.doctorName}</td>
                <td>{record.description}</td>
                <td>{record.date}</td>
                {checkPermission('canRequestRecordUpdate') && (
                  <td>
                    <Button variant="primary" onClick={() => {
                      setEditRecord(record);
                      setShowModal(true);
                    }}>
                      Request Update
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Record Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editRecord && (
            <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormControl as="textarea" rows={3} defaultValue={editRecord.description} />
            </FormGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => updateRecord(editRecord)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const App: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={Dashboard} />
    </Switch>
  </Router>
);

export default App;