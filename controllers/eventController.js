const EventModel = require('../models/Event');

const createEvent = async (data) => {
    const event = new EventModel(data);
    return await event.save();
};

const getAllEvents = async () => {
    return await EventModel.find();
};

const getEventById = async (eventId) => {
    return await EventModel.findById(eventId);
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
};
