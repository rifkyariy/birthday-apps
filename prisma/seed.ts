import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@mail.com',
    birthdate: new Date('1990-01-01'),
    location: 'London',
    timezone: 'Europe/London',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function main() {
  console.log(`Start seeding...`)
  console.log(`Seeding Users...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })