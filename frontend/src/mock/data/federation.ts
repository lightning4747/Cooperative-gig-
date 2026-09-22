import type { Federation, Society } from '@/types/federation'

export const mockFederation: Federation = {
  id: 'fed-kar-01',
  name: 'Karnataka State Cooperative Labour & Services Federation',
  registrationNumber: 'KSC-FED-2021-098',
  createdAt: '2021-04-15T00:00:00.000Z',
  totalSocieties: 5,
  totalWorkers: 20,
}

export const mockSocieties: Society[] = [
  {
    id: 'soc-blr-south',
    federationId: 'fed-kar-01',
    name: 'Bengaluru South Cooperative Labour Society',
    registrationNumber: 'SOC-BLR-S-104',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    workerCount: 5,
  },
  {
    id: 'soc-blr-east',
    federationId: 'fed-kar-01',
    name: 'Indiranagar & East Cooperative Artisan Society',
    registrationNumber: 'SOC-BLR-E-208',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    workerCount: 4,
  },
  {
    id: 'soc-blr-north',
    federationId: 'fed-kar-01',
    name: 'Yelahanka & North Cooperative Workers Guild',
    registrationNumber: 'SOC-BLR-N-315',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    workerCount: 4,
  },
  {
    id: 'soc-blr-west',
    federationId: 'fed-kar-01',
    name: 'Malleshwaram Cooperative Technician Guild',
    registrationNumber: 'SOC-BLR-W-419',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    workerCount: 4,
  },
  {
    id: 'soc-blr-central',
    federationId: 'fed-kar-01',
    name: 'Shivajinagar & Central Cooperative Services Union',
    registrationNumber: 'SOC-BLR-C-522',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    workerCount: 3,
  },
]
