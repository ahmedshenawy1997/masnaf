import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:tMpfKsQwrOwSWzxxHwvsPAlFMNrkxRTF@postgres.railway.internal:5432/railway';
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
