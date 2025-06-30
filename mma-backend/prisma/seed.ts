// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const fighters = [
        {
            name: 'Jon Jones',
            nickname: 'Bones',
            birthDate: new Date('1987-07-19'),
            nationality: 'USA',
            height: 193,
            reach: 215,
            stance: 'Orthodox',
            photoUrl: 'https://example.com/jon_jones.jpg',
        },
        {
            name: 'Khabib Nurmagomedov',
            nickname: 'The Eagle',
            birthDate: new Date('1988-09-20'),
            nationality: 'Russia',
            height: 178,
            reach: 178,
            stance: 'Orthodox',
            photoUrl: 'https://example.com/khabib.jpg',
        },
        {
            name: 'Anderson Silva',
            nickname: 'The Spider',
            birthDate: new Date('1975-04-14'),
            nationality: 'Brazil',
            height: 188,
            reach: 197,
            stance: 'Southpaw',
            photoUrl: 'https://example.com/silva.jpg',
        },
        {
            name: 'Conor McGregor',
            nickname: 'Notorious',
            birthDate: new Date('1988-07-14'),
            nationality: 'Ireland',
            height: 175,
            reach: 188,
            stance: 'Southpaw',
            photoUrl: 'https://example.com/conor.jpg',
        },
        {
            name: 'Israel Adesanya',
            nickname: 'The Last Stylebender',
            birthDate: new Date('1989-07-22'),
            nationality: 'New Zealand',
            height: 193,
            reach: 203,
            stance: 'Switch',
            photoUrl: 'https://example.com/adesanya.jpg',
        },
        {
            name: 'Georges St-Pierre',
            nickname: 'GSP',
            birthDate: new Date('1981-05-19'),
            nationality: 'Canada',
            height: 178,
            reach: 193,
            stance: 'Orthodox',
            photoUrl: 'https://example.com/gsp.jpg',
        },
        {
            name: 'Daniel Cormier',
            nickname: 'DC',
            birthDate: new Date('1979-03-20'),
            nationality: 'USA',
            height: 180,
            reach: 184,
            stance: 'Orthodox',
            photoUrl: 'https://example.com/cormier.jpg',
        },
        {
            name: 'Stipe Miocic',
            nickname: null,
            birthDate: new Date('1982-08-19'),
            nationality: 'USA',
            height: 193,
            reach: 203,
            stance: 'Orthodox',
            photoUrl: 'https://example.com/miocic.jpg',
        },
        {
            name: 'Amanda Nunes',
            nickname: 'The Lioness',
            birthDate: new Date('1988-05-30'),
            nationality: 'Brazil',
            height: 173,
            reach: 175,
            stance: 'Orthodox',
            photoUrl: 'https://example.com/nunes.jpg',
        },
        {
            name: 'Valentina Shevchenko',
            nickname: 'Bullet',
            birthDate: new Date('1988-03-07'),
            nationality: 'Kyrgyzstan',
            height: 165,
            reach: 167,
            stance: 'Southpaw',
            photoUrl: 'https://example.com/valentina.jpg',
        },
    ]

    for (const fighter of fighters) {
        await prisma.fighter.create({ data: fighter })
    }

    console.log('✅ Seed tamamlandı: 10 dövüşçü eklendi.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
