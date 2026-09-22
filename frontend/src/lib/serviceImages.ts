/**
 * Centralized registry of high-resolution, thematic Unsplash imagery
 * for Cooperative Gig trade categories and subservices.
 *
 * Query parameters ensure optimized CDN delivery on mobile viewports (w=400, q=80).
 * Every category and subservice is assigned a unique, trade-specific image.
 */

export const CATEGORY_IMAGES: Record<string, string> = {
  // Plumbing (under-sink pipe wrench plumbing)
  'cat-plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80',
  '4bbd5d1f-bd68-5ec0-bdda-add37ebc4ed7': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80',
  plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80',

  // Electrical (electrician testing panel)
  'cat-electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
  '728542f6-3d87-5ca1-a385-dca25bf9e89c': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',

  // Carpentry (woodcraft tools & carpentry workshop workbench)
  'cat-carpentry': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
  'ebeed2c8-ac0c-565c-949b-dc5e64921ae2': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
  carpentry: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',

  // Painting (dedicated wall painting with paint roller)
  'cat-painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
  'bad592e5-b5a1-5ba4-bf03-bc5821720792': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
  painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',

  // Domestic Help (household cleaning supplies & spray bottle)
  'cat-domestic-help': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  'd6b63758-be87-5e47-9aee-ddd1724a7a23': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  domestic_help: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',

  // Caregiving (compassionate caregiver holding senior person hands)
  'cat-caregiving': 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
  'b63aca8a-356d-583a-958d-b33b0360843e': 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
  caregiving: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',

  // Driving (chauffeur behind steering wheel on the road)
  'cat-driving': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
  'b1f9db57-5443-5087-9100-864ce36846e4': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
  driving: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',

  // Gardening (gardening trowel & potted plants)
  'cat-gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
  '3e58f154-bd1e-52fc-abbe-ebb83ed9c255': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
  gardening: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',

  // Cleaning (professional surface cleaner and cleaning supplies)
  'cat-cleaning': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80',
  '59040d45-f4ef-5142-82d4-422f3960ba53': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80',
  cleaning: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80',

  // Technician (technical diagnostic equipment & tools)
  'cat-technician': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
  '248fe068-d549-5927-9eb6-0487a501c33a': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
  technician: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
}

export const SUBSERVICE_IMAGES: Record<string, string> = {
  // ==========================================
  // Plumbing (5 Subservices)
  // ==========================================
  // Pipe leakage repair: Pipe wrench repairing copper pipe leak
  'sub-plumb-01': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
  'a50889de-f3ad-5f9c-9924-67f0e5c84142': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',

  // Tap repair: Chrome water faucet tap
  'sub-plumb-02': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80',
  '1c39409f-a3ea-57cf-a65c-ae9fa6990284': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80',

  // Drain blockage: Bathroom / sink drain trap unclogging
  'sub-plumb-03': 'https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&w=400&q=80',
  'c332d6c9-842c-5ede-9138-ab377926c2ea': 'https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&w=400&q=80',

  // Bathroom fitting: Shower head and chrome fixtures installation
  'sub-plumb-04': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&q=80',
  'd4ae2c08-52c3-5e49-917d-41da140d2142': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&q=80',

  // Pipe burst: Urgent high-pressure burst pipe repair
  'sub-plumb-05': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80',
  '86071327-e663-56fe-9f6b-cedd350a25c5': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Electrical (4 Subservices)
  // ==========================================
  // Fan repair: Ceiling fan fixture and motor servicing
  'sub-elec-01': 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80',
  '5d239e0d-5972-5fad-b779-74a7f9429cf5': 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80',

  // MCB wiring: Circuit breaker panel and distribution box check
  'sub-elec-02': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
  '6a5899ac-ff41-501b-a541-d6b5720bfd36': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',

  // Switchboard repair: Wall switch socket and modular panel
  'sub-elec-03': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
  '91320116-2e30-5065-99bb-0c7d4dcb33f7': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',

  // Short circuit: Multimeter testing power and short circuit diagnostic
  'sub-elec-04': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
  '3cd1e8eb-9de4-582f-a5c4-f0370d349442': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Carpentry (5 Subservices)
  // ==========================================
  // Furniture assembly: Assembling wooden table & flatpack furniture
  'sub-carp-01': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
  '0e62524b-11b3-5e3c-a8c1-4364fcda8325': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',

  // Drilling & hanging: Power drill drilling screws into wall
  'sub-carp-02': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
  '651669fc-bef1-5156-8dd8-671eb1ee752e': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',

  // Hinge repair: Cabinet door hinge and drawer hardware adjustment
  'sub-carp-03': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=80',
  'f593ea72-b15d-5f0b-8179-325a3453ac26': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=80',

  // Door repair: Wooden door craftsmanship and frame alignment
  'sub-carp-04': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=400&q=80',
  '0ce21281-e442-54ee-8553-b401c14869fe': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=400&q=80',

  // Door lock jamming: Door lock cylinder and deadbolt latch mechanism
  'sub-carp-05': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
  '6dd3c01b-1b75-5c15-8b07-967695f6f95d': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Painting (4 Subservices)
  // ==========================================
  // Wall painting: Interior room wall emulsion painting
  'sub-paint-01': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
  '72051f2c-ddff-521c-b477-611bd38879f5': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',

  // Dampness patching: Wall crack plastering and putty barrier repair
  'sub-paint-02': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  'b48f9cc4-bcb6-53aa-9754-2b004f57c822': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',

  // Touch-up painting: Fine detail paint brush touching up borders
  'sub-paint-03': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
  'e3af2cd2-0d42-5604-9bf7-4deb4ffa7fdc': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',

  // Door/window polishing: Varnish and wood stain buffing
  'sub-paint-04': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
  '07057f91-b97a-502a-98aa-aa6d63b7fe57': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Domestic Help (4 Subservices)
  // ==========================================
  // Housekeeping: Dusting, sweeping, and home tidying
  'sub-dom-01': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80',
  '5011eb54-7b5b-5e64-81a0-3e675158ee44': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80',

  // Cooking assistance: Chopping fresh vegetables and cooking preparation
  'sub-dom-02': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
  '31ac9cca-23db-534e-af6d-8e0319aa81c9': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',

  // Laundry: Laundry wash cycle management and clothing care
  'sub-dom-03': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=400&q=80',
  '2e36d3ae-dcd5-50ec-b786-e7ee57b59742': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=400&q=80',

  // General household help: Living room organization and domestic support
  'sub-dom-04': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  '5ebf019c-b2cb-5ef4-88b6-10ace8b8815b': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Caregiving (4 Subservices)
  // ==========================================
  // Elderly care: Elderly companionship and supportive conversation
  'sub-care-01': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80',
  'b9f05c78-a65c-5d36-9248-3e41614b419f': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80',

  // Patient assistance: Bedside patient healthcare and vitals monitoring
  'sub-care-02': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
  'c002d262-3e43-5b65-ba41-807c1c37a0d4': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',

  // Child care: Safe child supervision and toddler play
  'sub-care-03': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80',
  '5405cacb-5602-5cde-a6d2-54d11fccf3fb': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80',

  // Mobility support: Wheelchair transit and mobility assistance
  'sub-care-04': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  '242ad45c-9c64-520a-bd7c-2e895f43bf8d': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Driving (4 Subservices)
  // ==========================================
  // Local driver: Intra-city chauffeur driving through urban streets
  'sub-driv-01': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
  '3103c3af-d7a4-592c-b770-7657f295334f': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',

  // Outstation travel: Scenic highway road trip cruising
  'sub-driv-02': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=400&q=80',
  '10e3dc18-2823-53b4-9616-aa27653b590c': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=400&q=80',

  // Pickup / drop: Luggage loaded into car boot for airport transfer
  'sub-driv-03': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80',
  '1036af50-335e-5062-8e62-cc7e7f53a9f8': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80',

  // Emergency transit: Fast night transit navigation and steering
  'sub-driv-04': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&q=80',
  '79d25de8-c2a5-5404-8039-5402f6153205': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Gardening (4 Subservices)
  // ==========================================
  // Lawn trimming: Lawn mower cutting lush green residential lawn
  'sub-gard-01': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80',
  '08bd48a6-5ee8-5f62-bb21-0b3b080bb041': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80',

  // Terrace garden maintenance: Balcony terrace potted plants and greenery
  'sub-gard-02': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
  '133547bd-0b5e-5bb0-8ff3-0b3e69178775': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',

  // Pruning & shaping: Hand pruning shears clipping hedge branches
  'sub-gard-03': 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=400&q=80',
  'd33b12d2-3f35-5aed-a3a4-c2794621365b': 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=400&q=80',

  // Garden maintenance: Gardener planting in nutrient soil with trowel
  'sub-gard-04': 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=400&q=80',
  '8fc24547-00bf-5765-9fb3-3abe367dca05': 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Cleaning (4 Subservices)
  // ==========================================
  // Deep cleaning: High power vacuum and comprehensive floor scrub
  'sub-clean-01': 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80',
  '09522eee-64bf-5a3b-a63a-edbc04c727f2': 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80',

  // Water tank cleaning: High pressure reservoir and tank wash
  'sub-clean-02': 'https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=400&q=80',
  '6475750c-a06f-5881-bd2a-2a8c0c06f2e3': 'https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=400&q=80',

  // Bathroom sanitation: Tile grout descaling and sparkling sanitation
  'sub-clean-03': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=80',
  '642c7de3-7f48-577d-b734-59898337becf': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=80',

  // Kitchen sanitation: Chimney surface and countertop grease removal
  'sub-clean-04': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
  '752637a3-f55d-5a92-8f83-e460276dbfb9': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',

  // ==========================================
  // Technician (4 Subservices)
  // ==========================================
  // CCTV repair: Wall-mounted security camera inspection
  'sub-tech-01': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
  '2855810c-308a-5cc7-ba30-f4726cce5382': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',

  // Wi-Fi router setup: Wireless router antenna configuration and network cables
  'sub-tech-02': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  'f24a2b3c-c31f-54e9-b4c5-6903e38a2f4e': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',

  // Water purifier service: Clean water RO purification filtration tap
  'sub-tech-03': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
  'dc3fb3d9-3eb0-531d-a342-7bf906dda8cb': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',

  // Appliance repair: Washing machine and home appliance diagnostic servicing
  'sub-tech-04': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80',
  '7cacbddc-3169-5336-b80d-4a9935591304': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80',
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80'

/**
 * Returns a high-resolution Unsplash image URL for a given category ID or code.
 */
export function getCategoryImageUrl(categoryIdOrCode: string): string {
  if (!categoryIdOrCode) return DEFAULT_FALLBACK_IMAGE
  const key = categoryIdOrCode.toLowerCase()
  return CATEGORY_IMAGES[key] || CATEGORY_IMAGES[`cat-${key}`] || DEFAULT_FALLBACK_IMAGE
}

/**
 * Returns a high-resolution Unsplash image URL for a given subservice ID,
 * falling back to the category image if not directly matched.
 */
export function getSubserviceImageUrl(subserviceId: string, categoryIdOrCode?: string): string {
  if (subserviceId && SUBSERVICE_IMAGES[subserviceId]) {
    return SUBSERVICE_IMAGES[subserviceId]
  }
  if (categoryIdOrCode) {
    return getCategoryImageUrl(categoryIdOrCode)
  }
  return DEFAULT_FALLBACK_IMAGE
}
