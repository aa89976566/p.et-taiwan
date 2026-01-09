/**
 * 測驗路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * 提交測驗結果
 */
router.post('/', optionalAuth, (req, res) => {
    const {
        quizType, petInfo, answers, result
    } = req.body;

    if (!quizType || !petInfo || !result) {
        return res.status(400).json({
            success: false,
            message: '請提供完整的測驗資料'
        });
    }

    const quizId = uuidv4();
    const userId = req.user ? req.user.id : null;
    const now = Date.now();

    db.run(
        `INSERT INTO quiz_results (id, userId, quizType, petName, petType, petBreed, petAge, petWeight,
         petActivityLevel, petHealthIssues, answers, resultCategory, resultScore, resultRecommendations,
         completedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            quizId, userId, quizType,
            petInfo.name || '', petInfo.type || '', petInfo.breed || '',
            petInfo.age || 0, petInfo.weight || 0,
            petInfo.activityLevel || '', JSON.stringify(petInfo.healthIssues || []),
            JSON.stringify(answers), result.category || '',
            result.score || 0, JSON.stringify(result.recommendations || []),
            now, now
        ],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '儲存失敗',
                    error: err.message
                });
            }

            // 更新用戶測驗完成數
            if (userId) {
                db.run('UPDATE users SET quizCompleted = quizCompleted + 1 WHERE id = ?', [userId]);
            }

            res.json({
                success: true,
                message: '測驗結果已儲存',
                data: { quizId }
            });
        }
    );
});

/**
 * 獲取測驗結果列表
 */
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM quiz_results WHERE userId = ? ORDER BY completedAt DESC',
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '查詢失敗',
                    error: err.message
                });
            }

            const formattedResults = results.map(r => ({
                ...r,
                petHealthIssues: JSON.parse(r.petHealthIssues || '[]'),
                answers: JSON.parse(r.answers || '{}'),
                resultRecommendations: JSON.parse(r.resultRecommendations || '[]')
            }));

            res.json({
                success: true,
                data: { results: formattedResults }
            });
        }
    );
});

/**
 * 獲取單一測驗結果
 */
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get(
        'SELECT * FROM quiz_results WHERE id = ? AND userId = ?',
        [id, userId],
        (err, result) => {
            if (err || !result) {
                return res.status(404).json({
                    success: false,
                    message: '測驗結果不存在'
                });
            }

            res.json({
                success: true,
                data: {
                    ...result,
                    petHealthIssues: JSON.parse(result.petHealthIssues || '[]'),
                    answers: JSON.parse(result.answers || '{}'),
                    resultRecommendations: JSON.parse(result.resultRecommendations || '[]')
                }
            });
        }
    );
});

module.exports = router;

