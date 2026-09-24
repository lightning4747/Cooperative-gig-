import type { WelfareLedger } from '@/types/welfare'

export const mockWelfareLedgers: Record<string, WelfareLedger> = {
  '83cf9fc2-33be-4b62-82c6-73396ab41281': {
    workerId: '83cf9fc2-33be-4b62-82c6-73396ab41281',
    workerName: 'Arun',
    societyName: 'Coimbatore City Labour & Artisans Cooperative Society',
    totalContributions: 2400,
    balance: 2400,
    entries: [
      {
        id: 'welf-1',
        jobId: 'job-98',
        serviceName: 'Fan repair / installation',
        amount: 150,
        date: '2026-09-17T11:00:00.000Z',
      },
      {
        id: 'welf-2',
        jobId: 'job-99',
        serviceName: 'MCB wiring',
        amount: 100,
        date: '2026-09-18T15:30:00.000Z',
      },
    ],
  },
  '83cf9fc2-33be-4b62-82c6-73396ab41284': {
    workerId: '83cf9fc2-33be-4b62-82c6-73396ab41284',
    workerName: 'Karthik Plumber',
    societyName: 'RS Puram Cooperative Workers Union',
    totalContributions: 1850,
    balance: 1850,
    entries: [
      {
        id: 'welf-3',
        jobId: 'job-102',
        serviceName: 'Pipe burst',
        amount: 100,
        date: '2026-09-19T09:35:00.000Z',
      },
    ],
  },
}
