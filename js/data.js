/**
 * CampusShare - Equipment Tracking System
 * Database & State Management Layer
 */

const STORAGE_KEY_EQUIPMENT = 'campus_share_equipment_v1';
const STORAGE_KEY_HISTORY = 'campus_share_history_v1';
const STORAGE_KEY_STUDENTS = 'campus_share_students_v1';

// Seed Equipment Data
const DEFAULT_EQUIPMENT = [
  {
    id: 'LAP101',
    name: 'Apple MacBook Pro 14" M2',
    category: 'Laptop',
    icon: '💻',
    serial: 'SN-APL-882194',
    location: 'Innovation Lab - Rack A2',
    status: 'Issued',
    condition: 'Good',
    studentId: 'STU102',
    studentName: 'Rohan Sharma',
    studentDept: 'Computer Science & Engg',
    studentPhone: '+91 98765 43210',
    issueDate: '2026-10-30T10:30',
    returnDate: '2026-11-02T17:00',
    purpose: 'Deep Learning Hackathon project work',
    notes: 'Issued with 67W USB-C charger and protective sleeve.',
    totalIssues: 14
  },
  {
    id: 'LAP102',
    name: 'Dell XPS 15 (i7, 32GB RAM)',
    category: 'Laptop',
    icon: '💻',
    serial: 'SN-DEL-441029',
    location: 'Innovation Lab - Rack A2',
    status: 'Available',
    condition: 'Good',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'Clean OS install, battery health 96%.',
    totalIssues: 21
  },
  {
    id: 'LAP103',
    name: 'Lenovo ThinkPad P1 Gen 5 Workstation',
    category: 'Laptop',
    icon: '💻',
    serial: 'SN-LNV-772183',
    location: 'Innovation Lab - Rack A3',
    status: 'Overdue',
    condition: 'Good',
    studentId: 'STU108',
    studentName: 'Priya Patel',
    studentDept: 'Information Technology',
    studentPhone: '+91 98112 34567',
    issueDate: '2026-10-24T11:00',
    returnDate: '2026-10-28T16:00', // Overdue since 28 Oct
    purpose: 'CAD SolidWorks Lab Assignment',
    notes: 'Overdue by 2 days. 1st automated SMS reminder sent on 29 Oct.',
    totalIssues: 9
  },
  {
    id: 'CAM201',
    name: 'Sony Alpha A7 IV Mirrorless Camera',
    category: 'Camera',
    icon: '📷',
    serial: 'SN-SNY-990184',
    location: 'Media Studio - Cabinet C1',
    status: 'Issued',
    condition: 'Good',
    studentId: 'STU205',
    studentName: 'Aarav Mehta',
    studentDept: 'Media & Mass Communication',
    studentPhone: '+91 97234 56789',
    issueDate: '2026-10-29T14:00',
    returnDate: '2026-10-31T18:00',
    purpose: 'Annual Cultural Fest teaser shoot',
    notes: 'Includes 28-70mm lens, 2x batteries, 128GB SD card.',
    totalIssues: 32
  },
  {
    id: 'CAM202',
    name: 'Canon EOS R6 Mark II + 24-105mm Kit',
    category: 'Camera',
    icon: '📷',
    serial: 'SN-CAN-129038',
    location: 'Media Studio - Cabinet C1',
    status: 'Available',
    condition: 'Good',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'Lens cleaned, SD card formatted and tested.',
    totalIssues: 18
  },
  {
    id: 'PRO301',
    name: 'Epson EB-X06 3600LM Projector',
    category: 'Projector',
    icon: '📽️',
    serial: 'SN-EPS-301982',
    location: 'Seminar Hall Store - Shelf 1',
    status: 'Overdue',
    condition: 'Good',
    studentId: 'STU301',
    studentName: 'Ananya Iyer',
    studentDept: 'Electronics & Comm.',
    studentPhone: '+91 99881 22334',
    issueDate: '2026-10-25T09:30',
    returnDate: '2026-10-27T17:00', // Overdue since 27 Oct
    purpose: 'Robotics Workshop presentation in Room 402',
    notes: 'HDMI cable and power adapter included.',
    totalIssues: 26
  },
  {
    id: 'PRO302',
    name: 'BenQ 4K HDR Laser Smart Projector',
    category: 'Projector',
    icon: '📽️',
    serial: 'SN-BNQ-402911',
    location: 'Seminar Hall Store - Shelf 2',
    status: 'Available',
    condition: 'Good',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'New replacement bulb installed Oct 2026.',
    totalIssues: 12
  },
  {
    id: 'VR401',
    name: 'Meta Quest 3 (512GB) VR Headset',
    category: 'VR/AR',
    icon: '🥽',
    serial: 'SN-MTA-551029',
    location: 'Game Development Lab - Box 4',
    status: 'Issued',
    condition: 'Good',
    studentId: 'STU412',
    studentName: 'Vikram Singh',
    studentDept: 'Computer Science (AI & ML)',
    studentPhone: '+91 91234 98765',
    issueDate: '2026-10-28T15:00',
    returnDate: '2026-11-03T12:00',
    purpose: 'Unity VR Campus Tour Capstone Project',
    notes: 'Both Touch Plus controllers and link cable issued.',
    totalIssues: 8
  },
  {
    id: 'IOT501',
    name: 'Raspberry Pi 5 8GB AI Vision Kit',
    category: 'Lab Kit',
    icon: '🔬',
    serial: 'SN-RPI-501192',
    location: 'Embedded Systems Lab - Tray 8',
    status: 'Available',
    condition: 'Good',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'Includes official camera module v3 and 64GB MicroSD.',
    totalIssues: 15
  },
  {
    id: 'IOT502',
    name: 'Arduino Mega + Sensor Array Bundle',
    category: 'Lab Kit',
    icon: '🔬',
    serial: 'SN-ARD-882012',
    location: 'Embedded Systems Lab - Tray 9',
    status: 'Maintenance',
    condition: 'Damaged',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'Damaged USB port reported during previous return. Sent for soldering repair.',
    totalIssues: 24
  },
  {
    id: 'MIC601',
    name: 'Rode Wireless PRO Dual Mic System',
    category: 'Audio',
    icon: '🎙️',
    serial: 'SN-RDE-771920',
    location: 'Media Studio - Cabinet C2',
    status: 'Available',
    condition: 'Good',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'Transmitters and receiver 100% charged with magnetic clips.',
    totalIssues: 19
  },
  {
    id: 'GMB203',
    name: 'DJI RS 3 Pro Gimbal Stabilizer',
    category: 'Camera',
    icon: '🎥',
    serial: 'SN-DJI-661902',
    location: 'Media Studio - Cabinet C3',
    status: 'Available',
    condition: 'Good',
    studentId: null,
    studentName: null,
    studentDept: null,
    studentPhone: null,
    issueDate: null,
    returnDate: null,
    purpose: null,
    notes: 'Quick-release plate and focus motor tested.',
    totalIssues: 11
  }
];

// Seed Historical Audit Trail
const DEFAULT_HISTORY = [
  {
    id: 'TXN-9081',
    equipmentId: 'LAP101',
    equipmentName: 'Apple MacBook Pro 14" M2',
    studentId: 'STU102',
    studentName: 'Rohan Sharma',
    action: 'ISSUED',
    timestamp: '2026-10-30T10:30:00',
    expectedReturn: '2026-11-02T17:00:00',
    condition: 'Good',
    operator: 'Prof. Sharma (Lab In-Charge)',
    remarks: 'Issued for Deep Learning Hackathon'
  },
  {
    id: 'TXN-9079',
    equipmentId: 'CAM201',
    equipmentName: 'Sony Alpha A7 IV',
    studentId: 'STU205',
    studentName: 'Aarav Mehta',
    action: 'ISSUED',
    timestamp: '2026-10-29T14:00:00',
    expectedReturn: '2026-10-31T18:00:00',
    condition: 'Good',
    operator: 'Rajesh Kumar (Lab Tech)',
    remarks: 'Media Fest prep shoot'
  },
  {
    id: 'TXN-9065',
    equipmentId: 'VR401',
    equipmentName: 'Meta Quest 3 VR Headset',
    studentId: 'STU412',
    studentName: 'Vikram Singh',
    action: 'ISSUED',
    timestamp: '2026-10-28T15:00:00',
    expectedReturn: '2026-11-03T12:00:00',
    condition: 'Good',
    operator: 'Prof. Sharma (Lab In-Charge)',
    remarks: 'Unity VR Capstone project'
  },
  {
    id: 'TXN-9051',
    equipmentId: 'LAP103',
    equipmentName: 'Lenovo ThinkPad P1 Gen 5',
    studentId: 'STU108',
    studentName: 'Priya Patel',
    action: 'ISSUED',
    timestamp: '2026-10-24T11:00:00',
    expectedReturn: '2026-10-28T16:00:00',
    condition: 'Good',
    operator: 'Rajesh Kumar (Lab Tech)',
    remarks: 'CAD Lab Work'
  },
  {
    id: 'TXN-9040',
    equipmentId: 'PRO301',
    equipmentName: 'Epson EB-X06 Projector',
    studentId: 'STU301',
    studentName: 'Ananya Iyer',
    action: 'ISSUED',
    timestamp: '2026-10-25T09:30:00',
    expectedReturn: '2026-10-27T17:00:00',
    condition: 'Good',
    operator: 'Rajesh Kumar (Lab Tech)',
    remarks: 'Robotics Workshop in Room 402'
  },
  {
    id: 'TXN-9032',
    equipmentId: 'LAP102',
    equipmentName: 'Dell XPS 15',
    studentId: 'STU115',
    studentName: 'Kartik Verma',
    action: 'RETURNED',
    timestamp: '2026-10-26T16:45:00',
    expectedReturn: '2026-10-26T17:00:00',
    condition: 'Good',
    operator: 'Prof. Sharma (Lab In-Charge)',
    remarks: 'Returned in pristine condition on time.'
  },
  {
    id: 'TXN-9021',
    equipmentId: 'IOT502',
    equipmentName: 'Arduino Mega + Sensor Array',
    studentId: 'STU088',
    studentName: 'Devansh Roy',
    action: 'RETURNED_DAMAGED',
    timestamp: '2026-10-23T11:15:00',
    expectedReturn: '2026-10-22T17:00:00',
    condition: 'Damaged',
    operator: 'Rajesh Kumar (Lab Tech)',
    remarks: 'USB port socket damaged. Incident log created, fine logged.'
  }
];

// Student Directory for Autocomplete & Verification
const REGISTERED_STUDENTS = [
  { id: 'STU102', name: 'Rohan Sharma', dept: 'Computer Science & Engg', phone: '+91 98765 43210', email: 'rohan.s@college.edu' },
  { id: 'STU108', name: 'Priya Patel', dept: 'Information Technology', phone: '+91 98112 34567', email: 'priya.p@college.edu' },
  { id: 'STU205', name: 'Aarav Mehta', dept: 'Media & Mass Communication', phone: '+91 97234 56789', email: 'aarav.m@college.edu' },
  { id: 'STU301', name: 'Ananya Iyer', dept: 'Electronics & Comm.', phone: '+91 99881 22334', email: 'ananya.i@college.edu' },
  { id: 'STU412', name: 'Vikram Singh', dept: 'Computer Science (AI & ML)', phone: '+91 91234 98765', email: 'vikram.s@college.edu' },
  { id: 'STU115', name: 'Kartik Verma', dept: 'Mechanical Engineering', phone: '+91 98711 00223', email: 'kartik.v@college.edu' },
  { id: 'STU088', name: 'Devansh Roy', dept: 'Electrical Engineering', phone: '+91 97654 32109', email: 'devansh.r@college.edu' },
  { id: 'STU501', name: 'Simran Kaur', dept: 'Design & Animation', phone: '+91 98334 11223', email: 'simran.k@college.edu' }
];

// Database Class
class CampusDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY_EQUIPMENT)) {
      this.resetToDefaults();
    } else {
      this.checkOverdueStatus();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(DEFAULT_EQUIPMENT));
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(DEFAULT_HISTORY));
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(REGISTERED_STUDENTS));
    this.checkOverdueStatus();
  }

  getEquipmentList() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPMENT));
      return Array.isArray(data) ? data : DEFAULT_EQUIPMENT;
    } catch (e) {
      return DEFAULT_EQUIPMENT;
    }
  }

  saveEquipmentList(list) {
    localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(list));
  }

  getHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY));
      return Array.isArray(data) ? data : DEFAULT_HISTORY;
    } catch (e) {
      return DEFAULT_HISTORY;
    }
  }

  saveHistory(history) {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }

  getStudents() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS));
      return Array.isArray(data) ? data : REGISTERED_STUDENTS;
    } catch (e) {
      return REGISTERED_STUDENTS;
    }
  }

  getEquipmentById(id) {
    const list = this.getEquipmentList();
    return list.find(item => item.id.toUpperCase() === id.trim().toUpperCase());
  }

  getStudentById(id) {
    const students = this.getStudents();
    return students.find(s => s.id.toUpperCase() === id.trim().toUpperCase());
  }

  /**
   * Automatically detect if any issued item passed its returnDate
   */
  checkOverdueStatus() {
    const list = this.getEquipmentList();
    const now = new Date();
    let updated = false;

    list.forEach(item => {
      if (item.status === 'Issued' && item.returnDate) {
        const returnTime = new Date(item.returnDate);
        if (now > returnTime) {
          item.status = 'Overdue';
          updated = true;
        }
      }
    });

    if (updated) {
      this.saveEquipmentList(list);
    }
  }

  /**
   * Issue an equipment to a student
   */
  issueEquipment(equipmentId, studentDetails, issueConfig) {
    const list = this.getEquipmentList();
    const item = list.find(eq => eq.id === equipmentId);

    if (!item) throw new Error(`Equipment ${equipmentId} not found.`);
    if (item.status !== 'Available') throw new Error(`Equipment ${item.name} (${item.id}) is currently ${item.status}.`);

    item.status = 'Issued';
    item.studentId = studentDetails.id;
    item.studentName = studentDetails.name;
    item.studentDept = studentDetails.dept || 'Engineering';
    item.studentPhone = studentDetails.phone || 'N/A';
    item.issueDate = issueConfig.issueDate || new Date().toISOString();
    item.returnDate = issueConfig.returnDate;
    item.purpose = issueConfig.purpose || 'Academic Project';
    item.notes = issueConfig.notes || '';
    item.totalIssues = (item.totalIssues || 0) + 1;

    // Save equipment
    this.saveEquipmentList(list);

    // Save history audit log
    const history = this.getHistory();
    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      equipmentId: item.id,
      equipmentName: item.name,
      studentId: studentDetails.id,
      studentName: studentDetails.name,
      action: 'ISSUED',
      timestamp: new Date().toISOString(),
      expectedReturn: issueConfig.returnDate,
      condition: item.condition || 'Good',
      operator: issueConfig.operator || 'Prof. Lab In-Charge',
      remarks: issueConfig.purpose || 'Issued to student'
    };
    history.unshift(newTxn);
    this.saveHistory(history);

    // Add or update student in registered list
    const students = this.getStudents();
    const exists = students.find(s => s.id === studentDetails.id);
    if (!exists) {
      students.push({
        id: studentDetails.id,
        name: studentDetails.name,
        dept: studentDetails.dept || 'General',
        phone: studentDetails.phone || '',
        email: studentDetails.email || ''
      });
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    }

    return { item, transaction: newTxn };
  }

  /**
   * Return an equipment
   */
  returnEquipment(equipmentId, returnDetails) {
    const list = this.getEquipmentList();
    const item = list.find(eq => eq.id === equipmentId);

    if (!item) throw new Error(`Equipment ${equipmentId} not found.`);
    if (item.status !== 'Issued' && item.status !== 'Overdue') {
      throw new Error(`Equipment ${item.name} is not currently issued.`);
    }

    const previousStudentId = item.studentId;
    const previousStudentName = item.studentName;
    const previousReturnDate = item.returnDate;

    // Check condition
    item.condition = returnDetails.condition || 'Good';
    if (returnDetails.condition === 'Damaged') {
      item.status = 'Maintenance';
    } else {
      item.status = 'Available';
    }

    item.studentId = null;
    item.studentName = null;
    item.studentDept = null;
    item.studentPhone = null;
    item.issueDate = null;
    item.returnDate = null;
    item.purpose = null;
    if (returnDetails.notes) {
      item.notes = returnDetails.notes;
    }

    this.saveEquipmentList(list);

    // Create Audit entry
    const history = this.getHistory();
    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      equipmentId: item.id,
      equipmentName: item.name,
      studentId: previousStudentId,
      studentName: previousStudentName,
      action: returnDetails.condition === 'Damaged' ? 'RETURNED_DAMAGED' : 'RETURNED',
      timestamp: new Date().toISOString(),
      expectedReturn: previousReturnDate,
      condition: returnDetails.condition,
      operator: returnDetails.operator || 'Prof. Lab In-Charge',
      remarks: returnDetails.notes || 'Returned to lab inventory'
    };
    history.unshift(newTxn);
    this.saveHistory(history);

    return { item, transaction: newTxn };
  }

  /**
   * Add a new piece of equipment
   */
  addEquipment(newAsset) {
    const list = this.getEquipmentList();
    if (list.some(item => item.id.toUpperCase() === newAsset.id.toUpperCase())) {
      throw new Error(`Equipment ID ${newAsset.id} already exists!`);
    }

    const item = {
      id: newAsset.id.toUpperCase(),
      name: newAsset.name,
      category: newAsset.category || 'Other',
      icon: newAsset.icon || '📦',
      serial: newAsset.serial || ('SN-' + Math.floor(100000 + Math.random() * 900000)),
      location: newAsset.location || 'Central Tech Lab',
      status: 'Available',
      condition: newAsset.condition || 'Good',
      studentId: null,
      studentName: null,
      studentDept: null,
      studentPhone: null,
      issueDate: null,
      returnDate: null,
      purpose: null,
      notes: newAsset.notes || 'Newly added asset.',
      totalIssues: 0
    };

    list.unshift(item);
    this.saveEquipmentList(list);

    const history = this.getHistory();
    history.unshift({
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      equipmentId: item.id,
      equipmentName: item.name,
      studentId: 'SYSTEM',
      studentName: 'Admin / Inventory Registry',
      action: 'REGISTERED',
      timestamp: new Date().toISOString(),
      expectedReturn: null,
      condition: item.condition,
      operator: 'System Admin',
      remarks: 'Registered new asset into CampusShare'
    });
    this.saveHistory(history);

    return item;
  }

  /**
   * Delete equipment
   */
  deleteEquipment(equipmentId) {
    let list = this.getEquipmentList();
    list = list.filter(item => item.id !== equipmentId);
    this.saveEquipmentList(list);
  }

  /**
   * Statistics helper
   */
  getMetrics() {
    const list = this.getEquipmentList();
    const total = list.length;
    const issued = list.filter(e => e.status === 'Issued').length;
    const overdue = list.filter(e => e.status === 'Overdue').length;
    const available = list.filter(e => e.status === 'Available').length;
    const maintenance = list.filter(e => e.status === 'Maintenance').length;

    return { total, issued, overdue, available, maintenance };
  }
}

// Global DB Instance
window.campusDB = new CampusDatabase();
