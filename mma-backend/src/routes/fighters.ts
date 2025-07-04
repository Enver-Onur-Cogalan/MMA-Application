import express from 'express';
import { prisma } from '../index';
import { Prisma } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /fighters:
 *   get:
 *     summary: Tüm dövüşçüleri listele
 *     description: Sistemdeki tüm UFC dövüşçülerini sayfalama ile birlikte getirir
 *     tags: [Fighters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: weightClass
 *         schema:
 *           type: string
 *           enum: [FLYWEIGHT, BANTAMWEIGHT, FEATHERWEIGHT, LIGHTWEIGHT, WELTERWEIGHT, MIDDLEWEIGHT, LIGHT_HEAVYWEIGHT, HEAVYWEIGHT]
 *         description: Sıklet kategorisine göre filtrele
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Aktif duruma göre filtrele
 *     responses:
 *       200:
 *         description: Başarılı yanıt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fighter'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
        const skip = (page - 1) * limit;

        // Build filter object
        const where: Prisma.FighterWhereInput = {};

        if (req.query.weightClass) {
            where.weightClass = req.query.weightClass as string;
        }

        if (req.query.isActive !== undefined) {
            where.isActive = req.query.isActive === 'true';
        }

        // Get fighters and total count
        const [fighters, total] = await Promise.all([
            prisma.fighter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.fighter.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.json({
            data: fighters,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching fighters:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Dövüşçüler getirilirken bir hata oluştu'
        });
    }
});

/**
 * @swagger
 * /fighters/{id}:
 *   get:
 *     summary: ID'ye göre dövüşçü getir
 *     description: Belirtilen ID'ye sahip dövüşçünün detaylarını getirir
 *     tags: [Fighters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dövüşçü ID'si
 *     responses:
 *       200:
 *         description: Başarılı yanıt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fighter'
 *       404:
 *         description: Dövüşçü bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Dövüşçü ID\'si geçerli bir sayı olmalıdır'
            });
        }

        const fighter = await prisma.fighter.findUnique({
            where: { id }
        });

        if (!fighter) {
            return res.status(404).json({
                error: 'Fighter not found',
                message: 'Belirtilen ID\'ye sahip dövüşçü bulunamadı'
            });
        }

        return res.json(fighter);
    } catch (error) {
        console.error('Error fetching fighter:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Dövüşçü getirilirken bir hata oluştu'
        });
    }
});

/**
 * @swagger
 * /fighters:
 *   post:
 *     summary: Yeni dövüşçü oluştur
 *     description: Sisteme yeni bir UFC dövüşçüsü ekler
 *     tags: [Fighters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FighterInput'
 *     responses:
 *       201:
 *         description: Dövüşçü başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fighter'
 *       400:
 *         description: Geçersiz giriş verisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
    try {
        const fighterData = req.body;

        // Basic validation
        if (!fighterData.name || !fighterData.weightClass) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Dövüşçü adı ve sıklet kategorisi zorunludur'
            });
        }

        const fighter = await prisma.fighter.create({
            data: fighterData
        });

        return res.status(201).json(fighter);
    } catch (error) {
        console.error('Error creating fighter:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(400).json({
                    error: 'Duplicate entry',
                    message: 'Bu dövüşçü zaten sistemde kayıtlı'
                });
            }
        }

        return res.status(500).json({
            error: 'Internal server error',
            message: 'Dövüşçü oluşturulurken bir hata oluştu'
        });
    }
});

/**
 * @swagger
 * /fighters/{id}:
 *   put:
 *     summary: Dövüşçü bilgilerini güncelle
 *     description: Belirtilen ID'ye sahip dövüşçünün bilgilerini günceller
 *     tags: [Fighters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dövüşçü ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FighterInput'
 *     responses:
 *       200:
 *         description: Dövüşçü başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fighter'
 *       400:
 *         description: Geçersiz giriş verisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Dövüşçü bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const fighterData = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Dövüşçü ID\'si geçerli bir sayı olmalıdır'
            });
        }

        // Check if fighter exists
        const existingFighter = await prisma.fighter.findUnique({
            where: { id }
        });

        if (!existingFighter) {
            return res.status(404).json({
                error: 'Fighter not found',
                message: 'Belirtilen ID\'ye sahip dövüşçü bulunamadı'
            });
        }

        const updatedFighter = await prisma.fighter.update({
            where: { id },
            data: fighterData
        });

        return res.json(updatedFighter);
    } catch (error) {
        console.error('Error updating fighter:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Dövüşçü güncellenirken bir hata oluştu'
        });
    }
});

/**
 * @swagger
 * /fighters/{id}:
 *   delete:
 *     summary: Dövüşçüyü sil
 *     description: Belirtilen ID'ye sahip dövüşçüyü sistemden siler
 *     tags: [Fighters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dövüşçü ID'si
 *     responses:
 *       200:
 *         description: Dövüşçü başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dövüşçü başarıyla silindi
 *       404:
 *         description: Dövüşçü bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Dövüşçü ID\'si geçerli bir sayı olmalıdır'
            });
        }

        // Check if fighter exists
        const existingFighter = await prisma.fighter.findUnique({
            where: { id }
        });

        if (!existingFighter) {
            return res.status(404).json({
                error: 'Fighter not found',
                message: 'Belirtilen ID\'ye sahip dövüşçü bulunamadı'
            });
        }

        await prisma.fighter.delete({
            where: { id }
        });

        return res.json({
            message: 'Dövüşçü başarıyla silindi'
        });
    } catch (error) {
        console.error('Error deleting fighter:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Dövüşçü silinirken bir hata oluştu'
        });
    }
});

export default router;