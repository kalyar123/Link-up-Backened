const mongoose= require ('mongoose');



const messageSchema = mongoose.Schema({
  from: String,
  to: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

// Create a model for messages
mongoose.model('Message', messageSchema);