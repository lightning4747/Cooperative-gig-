import type { CustomerProfile } from '@/types/user'

export const mockCustomers: CustomerProfile[] = [
  {
    userId: '83cf9fc2-33be-4b62-82c6-73396ab41283',
    name: 'Ravi Kumar',
    phone: '9876543210',
    preferredLanguage: 'en',
    savedAddresses: [
      {
        id: 'addr-ravi-home',
        label: 'Home',
        formattedAddress: '12 Cross Cut Road, Gandhipuram, Coimbatore 641012',
        latitude: 11.0183,
        longitude: 76.9644,
        isDefault: true,
      },
      {
        id: 'addr-ravi-office',
        label: 'Office',
        formattedAddress: 'Avinashi Road, Peelamedu, Coimbatore 641004',
        latitude: 11.0267,
        longitude: 77.0055,
      },
    ],
  },
  {
    userId: 'cust-anand-kumar',
    name: 'Anand Kumar',
    phone: '9845023456',
    preferredLanguage: 'ta',
    savedAddresses: [
      {
        id: 'addr-anand-home',
        label: 'Residence',
        formattedAddress: 'DB Road, RS Puram, Coimbatore 641002',
        latitude: 11.0088,
        longitude: 76.9482,
        isDefault: true,
      },
    ],
  },
  {
    userId: 'cust-rajesh-singh',
    name: 'Rajesh Singh',
    phone: '9845034567',
    preferredLanguage: 'hi',
    savedAddresses: [
      {
        id: 'addr-rajesh-home',
        label: 'Home',
        formattedAddress: 'NSR Road, Saibaba Colony, Coimbatore 641011',
        latitude: 11.0298,
        longitude: 76.9452,
        isDefault: true,
      },
    ],
  },
  {
    userId: 'cust-meena-patel',
    name: 'Meena Patel',
    phone: '9845045678',
    preferredLanguage: 'en',
    savedAddresses: [
      {
        id: 'addr-meena-home',
        label: 'Home',
        formattedAddress: 'Trichy Road, Ramanathapuram, Coimbatore 641045',
        latitude: 10.9995,
        longitude: 76.9850,
        isDefault: true,
      },
    ],
  },
]
