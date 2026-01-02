const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Get all bookings
router.get('/', (req, res) => {
    const { bookings } = req.dataStore;
    res.json(bookings);
});

// Get booking by ID
router.get('/:id', (req, res) => {
    const { bookings } = req.dataStore;
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
});

// Create new booking
router.post('/', (req, res) => {
    try {
        const { clientId, serviceId, date, time, status, notes } = req.body;
        const { bookings, clients, services } = req.dataStore;

        // Validate required fields
        if (!clientId || !serviceId || !date || !time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify client exists
        const client = clients.find(c => c.id === clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Verify service exists
        const service = services.find(s => s.id === serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const newBooking = {
            id: uuidv4(),
            clientId,
            serviceId,
            date,
            time,
            status: status || 'Pending',
            notes: notes || '',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error creating booking' });
    }
});

// Update booking
router.put('/:id', (req, res) => {
    try {
        const { bookings, clients, services } = req.dataStore;
        const index = bookings.findIndex(b => b.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const { clientId, serviceId, date, time, status, notes } = req.body;

        // Verify client exists if being updated
        if (clientId && clientId !== bookings[index].clientId) {
            const client = clients.find(c => c.id === clientId);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
        }

        // Verify service exists if being updated
        if (serviceId && serviceId !== bookings[index].serviceId) {
            const service = services.find(s => s.id === serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
        }

        bookings[index] = {
            ...bookings[index],
            clientId: clientId || bookings[index].clientId,
            serviceId: serviceId || bookings[index].serviceId,
            date: date || bookings[index].date,
            time: time || bookings[index].time,
            status: status || bookings[index].status,
            notes: notes !== undefined ? notes : bookings[index].notes,
            updatedAt: new Date().toISOString()
        };

        res.json(bookings[index]);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Server error updating booking' });
    }
});

// Delete booking
router.delete('/:id', (req, res) => {
    const { bookings } = req.dataStore;
    const index = bookings.findIndex(b => b.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    const deletedBooking = bookings.splice(index, 1)[0];
    res.json({ message: 'Booking deleted successfully', booking: deletedBooking });
});

module.exports = router;
