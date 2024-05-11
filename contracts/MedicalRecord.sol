pragma solidity ^0.8.0;

contract MedicalRecord {
    struct Record {
        uint id;
        string data;
        address patient;
    }

    mapping(uint => Record) private records;
    mapping(address => bool) private doctors;
    uint private recordCounter;

    modifier onlyDoctor() {
        require(doctors[msg.sender], "Caller is not a doctor");
        _;
    }

    modifier onlyPatient(uint _recordId) {
        require(records[_recordId].patient == msg.sender, "Caller is not the patient of this record");
        _;
    }

    event RecordCreated(uint indexed recordId, address indexed patient);
    event RecordUpdated(uint indexed recordId, string newData, address indexed updatedBy);
    event DoctorStatusChanged(address doctor, bool status);

    constructor() {
        doctors[msg.sender] = true;
    }

    function setDoctorStatus(address _doctor, bool _status) external onlyDoctor {
        doctors[_doctor] = _status;
        emit DoctorStatusChanged(_doctor, _status);
    }

    function createRecord(string memory _data) external {
        records[recordCounter] = Record(recordCounter, _data, msg.sender);
        emit RecordCreated(recordCounter, msg.sender);
        recordCounter++;
    }

    function updateRecord(uint _recordId, string memory _newData) external onlyPatient(_recordId) {
        Record storage record = records[_recordId];
        record.data = _newData;
        emit RecordUpdated(_recordId, _newData, msg.sender);
    }

    function shareRecord(uint _recordId, address _doctor) external onlyPatient(_recordId) onlyDoctor {
        require(doctors[_doctor], "Target is not a doctor");
    }

    function getRecord(uint _recordId) external view returns (string memory) {
        require(records[_recordId].patient == msg.sender || doctors[msg.sender], "Unauthorized access");
        return records[_recordId].data;
    }
}