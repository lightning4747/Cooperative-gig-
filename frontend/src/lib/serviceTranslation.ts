import type { TFunction } from 'i18next'

export interface CategoryMetadata {
  code: string
  name: string
  subTasks: string
  icon: string
}

export const CATEGORY_MAP: Record<string, CategoryMetadata> = {
  // Backend DB UUIDs
  '4bbd5d1f-bd68-5ec0-bdda-add37ebc4ed7': {
    code: 'plumbing',
    name: 'Plumbing',
    subTasks: 'Leak, Tap, Pipe',
    icon: 'Droplets',
  },
  '728542f6-3d87-5ca1-a385-dca25bf9e89c': {
    code: 'electrical',
    name: 'Electrical',
    subTasks: 'Wiring, Switch, Fan',
    icon: 'Zap',
  },
  'ebeed2c8-ac0c-565c-949b-dc5e64921ae2': {
    code: 'carpentry',
    name: 'Carpentry',
    subTasks: 'Lock, Assembly, Door',
    icon: 'Hammer',
  },
  'bad592e5-b5a1-5ba4-bf03-bc5821720792': {
    code: 'painting',
    name: 'Painting',
    subTasks: 'Wall, Patch, Polish',
    icon: 'Paintbrush',
  },
  'd6b63758-be87-5e47-9aee-ddd1724a7a23': {
    code: 'domestic_help',
    name: 'Domestic Help',
    subTasks: 'Housekeeping, Cook',
    icon: 'Home',
  },
  'b63aca8a-356d-583a-958d-b33b0360843e': {
    code: 'caregiving',
    name: 'Caregiving',
    subTasks: 'Elderly, Child, Nurse',
    icon: 'Heart',
  },
  'b1f9db57-5443-5087-9100-864ce36846e4': {
    code: 'driving',
    name: 'Driving',
    subTasks: 'Local, Outstation, Transit',
    icon: 'Car',
  },
  '3e58f154-bd1e-52fc-abbe-ebb83ed9c255': {
    code: 'gardening',
    name: 'Gardening',
    subTasks: 'Lawn, Pruning, Plants',
    icon: 'Leaf',
  },
  '59040d45-f4ef-5142-82d4-422f3960ba53': {
    code: 'cleaning',
    name: 'Cleaning',
    subTasks: 'Deep Clean, Tank, Sanitize',
    icon: 'Sparkles',
  },
  '248fe068-d549-5927-9eb6-0487a501c33a': {
    code: 'technician',
    name: 'Technician',
    subTasks: 'Appliance, CCTV, WiFi',
    icon: 'Wrench',
  },

  // Mock Category IDs
  'cat-plumbing': {
    code: 'plumbing',
    name: 'Plumbing',
    subTasks: 'Leak, Tap, Pipe',
    icon: 'Droplets',
  },
  'cat-electrical': {
    code: 'electrical',
    name: 'Electrical',
    subTasks: 'Wiring, Switch, Fan',
    icon: 'Zap',
  },
  'cat-carpentry': {
    code: 'carpentry',
    name: 'Carpentry',
    subTasks: 'Lock, Assembly, Door',
    icon: 'Hammer',
  },
  'cat-painting': {
    code: 'painting',
    name: 'Painting',
    subTasks: 'Wall, Patch, Polish',
    icon: 'Paintbrush',
  },
  'cat-domestic-help': {
    code: 'domestic_help',
    name: 'Domestic Help',
    subTasks: 'Housekeeping, Cook',
    icon: 'Home',
  },
  'cat-caregiving': {
    code: 'caregiving',
    name: 'Caregiving',
    subTasks: 'Elderly, Child, Nurse',
    icon: 'Heart',
  },
  'cat-driving': {
    code: 'driving',
    name: 'Driving',
    subTasks: 'Local, Outstation, Transit',
    icon: 'Car',
  },
  'cat-gardening': {
    code: 'gardening',
    name: 'Gardening',
    subTasks: 'Lawn, Pruning, Plants',
    icon: 'Leaf',
  },
  'cat-cleaning': {
    code: 'cleaning',
    name: 'Cleaning',
    subTasks: 'Deep Clean, Tank, Sanitize',
    icon: 'Sparkles',
  },
  'cat-technician': {
    code: 'technician',
    name: 'Technician',
    subTasks: 'Appliance, CCTV, WiFi',
    icon: 'Wrench',
  },

  // Direct category codes
  plumbing: {
    code: 'plumbing',
    name: 'Plumbing',
    subTasks: 'Leak, Tap, Pipe',
    icon: 'Droplets',
  },
  electrical: {
    code: 'electrical',
    name: 'Electrical',
    subTasks: 'Wiring, Switch, Fan',
    icon: 'Zap',
  },
  carpentry: {
    code: 'carpentry',
    name: 'Carpentry',
    subTasks: 'Lock, Assembly, Door',
    icon: 'Hammer',
  },
  painting: {
    code: 'painting',
    name: 'Painting',
    subTasks: 'Wall, Patch, Polish',
    icon: 'Paintbrush',
  },
  domestic_help: {
    code: 'domestic_help',
    name: 'Domestic Help',
    subTasks: 'Housekeeping, Cook',
    icon: 'Home',
  },
  'domestic help': {
    code: 'domestic_help',
    name: 'Domestic Help',
    subTasks: 'Housekeeping, Cook',
    icon: 'Home',
  },
  caregiving: {
    code: 'caregiving',
    name: 'Caregiving',
    subTasks: 'Elderly, Child, Nurse',
    icon: 'Heart',
  },
  driving: {
    code: 'driving',
    name: 'Driving',
    subTasks: 'Local, Outstation, Transit',
    icon: 'Car',
  },
  gardening: {
    code: 'gardening',
    name: 'Gardening',
    subTasks: 'Lawn, Pruning, Plants',
    icon: 'Leaf',
  },
  cleaning: {
    code: 'cleaning',
    name: 'Cleaning',
    subTasks: 'Deep Clean, Tank, Sanitize',
    icon: 'Sparkles',
  },
  technician: {
    code: 'technician',
    name: 'Technician',
    subTasks: 'Appliance, CCTV, WiFi',
    icon: 'Wrench',
  },
}

export const SUB_SERVICES_MAP: Record<
  string,
  { name: string; categoryCode: string; categoryName: string }
> = {
  // Plumbing
  'a50889de-f3ad-5f9c-9924-67f0e5c84142': {
    name: 'Pipe leakage repair',
    categoryCode: 'plumbing',
    categoryName: 'Plumbing',
  },
  '1c39409f-a3ea-57cf-a65c-ae9fa6990284': {
    name: 'Tap repair',
    categoryCode: 'plumbing',
    categoryName: 'Plumbing',
  },
  'c332d6c9-842c-5ede-9138-ab377926c2ea': {
    name: 'Drain blockage',
    categoryCode: 'plumbing',
    categoryName: 'Plumbing',
  },
  'd4ae2c08-52c3-5e49-917d-41da140d2142': {
    name: 'Bathroom fitting',
    categoryCode: 'plumbing',
    categoryName: 'Plumbing',
  },
  '86071327-e663-56fe-9f6b-cedd350a25c5': {
    name: 'Pipe burst',
    categoryCode: 'plumbing',
    categoryName: 'Plumbing',
  },

  // Electrical
  '5d239e0d-5972-5fad-b779-74a7f9429cf5': {
    name: 'Fan repair',
    categoryCode: 'electrical',
    categoryName: 'Electrical',
  },
  '6a5899ac-ff41-501b-a541-d6b5720bfd36': {
    name: 'MCB wiring',
    categoryCode: 'electrical',
    categoryName: 'Electrical',
  },
  '91320116-2e30-5065-99bb-0c7d4dcb33f7': {
    name: 'Switchboard repair',
    categoryCode: 'electrical',
    categoryName: 'Electrical',
  },
  '3cd1e8eb-9de4-582f-a5c4-f0370d349442': {
    name: 'Short circuit',
    categoryCode: 'electrical',
    categoryName: 'Electrical',
  },

  // Carpentry
  '0e62524b-11b3-5e3c-a8c1-4364fcda8325': {
    name: 'Furniture assembly',
    categoryCode: 'carpentry',
    categoryName: 'Carpentry',
  },
  '651669fc-bef1-5156-8dd8-671eb1ee752e': {
    name: 'Drilling & hanging',
    categoryCode: 'carpentry',
    categoryName: 'Carpentry',
  },
  'f593ea72-b15d-5f0b-8179-325a3453ac26': {
    name: 'Hinge repair',
    categoryCode: 'carpentry',
    categoryName: 'Carpentry',
  },
  '0ce21281-e442-54ee-8553-b401c14869fe': {
    name: 'Door repair',
    categoryCode: 'carpentry',
    categoryName: 'Carpentry',
  },
  '6dd3c01b-1b75-5c15-8b07-967695f6f95d': {
    name: 'Door lock jamming',
    categoryCode: 'carpentry',
    categoryName: 'Carpentry',
  },

  // Painting
  '72051f2c-ddff-521c-b477-611bd38879f5': {
    name: 'Wall painting',
    categoryCode: 'painting',
    categoryName: 'Painting',
  },
  'b48f9cc4-bcb6-53aa-9754-2b004f57c822': {
    name: 'Dampness patching',
    categoryCode: 'painting',
    categoryName: 'Painting',
  },
  'e3af2cd2-0d42-5604-9bf7-4deb4ffa7fdc': {
    name: 'Touch-up painting',
    categoryCode: 'painting',
    categoryName: 'Painting',
  },
  '07057f91-b97a-502a-98aa-aa6d63b7fe57': {
    name: 'Door/window polishing',
    categoryCode: 'painting',
    categoryName: 'Painting',
  },

  // Domestic Help
  '5011eb54-7b5b-5e64-81a0-3e675158ee44': {
    name: 'Housekeeping',
    categoryCode: 'domestic_help',
    categoryName: 'Domestic Help',
  },
  '31ac9cca-23db-534e-af6d-8e0319aa81c9': {
    name: 'Cooking assistance',
    categoryCode: 'domestic_help',
    categoryName: 'Domestic Help',
  },
  '2e36d3ae-dcd5-50ec-b786-e7ee57b59742': {
    name: 'Laundry',
    categoryCode: 'domestic_help',
    categoryName: 'Domestic Help',
  },
  '5ebf019c-b2cb-5ef4-88b6-10ace8b8815b': {
    name: 'General household help',
    categoryCode: 'domestic_help',
    categoryName: 'Domestic Help',
  },

  // Caregiving
  'b9f05c78-a65c-5d36-9248-3e41614b419f': {
    name: 'Elderly care',
    categoryCode: 'caregiving',
    categoryName: 'Caregiving',
  },
  'c002d262-3e43-5b65-ba41-807c1c37a0d4': {
    name: 'Patient assistance',
    categoryCode: 'caregiving',
    categoryName: 'Caregiving',
  },
  '5405cacb-5602-5cde-a6d2-54d11fccf3fb': {
    name: 'Child care',
    categoryCode: 'caregiving',
    categoryName: 'Caregiving',
  },
  '242ad45c-9c64-520a-bd7c-2e895f43bf8d': {
    name: 'Mobility support',
    categoryCode: 'caregiving',
    categoryName: 'Caregiving',
  },

  // Driving
  '3103c3af-d7a4-592c-b770-7657f295334f': {
    name: 'Local driver',
    categoryCode: 'driving',
    categoryName: 'Driving',
  },
  '10e3dc18-2823-53b4-9616-aa27653b590c': {
    name: 'Outstation travel',
    categoryCode: 'driving',
    categoryName: 'Driving',
  },
  '1036af50-335e-5062-8e62-cc7e7f53a9f8': {
    name: 'Pickup / drop',
    categoryCode: 'driving',
    categoryName: 'Driving',
  },
  '79d25de8-c2a5-5404-8039-5402f6153205': {
    name: 'Emergency transit',
    categoryCode: 'driving',
    categoryName: 'Driving',
  },

  // Gardening
  '08bd48a6-5ee8-5f62-bb21-0b3b080bb041': {
    name: 'Lawn trimming',
    categoryCode: 'gardening',
    categoryName: 'Gardening',
  },
  '133547bd-0b5e-5bb0-8ff3-0b3e69178775': {
    name: 'Terrace garden maintenance',
    categoryCode: 'gardening',
    categoryName: 'Gardening',
  },
  'd33b12d2-3f35-5aed-a3a4-c2794621365b': {
    name: 'Pruning & shaping',
    categoryCode: 'gardening',
    categoryName: 'Gardening',
  },
  '8fc24547-00bf-5765-9fb3-3abe367dca05': {
    name: 'Garden maintenance',
    categoryCode: 'gardening',
    categoryName: 'Gardening',
  },

  // Cleaning
  '09522eee-64bf-5a3b-a63a-edbc04c727f2': {
    name: 'Deep cleaning',
    categoryCode: 'cleaning',
    categoryName: 'Cleaning',
  },
  '6475750c-a06f-5881-bd2a-2a8c0c06f2e3': {
    name: 'Water tank cleaning',
    categoryCode: 'cleaning',
    categoryName: 'Cleaning',
  },
  '642c7de3-7f48-577d-b734-59898337becf': {
    name: 'Bathroom sanitation',
    categoryCode: 'cleaning',
    categoryName: 'Cleaning',
  },
  '752637a3-f55d-5a92-8f83-e460276dbfb9': {
    name: 'Kitchen sanitation',
    categoryCode: 'cleaning',
    categoryName: 'Cleaning',
  },

  // Technician
  '2855810c-308a-5cc7-ba30-f4726cce5382': {
    name: 'CCTV repair',
    categoryCode: 'technician',
    categoryName: 'Technician',
  },
  'f24a2b3c-c31f-54e9-b4c5-6903e38a2f4e': {
    name: 'Wi-Fi router setup',
    categoryCode: 'technician',
    categoryName: 'Technician',
  },
  'dc3fb3d9-3eb0-531d-a342-7bf906dda8cb': {
    name: 'Water purifier service',
    categoryCode: 'technician',
    categoryName: 'Technician',
  },
  '7cacbddc-3169-5336-b80d-4a9935591304': {
    name: 'Appliance repair',
    categoryCode: 'technician',
    categoryName: 'Technician',
  },
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(val?: string): boolean {
  if (!val) return false
  return UUID_REGEX.test(val.trim())
}

/**
 * Returns the localized category name based on category ID or name key.
 * Guarantees never returning a raw UUID to the user.
 */
export function getTranslatedCategoryName(
  t: TFunction,
  categoryId?: string,
  categoryName?: string
): string {
  // 1. Direct translation key
  if (categoryName && categoryName.startsWith('services.category.')) {
    return t(categoryName)
  }

  // 2. Check categoryId in dictionary
  if (categoryId) {
    const directMeta = CATEGORY_MAP[categoryId.toLowerCase()]
    if (directMeta) {
      const transKey = `services.category.${directMeta.code}`
      const translated = t(transKey)
      return translated !== transKey ? translated : directMeta.name
    }
  }

  // 3. Check categoryName in dictionary (if it was passed as UUID or code)
  if (categoryName) {
    const directMeta = CATEGORY_MAP[categoryName.toLowerCase()]
    if (directMeta) {
      const transKey = `services.category.${directMeta.code}`
      const translated = t(transKey)
      return translated !== transKey ? translated : directMeta.name
    }
  }

  // 4. If categoryName is a normal non-UUID string, return it
  if (categoryName && !isUuid(categoryName)) {
    const translated = t(categoryName)
    return translated !== categoryName ? translated : categoryName
  }

  return 'Cooperative Service'
}

/**
 * Returns the localized subservice name based on subservice ID or name key.
 * Guarantees never returning a raw UUID to the user.
 */
export function getTranslatedSubserviceName(
  t: TFunction,
  subserviceId?: string,
  subserviceName?: string
): string {
  // 1. Direct translation key
  if (subserviceName && subserviceName.startsWith('services.sub.')) {
    return t(subserviceName)
  }

  // 2. Check SUB_SERVICES_MAP by ID
  if (subserviceId && SUB_SERVICES_MAP[subserviceId.toLowerCase()]) {
    const entry = SUB_SERVICES_MAP[subserviceId.toLowerCase()]
    const transKey = `services.sub.${entry.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    const translated = t(transKey)
    return translated !== transKey ? translated : entry.name
  }

  // 3. Check SUB_SERVICES_MAP by name (if subserviceName was passed as a UUID)
  if (subserviceName && isUuid(subserviceName) && SUB_SERVICES_MAP[subserviceName.toLowerCase()]) {
    return SUB_SERVICES_MAP[subserviceName.toLowerCase()].name
  }

  // 4. If subserviceId is actually a category ID, return the category name
  if (subserviceId && CATEGORY_MAP[subserviceId.toLowerCase()]) {
    return CATEGORY_MAP[subserviceId.toLowerCase()].name
  }

  // 6. If subserviceName is a normal non-UUID string, return it
  if (subserviceName && !isUuid(subserviceName)) {
    const translated = t(subserviceName)
    return translated !== subserviceName ? translated : subserviceName
  }

  return 'Cooperative Skill Service'
}

export function getCategorySubTasks(categoryIdOrCode?: string): string {
  if (!categoryIdOrCode) return 'Certified Cooperative Service'
  const meta = CATEGORY_MAP[categoryIdOrCode.toLowerCase()]
  return meta ? meta.subTasks : 'Certified Cooperative Service'
}

/**
 * Returns localized name for workers/customers/admins.
 */
export function getTranslatedPersonName(t: TFunction, name?: string): string {
  if (!name) return 'Cooperative Member'
  const cleanKey = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
  const transKey = `entities.user.${cleanKey}`
  const translated = t(transKey)
  return translated !== transKey ? translated : name
}

/**
 * Returns localized name for cooperative societies.
 */
export function getTranslatedSocietyName(t: TFunction, name?: string): string {
  if (!name) return 'Cooperative Society'
  const cleanKey = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
  const transKey = `entities.society.${cleanKey}`
  const translated = t(transKey)
  return translated !== transKey ? translated : name
}

/**
 * Returns localized tag/label for booking type (EMERGENCY, ON_DEMAND, STANDARD).
 */
export function getTranslatedBookingType(t: TFunction, bookingType?: string): string {
  if (!bookingType) return 'Standard'
  const upper = bookingType.toUpperCase()
  const transKey = `entities.bookingType.${upper}`
  const translated = t(transKey)
  if (translated !== transKey) return translated
  if (upper === 'EMERGENCY') return t('job.bookingType.emergency', { defaultValue: 'Emergency Priority' })
  if (upper === 'ON_DEMAND') return t('job.bookingType.onDemand', { defaultValue: 'On-Demand (Immediate)' })
  if (upper === 'STANDARD') return t('job.bookingType.standard', { defaultValue: 'Standard Scheduled' })
  return bookingType
}
