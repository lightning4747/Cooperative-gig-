import type { WelfareLedger } from '@/types/welfare'

export const mockWelfareLedgers: Record<string, WelfareLedger> = {
  'wrk-ramesh-kumar': {
    workerId: 'wrk-ramesh-kumar',
    workerName: 'Ramesh Kumar',
    societyName: 'Bengaluru South Cooperative Labour Society',
    totalContributions: 2400,
    balance: 2400,
    entries: [
      {
        id: 'welf-1',
        jobId: 'job-98',
        serviceName: 'Pipe leakage',
        amount: 150,
        date: '2026-09-17T11:00:00.000Z',
      },
      {
        id: 'welf-2',
        jobId: 'job-99',
        serviceName: 'Drain blockage',
        amount: 100,
        date: '2026-09-18T15:30:00.000Z',
      },
    ],
  },
  'wrk-suresh-gowda': {
    workerId: 'wrk-suresh-gowda',
    workerName: 'Suresh Gowda',
    societyName: 'Bengaluru South Cooperative Labour Society',
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
