import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UFC Fighter Management API',
            version: '1.0.0',
            description: 'UFC dövüşçü yönetim sistemi için REST API dokümantasyonu',
            contact: {
                name: 'API Support',
                email: 'support@ufcapi.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            },
            {
                url: 'https://api.ufcfighters.com/api',
                description: 'Production server'
            }
        ],
        components: {
            schemas: {
                Fighter: {
                    type: 'object',
                    required: ['name', 'weightClass'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Dövüşçü ID',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Dövüşçü adı',
                            example: 'Conor McGregor'
                        },
                        nickname: {
                            type: 'string',
                            nullable: true,
                            description: 'Dövüşçü lakabı',
                            example: 'The Notorious'
                        },
                        weightClass: {
                            type: 'string',
                            description: 'Sıklet kategorisi',
                            enum: ['FLYWEIGHT', 'BANTAMWEIGHT', 'FEATHERWEIGHT', 'LIGHTWEIGHT', 'WELTERWEIGHT', 'MIDDLEWEIGHT', 'LIGHT_HEAVYWEIGHT', 'HEAVYWEIGHT'],
                            example: 'LIGHTWEIGHT'
                        },
                        nationality: {
                            type: 'string',
                            nullable: true,
                            description: 'Milliyet',
                            example: 'Ireland'
                        },
                        age: {
                            type: 'integer',
                            nullable: true,
                            description: 'Yaş',
                            example: 35
                        },
                        height: {
                            type: 'number',
                            format: 'float',
                            nullable: true,
                            description: 'Boy (cm)',
                            example: 175.5
                        },
                        weight: {
                            type: 'number',
                            format: 'float',
                            nullable: true,
                            description: 'Kilo (kg)',
                            example: 70.5
                        },
                        reach: {
                            type: 'number',
                            format: 'float',
                            nullable: true,
                            description: 'Erişim (cm)',
                            example: 188.0
                        },
                        wins: {
                            type: 'integer',
                            description: 'Kazanılan maç sayısı',
                            example: 22,
                            default: 0
                        },
                        losses: {
                            type: 'integer',
                            description: 'Kaybedilen maç sayısı',
                            example: 6,
                            default: 0
                        },
                        draws: {
                            type: 'integer',
                            description: 'Berabere maç sayısı',
                            example: 0,
                            default: 0
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Aktif durumu',
                            example: true,
                            default: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Oluşturulma tarihi'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Güncelleme tarihi'
                        }
                    }
                },
                FighterInput: {
                    type: 'object',
                    required: ['name', 'weightClass'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Dövüşçü adı',
                            example: 'Jon Jones'
                        },
                        nickname: {
                            type: 'string',
                            nullable: true,
                            description: 'Dövüşçü lakabı',
                            example: 'Bones'
                        },
                        weightClass: {
                            type: 'string',
                            description: 'Sıklet kategorisi',
                            enum: ['FLYWEIGHT', 'BANTAMWEIGHT', 'FEATHERWEIGHT', 'LIGHTWEIGHT', 'WELTERWEIGHT', 'MIDDLEWEIGHT', 'LIGHT_HEAVYWEIGHT', 'HEAVYWEIGHT'],
                            example: 'LIGHT_HEAVYWEIGHT'
                        },
                        nationality: {
                            type: 'string',
                            nullable: true,
                            description: 'Milliyet',
                            example: 'USA'
                        },
                        age: {
                            type: 'integer',
                            nullable: true,
                            description: 'Yaş',
                            example: 36
                        },
                        height: {
                            type: 'number',
                            format: 'float',
                            nullable: true,
                            description: 'Boy (cm)',
                            example: 193.0
                        },
                        weight: {
                            type: 'number',
                            format: 'float',
                            nullable: true,
                            description: 'Kilo (kg)',
                            example: 93.0
                        },
                        reach: {
                            type: 'number',
                            format: 'float',
                            nullable: true,
                            description: 'Erişim (cm)',
                            example: 215.0
                        },
                        wins: {
                            type: 'integer',
                            description: 'Kazanılan maç sayısı',
                            example: 26,
                            default: 0
                        },
                        losses: {
                            type: 'integer',
                            description: 'Kaybedilen maç sayısı',
                            example: 1,
                            default: 0
                        },
                        draws: {
                            type: 'integer',
                            description: 'Berabere maç sayısı',
                            example: 0,
                            default: 0
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Aktif durumu',
                            example: true,
                            default: true
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Hata mesajı'
                        },
                        message: {
                            type: 'string',
                            description: 'Detaylı hata açıklaması'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/index.ts'], // Swagger annotation'ları aranacak dosyalar
};