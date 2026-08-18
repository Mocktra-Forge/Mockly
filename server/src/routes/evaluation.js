import { Router } from 'express';
import protect from '../middleware/auth.js';
import { evaluateAttempt } from '../services/evaluationCoordinator.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import Question from '../models/Question.js';

const router = Router();

/**
 * POST /api/evaluation/submit
 * Evaluate student answer submission, blend scores, and log the attempt.
 */
router.post('/submit', protect, async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    const userId = req.user._id;

    if (!questionId || !userAnswer) {
      return res.status(400).json({ message: 'Please provide questionId and userAnswer' });
    }

    // 1. Run evaluation coordinator pipeline
    const evaluation = await evaluateAttempt({ questionId, userAnswer });

    // 2. Log attempt in database
    const attempt = await PracticeAttempt.create({
      user: userId,
      question: questionId,
      userAnswer,
      keywordScore: evaluation.keywordScore,
      embeddingScore: evaluation.embeddingScore,
      llmScore: evaluation.llmScore,
      overallScore: evaluation.overallScore,
      rubric: evaluation.rubric,
      matchedKeywords: evaluation.matchedKeywords,
      missingKeywords: evaluation.missingKeywords,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      missingPoints: evaluation.missingPoints,
      suggestions: evaluation.suggestions,
      latency: evaluation.latency,
    });

    // 3. Return standardized evaluation payload
    res.status(201).json({
      attemptId: attempt._id,
      ...evaluation,
    });
  } catch (err) {
    console.error('Submission evaluation error:', err);

    // Map specific AI-related status codes for robust error reporting
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server error during answer evaluation';

    res.status(statusCode).json({ message });
  }
});

/**
 * GET /api/evaluation/attempts/:questionId
 * Fetch all previous attempts for a specific question by the current logged-in user.
 */
router.get('/attempts/:questionId', protect, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(questionId).select('-isActive -__v');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const attempts = await PracticeAttempt.find({
      user: userId,
      question: questionId,
    }).sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    let highestScore = 0;
    let averageScore = 0;

    if (totalAttempts > 0) {
      highestScore = Math.max(...attempts.map((a) => a.overallScore || 0));
      const sum = attempts.reduce((acc, a) => acc + (a.overallScore || 0), 0);
      averageScore = Math.round(sum / totalAttempts);
    }

    res.status(200).json({
      question,
      attempts,
      stats: {
        totalAttempts,
        highestScore,
        averageScore,
        latestAttemptDate: attempts[0] ? attempts[0].createdAt : null,
      },
    });
  } catch (err) {
    console.error('Error fetching question attempts history:', err);
    res.status(500).json({ message: 'Server error fetching question attempts' });
  }
});

export default router;

