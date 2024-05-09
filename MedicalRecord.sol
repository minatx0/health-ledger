pragma solidity ^0.8.0;

contract MedicalRecordStorage {
    address public owner;

    struct MedicalRecord {
        uint recordId;
        string data;
        address patient;
    }

    mapping(address => MedicalRecord[]) private records;
    mapping(address => mapping(address => bool)) private accessPermissions;

    event AccessPermissionChanged(address indexed patient, address indexed requester, bool permission);
    event RecordUpdated(uint indexed recordId, address indexed patient);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyPatientOrOwner(address _patient) {
        require(msg.sender == _patient || msg.sender == owner, "Not authorized");
        _;
    }

    modifier hasAccess(address _patient) {
        require(accessPermissions[_patient][msg.sender] || msg.sender == _patient || msg.sender == owner, "Access denied");
        _;
    }

    function setAccessPermission(address _patient, address _requester, bool _permission) public onlyPatientOrOwner(_patient) {
        accessPermissions[_patient][_requester] = _permission;
        emit AccessPermissionChanged(_patient, _requester, _permission);
    }

    function updateRecord(uint _recordId, string calldata _data, address _patient) public onlyPatientOrOwner(_patient) {
        if (_recordId == 0) {
            records[_patient].push(MedicalRecord({
                recordId: records[_patient].length + 1,
                data: _data,
                patient: _patient
            }));
        } else {
            require(_recordId <= records[_patient].length, "Invalid record ID");
            MedicalRecord storage record = records[_patient][_recordId - 1];
            record.data = _data;
        }
        emit RecordUpdated(_recordId, _patient);
    }

    function getRecord(address _patient, uint _recordId) public view hasAccess(_patient) returns (string memory recordData) {
        require(_recordId > 0 && _recordId <= records[_patient].length, "Invalid record ID");
        return records[_patient][_recordId - 1].data;
    }

    function checkAccess(address _patient, address _requester) public view returns (bool) {
        return accessPermissions[_patient][_requester] || _requester == _patient || _requester == owner;
    }
}