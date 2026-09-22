import type { CustomerProfile } from '@/types/user'

export const mockCustomers: CustomerProfile[] = [
  {
    userId: 'cust-priya-sharma',
    name: 'Priya Sharma',
    phone: '9845012345',
    preferredLanguage: 'en',
    savedAddresses: [
      {
        id: 'addr-priya-home',
        label: 'Home',
        formattedAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103',
        latitude: 12.9279,
        longitude: 77.6718,
        isDefault: true,
      },
      {
        id: 'addr-priya-office',
        label: 'Office',
        formattedAddress: 'EcoSpace Business Park, Outer Ring Road, Bengaluru 560103',
        latitude: 12.9258,
        longitude: 77.6834,
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
        formattedAddress: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
        latitude: 12.9719,
        longitude: 77.6412,
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
        formattedAddress: 'B-Block, 7th Sector, HSR Layout, Bengaluru 560102',
        latitude: 12.9116,
        longitude: 77.6389,
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
        formattedAddress: 'Sampige Road, 8th Cross, Malleshwaram, Bengaluru 560003',
        latitude: 12.9982,
        longitude: 77.5714,
        isDefault: true,
      },
    ],
  },
  {
    userId: 'cust-karthik-rajan',
    name: 'Karthik Rajan',
    phone: '9845056789',
    preferredLanguage: 'ta',
    savedAddresses: [
      {
        id: 'addr-karthik-home',
        label: 'Home',
        formattedAddress: '4th Block, 80 Feet Road, Koramangala, Bengaluru 560034',
        latitude: 12.9352,
        longitude: 77.6245,
        isDefault: true,
      },
    ],
  },
]
