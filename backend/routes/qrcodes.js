const express = require('express');
const QRCode = require('qrcode');
const QRCodeModel = require('../models/QRCode');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/qrcodes
// @desc    Generate QR code for logged-in user
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, size = 200, errorCorrectionLevel = 'M' } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({ message: 'Text is required for QR code generation' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ message: 'Text cannot exceed 1000 characters' });
    }

    // Validate size
    const qrSize = parseInt(size);
    if (isNaN(qrSize) || qrSize < 50 || qrSize > 1000) {
      return res.status(400).json({ message: 'Size must be between 50 and 1000 pixels' });
    }

    // Validate error correction level
    const validECLevels = ['L', 'M', 'Q', 'H'];
    if (!validECLevels.includes(errorCorrectionLevel)) {
      return res.status(400).json({ message: 'Invalid error correction level' });
    }

    // Generate QR code options
    const options = {
      errorCorrectionLevel,
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: qrSize,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    // Generate QR code as data URL
    const pngDataUrl = await QRCode.toDataURL(text, options);

    // Save to database
    const qrCodeRecord = new QRCodeModel({
      userId: req.user._id,
      text,
      size: qrSize,
      errorCorrectionLevel,
      pngDataUrl
    });

    const savedQRCode = await qrCodeRecord.save();

    res.status(201).json({
      message: 'QR code generated successfully',
      qrCode: {
        _id: savedQRCode._id,
        text: savedQRCode.text,
        size: savedQRCode.size,
        errorCorrectionLevel: savedQRCode.errorCorrectionLevel,
        pngDataUrl: savedQRCode.pngDataUrl,
        createdAt: savedQRCode.createdAt
      }
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during QR code generation' });
  }
});

// @route   GET /api/qrcodes/history
// @desc    Get QR code history for logged-in user
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get user's QR codes with pagination
    const qrCodes = await QRCodeModel.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select('text size errorCorrectionLevel pngDataUrl createdAt');

    // Get total count for pagination info
    const totalCount = await QRCodeModel.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      qrCodes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('QR code history error:', error);
    res.status(500).json({ message: 'Server error retrieving QR code history' });
  }
});

// @route   GET /api/qrcodes/:id
// @desc    Get single QR code by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.json({
      qrCode: {
        _id: qrCode._id,
        text: qrCode.text,
        size: qrCode.size,
        errorCorrectionLevel: qrCode.errorCorrectionLevel,
        pngDataUrl: qrCode.pngDataUrl,
        createdAt: qrCode.createdAt
      }
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'QR code not found' });
    }
    res.status(500).json({ message: 'Server error retrieving QR code' });
  }
});

// @route   DELETE /api/qrcodes/:id
// @desc    Delete QR code
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    await QRCodeModel.deleteOne({ _id: req.params.id });

    res.json({ message: 'QR code deleted successfully' });

  } catch (error) {
    console.error('Delete QR code error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'QR code not found' });
    }
    res.status(500).json({ message: 'Server error deleting QR code' });
  }
});

module.exports = router;
