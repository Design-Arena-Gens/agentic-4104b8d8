const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Get all services
router.get('/', (req, res) => {
    const { services } = req.dataStore;
    res.json(services);
});

// Get service by ID
router.get('/:id', (req, res) => {
    const { services } = req.dataStore;
    const service = services.find(s => s.id === req.params.id);

    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
});

// Create new service
router.post('/', (req, res) => {
    try {
        const { name, category, price, duration, description, status } = req.body;
        const { services } = req.dataStore;

        // Validate required fields
        if (!name || !category || price === undefined || duration === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newService = {
            id: uuidv4(),
            name,
            category,
            price: parseFloat(price),
            duration: parseFloat(duration),
            description: description || '',
            status: status || 'Active',
            createdAt: new Date().toISOString()
        };

        services.push(newService);
        res.status(201).json(newService);
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ message: 'Server error creating service' });
    }
});

// Update service
router.put('/:id', (req, res) => {
    try {
        const { services } = req.dataStore;
        const index = services.findIndex(s => s.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const { name, category, price, duration, description, status } = req.body;

        services[index] = {
            ...services[index],
            name: name || services[index].name,
            category: category || services[index].category,
            price: price !== undefined ? parseFloat(price) : services[index].price,
            duration: duration !== undefined ? parseFloat(duration) : services[index].duration,
            description: description !== undefined ? description : services[index].description,
            status: status || services[index].status,
            updatedAt: new Date().toISOString()
        };

        res.json(services[index]);
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ message: 'Server error updating service' });
    }
});

// Delete service
router.delete('/:id', (req, res) => {
    const { services } = req.dataStore;
    const index = services.findIndex(s => s.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Service not found' });
    }

    const deletedService = services.splice(index, 1)[0];
    res.json({ message: 'Service deleted successfully', service: deletedService });
});

module.exports = router;
