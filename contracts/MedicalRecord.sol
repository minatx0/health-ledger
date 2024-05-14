pragma solidity ^0.8.0;

contract MedicalRecord {
    struct Record {
        uint id;
        string data;
        address patient;
    }
    
    struct Comment {
        uint id;
        string commentText;
        address commenter;
    }

    mapping(uint => Record) private records;
    mapping(address => bool) private doctors;
    mapping(uint => Comment[]) private recordComments; // New mapping for record comments
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
    event CommentAdded(uint indexed recordId, uint commentId, string commentText, address commenter); // New event for comment addition

    constructor() {
        doctors[msg.sender] = true;
    }

    function setDoctorStatus(address _doctor, bool _status) external onlyDoctor {
        doctors[_doctor] = _status;
        emit DoctorStatusChanged(_doctor, _status);
    }

    function batchSetDoctorStatus(address[] memory _doctors, bool _status) external onlyDoctor {
        for(uint i = 0; i < _doctors.length; i++) {
            doctors[_doctors[i]] = _status;
            emit DoctorStatusChanged(_doctors[i], _status);
        }
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

    function addCommentToRecord(uint _recordId, string memory _commentText) external onlyDoctor {
        Comment memory newComment = Comment({id: recordComments[_recordId].length, commentText: _commentText, commenter: msg.sender});
        recordComments[_recordId].push(newComment);
        emit CommentAdded(_recordId, newComment.id, _commentText, msg.sender);
    }

    function getRecord(uint _recordId) external view returns (string memory) {
        require(records[_recordId].patient == msg.sender || doctors[msg.sender], "Unauthorized access");
        return records[_recordId].data;
    }

    function getMultipleRecords(uint[] memory _recordIds) external view returns (string[] memory) {
        string[] memory recordsData = new string[](_recordIds.length);
        for(uint i = 0; i < _recordIds.length; i++) {
            require(records[_recordIds[i]].patient == msg.sender || doctors[msg.sender], "Unauthorized access to a record");
            recordsData[i] = records[_recordIds[i]].data;
        }
        return recordsData;
    }

    function getComments(uint _recordId) external view returns (Comment[] memory) {
        require(records[_recordId].patient == msg.sender || doctors[msg.sender], "Unauthorized access");
        return recordComments[_recordId];
    }
}