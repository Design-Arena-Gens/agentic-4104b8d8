const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Get all clients
router.get('/', (req, res) => {
    const { clients } = req.dataStore;
    res.json(clients);
});

// Get client by ID
router.get('/:id', (req, res) => {
    const { clients } = req.dataStore;
    const client = clients.find(c => c.id === req.params.id);

    if (!client) {
        return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
});

// Create new client
router.post('/', (req, res) => {
    try {
        const { companyName, contactPerson, email, phone, type, address } = req.body;
        const { clients } = req.dataStore;

        // Validate required fields
        if (!companyName || !contactPerson || !email || !phone || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if client with same email already exists
        const existingClient = clients.find(c => c.email === email);
        if (existingClient) {
            return res.status(400).json({ message: 'Client with this email already exists' });
        }

        const newClient = {
            id: uuidv4(),
            companyName,
            contactPerson,
            email,
            phone,
            type,
            address: address || '',
            createdAt: new Date().toISOString()
        };

        clients.push(newClient);
        res.status(201).json(newClient);
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ message: 'Server error creating client' });
    }
});

// Update client
router.put('/:id', (req, res) => {
    try {
        const { clients } = req.dataStore;
        const index = clients.findIndex(c => c.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const { companyName, contactPerson, email, phone, type, address } = req.body;

        // Check if email is being changed and if it's already in use
        if (email && email !== clients[index].email) {
            const existingClient = clients.find(c => c.email === email);
            if (existingClient) {
                return res.status(400).json({ message: 'Client with this email already exists' });
            }
        }

        clients[index] = {
            ...clients[index],
            companyName: companyName || clients[index].companyName,
            contactPerson: contactPerson || clients[index].contactPerson,
            email: email || clients[index].email,
            phone: phone || clients[index].phone,
            type: type || clients[index].type,
            address: address !== undefined ? address : clients[index].address,
            updatedAt: new Date().toISOString()
        };

        res.json(clients[index]);
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ message: 'Server error updating client' });
    }
});

// Delete client
router.delete('/:id', (req, res) => {
    const { clients } = req.dataStore;
    const index = clients.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Client not found' });
    }

    const deletedClient = clients.splice(index, 1)[0];
    res.json({ message: 'Client deleted successfully', client: deletedClient });
});

module.exports = router;
