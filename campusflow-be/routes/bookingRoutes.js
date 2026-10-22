const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Booking = require('../models/Booking');
const { createCalendarEvent, deleteCalendarEvent } = require('../services/calendarService');

// Initialize Gemini Client with your .env key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- POST: GEMINI ROOM RECOMMENDATION ROUTE (Matches Leader's Angular Service) ---
router.post('/recommend-room', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Gemini API key is missing in .env' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt || 'Act as an intelligent campus scheduler for CampusFlow and recommend an optimal available room.',
    });

    const recommendation = response.text.trim();
    res.json({ success: true, recommendation });
  } catch (error) {
    console.error('Gemini AI error:', error);
    res.status(500).json({ success: false, message: 'Smart recommendation currently unavailable.' });
  }
});

// --- GET ALL BOOKINGS ---
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

// --- POST: CREATE BOOKING WITH AUTO-SYNC ---
router.post('/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();

        try {
            const googleEventId = await createCalendarEvent({
                building: req.body.building || 'Liceo Campus',
                roomCode: req.body.room_code || req.body.room_name || 'N/A',
                periodSlot: Number(req.body.period),
                date: req.body.booking_date,
                facultyEmail: req.body.faculty_email || 'faculty@liceo.edu.ph',
                facultyName: req.body.faculty_name || req.body.booked_by || 'Faculty Member',
            });

            newBooking.google_event_id = googleEventId;
            await newBooking.save();
        } catch (calErr) {
            console.error('Calendar sync warning:', calErr.message);
        }

        res.status(201).json({ message: 'Booking saved successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ error: 'Error creating booking' });
    }
});

module.exports = router;