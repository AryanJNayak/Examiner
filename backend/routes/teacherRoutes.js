const express = require('express');
const router = express.Router();
const StudentList = require('../models/studentList');
const saveExam = require('../controller/saveExam');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const getStudentStatus = require('../controller/Teacher/getStudentStatus');

// const Exam = require("../models/Exam");
// const StudentAnswer = require("../models/StudentAnswer");

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '../upload/Teacher');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const multer = require('multer');
const { student } = require('../utils/getSchema');
const getExams = require('../controller/Teacher/getExams');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

// StudentList Upload
router.post('/studentList', upload.single('xlsx'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Key must be "xlsx".' });
        }

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let savedCount = 0;
        let skippedRows = [];

        for (const [index, row] of data.entries()) {
            if (!row.StudentId || !row.Email || !row.CourseCode || !row.DeptNo) {
                skippedRows.push({ index: index + 2, reason: 'Missing required columns' }); // +2 for Excel row number
                continue;
            }
            try {
                const student = new StudentList({
                    student_id: row.StudentId,
                    email: row.Email,
                    course_id: row.CourseCode,
                    dept_code: row.DeptNo,
                });
                await student.save();
                savedCount++;
            } catch (err) {
                // Duplicate or validation error
                skippedRows.push({ index: index + 2, reason: err.message });
            }
        }

        fs.unlinkSync(filePath);

        res.status(200).json({
            message: 'Student list uploaded successfully.',
            saved: savedCount,
            skipped: skippedRows
        });
    } catch (error) {
        console.error('StudentList Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
});


router.post('/exam', saveExam);
router.get('/exams/:teacherId', async (req, res) => {
    try {
        const teacher_id = req.params.teacherId;
        const exams = await getExams(teacher_id);
        if (exams == 0) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/studentsStatus', getStudentStatus);

router.get('/deleteStudentList', async (req, res) => {
    await StudentList.deleteMany();
    await student.deleteMany();
    res.status(200).json({ message: "deleted" })
})



module.exports = router;