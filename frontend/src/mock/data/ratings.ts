import type { Rating } from '@/types/rating'

export const mockRatings: Rating[] = [
  {
    id: 'rat-102',
    jobId: 'job-102',
    customerId: '83cf9fc2-33be-4b62-82c6-73396ab41283',
    customerName: 'Ravi Kumar',
    workerId: '83cf9fc2-33be-4b62-82c6-73396ab41284',
    workerName: 'Karthik Plumber',
    stars: 5,
    feedback: 'Arrived within 20 minutes for the emergency burst pipe in RS Puram. Very professional work under the cooperative society.',
    createdAt: '2026-09-19T09:40:00.000Z',
  },
  {
    id: 'rat-103',
    jobId: 'job-103',
    customerId: 'cust-anand-kumar',
    customerName: 'Anand Kumar',
    workerId: '83cf9fc2-33be-4b62-82c6-73396ab41281',
    workerName: 'Arun',
    stars: 5,
    feedback: 'Resolved MCB neutral fault safely in Peelamedu. Transparent guaranteed pricing.',
    createdAt: '2026-09-18T16:15:00.000Z',
  },
]
