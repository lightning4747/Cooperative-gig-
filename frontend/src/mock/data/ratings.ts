import type { Rating } from '@/types/rating'

export const mockRatings: Rating[] = [
  {
    id: 'rat-102',
    jobId: 'job-102',
    customerId: 'cust-karthik-rajan',
    customerName: 'Karthik Rajan',
    workerId: 'wrk-suresh-gowda',
    workerName: 'Suresh Gowda',
    stars: 5,
    feedback: 'Arrived within 20 minutes for the emergency burst pipe. Very professional work under the cooperative society.',
    createdAt: '2026-09-19T09:40:00.000Z',
  },
  {
    id: 'rat-103',
    jobId: 'job-103',
    customerId: 'cust-anand-kumar',
    customerName: 'Anand Kumar',
    workerId: 'wrk-manjunath-v',
    workerName: 'Manjunath V',
    stars: 5,
    feedback: 'Resolved MCB neutral fault safely. Transparent guaranteed pricing.',
    createdAt: '2026-09-18T16:15:00.000Z',
  },
]
