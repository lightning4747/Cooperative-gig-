import type { Federation, Society } from '@/types/federation'

export const mockFederation: Federation = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Coimbatore District Labour & Services Cooperative Federation',
  registrationNumber: 'TN-FED-2022-001',
  createdAt: '2022-03-15T00:00:00.000Z',
  totalSocieties: 4,
  totalWorkers: 5,
}

export const mockSocieties: Society[] = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    federationId: '00000000-0000-0000-0000-000000000001',
    name: 'Coimbatore City Labour & Artisans Cooperative Society',
    registrationNumber: 'TN-CBE-2023-011',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    workerCount: 2,
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    federationId: '00000000-0000-0000-0000-000000000001',
    name: 'RS Puram Cooperative Workers Union',
    registrationNumber: 'TN-CBE-2023-042',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    workerCount: 1,
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    federationId: '00000000-0000-0000-0000-000000000001',
    name: 'Peelamedu Cooperative Services Guild',
    registrationNumber: 'TN-CBE-2024-008',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    workerCount: 1,
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    federationId: '00000000-0000-0000-0000-000000000001',
    name: 'Saibaba Colony Cooperative Labour Guild',
    registrationNumber: 'TN-CBE-2024-025',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    workerCount: 1,
  },
]
