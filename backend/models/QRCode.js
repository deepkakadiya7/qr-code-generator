const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Text for QR code is required'],
    maxlength: [1000, 'Text cannot exceed 1000 characters']
  },
  size: {
    type: Number,
    default: 200,
    min: [50, 'Size must be at least 50px'],
    max: [1000, 'Size cannot exceed 1000px']
  },
  errorCorrectionLevel: {
    type: String,
    enum: ['L', 'M', 'Q', 'H'],
    default: 'M',
    description: 'L (~7%), M (~15%), Q (~25%), H (~30%)'
  },
  pngDataUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
qrCodeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
