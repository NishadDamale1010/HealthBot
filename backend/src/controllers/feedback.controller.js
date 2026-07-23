const Feedback = require('../models/feedback');
const Prediction = require('../models/prediction');

const submitFeedback = async (req, res) => {
  try {
    const { predictionId, rating, comment, wasHelpful, wasAccurate } = req.body;
    
    // Ensure prediction exists
    if (predictionId) {
      const pred = await Prediction.findById(predictionId);
      if (!pred) {
        return res.status(404).json({ success: false, message: 'Prediction not found' });
      }
    }

    const feedback = new Feedback({
      userId: req.user._id,
      predictionId,
      rating,
      comment,
      wasHelpful,
      wasAccurate
    });

    await feedback.save();
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting feedback' });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching feedback' });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback
};
