const { google } = require('googleapis');
const path = require('path');

const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../config/service-account-key.json');

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Creates a Google Calendar event upon successful room booking.
 */
async function createCalendarEvent(bookingData) {
  try {
    const { building, roomCode, periodSlot, date, facultyEmail, facultyName } = bookingData;

    const periodTimes = {
      1: { start: '09:00:00', end: '10:30:00' },
      2: { start: '10:30:00', end: '12:00:00' },
      3: { start: '13:00:00', end: '14:30:00' },
      4: { start: '14:30:00', end: '16:00:00' },
      5: { start: '16:00:00', end: '17:30:00' },
      6: { start: '17:30:00', end: '19:00:00' }
    };

    const timeSlot = periodTimes[periodSlot] || { start: '09:00:00', end: '10:30:00' };

    const event = {
      summary: `CampusFlow: ${building} - ${roomCode} (Period ${periodSlot})`,
      description: `Classroom reservation for ${facultyName} at Liceo de Cagayan University.`,
      start: {
        dateTime: `${date}T${timeSlot.start}+08:00`,
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: `${date}T${timeSlot.end}+08:00`,
        timeZone: 'Asia/Manila',
      },
      attendees: [{ email: facultyEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
    });

    console.log('Google Calendar Event Sync Successful:', response.data.htmlLink);
    return response.data.id;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error('Calendar synchronization failed.');
  }
}

/**
 * Deletes a Google Calendar event when a booking is canceled.
 */
async function deleteCalendarEvent(googleEventId) {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    });
    console.log(`Google Calendar Event ${googleEventId} deleted.`);
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
  }
}

module.exports = { createCalendarEvent, deleteCalendarEvent };