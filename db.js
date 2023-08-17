const mongoose = require ('mongoose');
const mongoURI = "mongodb+srv://adiraghav2001:9588297067@cluster0.snrbtmt.mongodb.net/";
async function connectToMongo() {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}


module.exports = connectToMongo