pragma solidity ^0.8.0;

contract MedicalRecord {
    enum Role { None, Doctor, Nurse }

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
    mapping(address => Role) private roles;
    mapping(uint => Comment[]) private recordComments; 
    uint private recordCounter;

    modifier onlyDoctor() {
        require(roles[msg.sender] == Role.Doctor, "Caller is not a doctor");
        _;
    }

    modifier onlyAuthorized(uint _recordId) {
        require(
            _recordId < recordCounter,
            "Record does not exist"
        );
        require(
            records[_recordId].patient == msg.sender || roles[msg.sender] == Role.Doctor || roles[msg.sender] == Role.Nurse,
            "Unauthorized action"
        );
        _;
    }

    event RecordCreated(uint indexed recordId, address indexed patient);
    event RecordUpdated(uint indexed recordId, string newData, address indexed updatedBy);
    event RoleStatusChanged(address user, Role role);
    event CommentAdded(uint indexed recordId, uint commentId, string commentText, address commenter);
    event CommentDeleted(uint indexed recordId, uint commentId); 

    constructor() {
        // Set the deployer as a doctor.
        roles[msg.sender] = Role.Doctor;
    }

    function setRole(address _user, Role _role) external onlyDoctor {
        roles[_user] = _role;
        emit RoleStatusChanged(_user, _role);
    }

    function createRecord(string memory _data) external {
        records[recordCounter] = Record(recordCounter, _data, msg.sender);
        emit RecordCreated(recordCounter, msg.sender);
        recordCounter++;
    }

    function updateRecord(uint _recordId, string memory _newData) external onlyAuthorized(_recordId) {
        Record storage record = records[_recordId];
        record.data = _newData;
        emit RecordUpdated(_recordId, _newData, msg.sender);
    }

    function addCommentToRecord(uint _recordId, string memory _commentText) external onlyAuthorized(_recordId) {
        Comment memory newComment = Comment({id: recordComments[_recordId].length, commentText: _commentText, commenter: msg.sender});
        recordComments[_recordId].push(newComment);
        emit CommentAdded(_recordId, newComment.id, _commentText, msg.sender);
    }

    function deleteComment(uint _recordId, uint _commentId) external {
        require(
            _recordId < recordCounter,
            "Record does not exist"
        );
        require(
            _commentId < recordComments[_recordId].length,
            "Comment does not exist"
        );
        require(
            recordComments[_recordId][_commentId].commenter == msg.sender || roles[msg.sender] == Role.Doctor,
            "Unauthorized deletion attempt"
        );

        delete recordComments[_recordId][_commentId]; 
    
        emit CommentDeleted(_recordId, _commentId);
    }

    function getRecord(uint _recordId) external view onlyAuthorized(_recordId) returns (string memory) {
        return records[_recordId].data;
    }

    function getMultipleRecords(uint[] memory _recordIds) external view returns (string[] memory) {
        string[] memory recordsData = new string[](_recordIds.length);
        for(uint i = 0; i < _recordIds.length; i++) {
            require(
                _recordIds[i] < recordCounter,
                "One of the records does not exist"
            );
            require(
                records[_recordIds[i]].patient == msg.sender || roles[msg.sender] == Role.Doctor || roles[msg.sender] == Role.Nurse,
                "Unauthorized access to a record"
            );
            recordsData[i] = records[_recordIds[i]].data;
        }
        return recordsData;
    }

    function getComments(uint _recordId) external view onlyAuthorized(_recordId) returns (Comment[] memory) {
        require(
            _recordId < recordCounter,
            "Record does not exist"
        );
        return recordComments[_recordId];
    }
}