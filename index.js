const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const readBookings = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};


const writeBookings = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};


app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});


app.get('/api/bookings/:id', (req, res) => {
  const bookings = readBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }
  res.json(booking);
});


app.post('/api/bookings', (req, res) => {

  const { room, student_name, date, start_time, end_time } = req.body;
  const bookings = readBookings();
  const conflictExists = bookings.some(
    b => b.room.toLowerCase().trim() === room.toLowerCase().trim() && b.date === date
  );

  const newBooking = {
    id: Date.now().toString(), 
    room,
    student_name,
    date,
    start_time,
    end_time
  };

  if (!room || !student_name || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (conflictExists) {
    return res.status(409).json({ error: `Room "${room}" is already booked for ${date}.` });
  }

  bookings.push(newBooking);
  writeBookings(bookings);

  res.status(201).json(newBooking);
});


app.delete('/api/bookings/:id', (req, res) => {
  const bookings = readBookings();
  const initialLength = bookings.length;
  const updatedBookings = bookings.filter(b => b.id !== req.params.id);

  if (updatedBookings.length === initialLength) {
    return res.status(404).json({ error: 'Booking code not found.' });
  }

  writeBookings(updatedBookings);
  res.json({ success: true, message: 'Booking deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`Study Room Server running at http://localhost:${PORT}`);
});
