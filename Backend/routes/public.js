const express = require('express');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const router = express.Router();
const Student = require('../models/Student');

// 1️⃣ GET Route: Displays the Confirmation Page
router.get('/verify-view/:studentId/:vaccineId', async (req, res) => {
    try {
        const { studentId, vaccineId } = req.params;
        
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send("<h2>Error: Student record not found.</h2>");

        // Use flexible finding logic for display
        const vaccine = student.immunizationStatus.find(v => 
            v.id === vaccineId || (v._id && v._id.toString() === vaccineId)
        );
        
        if (!vaccine) return res.status(404).send("<h2>Error: Vaccine record not found.</h2>");

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirm Vaccination</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                    .container { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 90%; max-width: 400px; text-align: center; }
                    h1 { color: #2c3e50; margin: 0 0 10px 0; }
                    .info-box { background: #e3f2fd; border-radius: 10px; padding: 15px; margin: 20px 0; text-align: left; }
                    .label { font-size: 12px; color: #546e7a; font-weight: bold; text-transform: uppercase; }
                    .value { font-size: 16px; color: #263238; font-weight: 600; margin-bottom: 10px; }
                    .btn { display: block; width: 100%; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 10px; }
                    .btn-yes { background: #4CAF50; color: white; }
                    .btn-no { background: #f5f5f5; color: #757575; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Vaccination Check</h1>
                    <p>Is the vaccination complete?</p>
                    <div class="info-box">
                        <div class="label">Child Name</div>
                        <div class="value">${student.name}</div>
                        <div class="label">Vaccine</div>
                        <div class="value">${vaccine.vaccineName}</div>
                    </div>
                    <form action="/verify-confirm/${studentId}/${vaccineId}" method="POST">
                         <input type="hidden" name="action" value="confirm">
                         <button type="submit" class="btn btn-yes">Yes, Completed</button>
                    </form>
                    <form action="/verify-confirm/${studentId}/${vaccineId}" method="POST">
                        <input type="hidden" name="action" value="deny">
                        <button type="submit" class="btn btn-no">No, Not Yet</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("View Error:", error);
        res.status(500).send("Server Error");
    }
});

// 2️⃣ POST Route: Updates the Database
router.post('/verify-confirm/:studentId/:vaccineId', async (req, res) => {
    try {
        const { studentId, vaccineId } = req.params;
        let action = req.body.action;
        if (!action && req.query.action) action = req.query.action;

        if (action === 'deny') {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                <body style="text-align:center; padding:50px; font-family:sans-serif;">
                    <h1 style="color:#F44336;">Not Updated</h1>
                    <p>Record remains pending.</p>
                </body>
                </html>
            `);
        }

        // 1. Fetch the student first to identify HOW to match the vaccine
        // This avoids the complex $or query that breaks the positional operator
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send("<h1>Error: Student record not found.</h1>");

        // Determine which field matches the vaccineId
        const targetVaccine = student.immunizationStatus.find(v => v.id === vaccineId);
        const targetVaccineByMongoId = !targetVaccine && mongoose.Types.ObjectId.isValid(vaccineId)
             ? student.immunizationStatus.find(v => v._id.toString() === vaccineId)
             : null;

        // Construct the precise query for updateOne
        let matchQuery = { _id: studentId };
        
        if (targetVaccine) {
            // Match by custom string 'id'
            matchQuery["immunizationStatus.id"] = vaccineId;
        } else if (targetVaccineByMongoId) {
            // Match by MongoDB '_id'
            matchQuery["immunizationStatus._id"] = targetVaccineByMongoId._id;
        } else {
            return res.status(404).send("<h1>Error: Vaccine record not found.</h1>");
        }

        // 2. Perform the safe update
        // Now matchQuery targets exactly ONE array element field, so $ works correctly.
        await Student.updateOne(
            matchQuery,
            { 
                $set: { "immunizationStatus.$.status": "confirmed" } 
            }
        );

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #e8f5e9; }
                    .tick { font-size: 80px; color: #2e7d32; }
                    h1 { color: #2e7d32; }
                </style>
            </head>
            <body>
                <div class="tick">✔</div>
                <h1>Success!</h1>
                <p>The vaccination record has been updated.</p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Confirm Error:", error);
        res.status(500).send(`<h1>Server Error</h1><p>${error.message}</p>`);
    }
});

module.exports = router;