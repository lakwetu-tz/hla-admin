// Mock data for the admin panel

export interface Application {
  id: string
  companyName: string
  country: string
  category: string
  standSize: number
  status: "pending" | "approved" | "rejected" | "offer_sent"
  submittedAt: string
  contactEmail: string
  contactName: string
  contactPhone: string
  description: string
}

export interface Hall {
  id: string
  name: string
  theme: string
  totalArea: number
  availableArea: number
  stands: Stand[]
}

export interface Stand {
  id: string
  hallId: string
  number: string
  size: number
  status: "available" | "reserved" | "occupied"
  assignedCompany?: string
  assignedApplicationId?: string
}

export interface Invoice {
  id: string
  applicationId: string
  companyName: string
  hallName: string
  standNumber: string
  standSize: number
  amount: number
  depositAmount: number
  depositRequired: number
  deadline: string
  status: "pending" | "offer_sent" | "deposit_paid" | "fully_paid" | "overdue"
  createdAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  companyName: string
  amount: number
  depositPaid: boolean
  depositAmount: number
  fullPaid: boolean
  fullAmount: number
  dueDate: string
  paidDate?: string
  status: "pending" | "partial" | "paid" | "overdue"
  lateFee: number
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "super_admin" | "event_manager" | "finance_manager"
  lastLogin: string
  createdAt: string
}

// Sample Applications
export const mockApplications: Application[] = [
  {
    id: "APP001",
    companyName: "Kenya Fresh Exports",
    country: "Kenya",
    category: "Fruits",
    standSize: 24,
    status: "pending",
    submittedAt: "2026-02-15T10:30:00Z",
    contactEmail: "info@kenyafresh.co.ke",
    contactName: "James Mwangi",
    contactPhone: "+254 712 345 678",
    description: "Leading exporter of fresh fruits including avocados, mangoes, and passion fruits.",
  },
  {
    id: "APP002",
    companyName: "Nigeria Agro Solutions",
    country: "Nigeria",
    category: "Vegetables",
    standSize: 36,
    status: "approved",
    submittedAt: "2026-02-10T14:20:00Z",
    contactEmail: "contact@nigeriaagro.ng",
    contactName: "Adaeze Okwu",
    contactPhone: "+234 803 456 789",
    description: "Sustainable vegetable farming and distribution across West Africa.",
  },
  {
    id: "APP003",
    companyName: "SA Greenhouse Tech",
    country: "South Africa",
    category: "Machinery",
    standSize: 48,
    status: "offer_sent",
    submittedAt: "2026-02-08T09:15:00Z",
    contactEmail: "sales@sagreenhouse.co.za",
    contactName: "Pieter van der Berg",
    contactPhone: "+27 11 234 5678",
    description: "Modern greenhouse technology and irrigation systems for African climate.",
  },
  {
    id: "APP004",
    companyName: "Ethiopian Coffee Collective",
    country: "Ethiopia",
    category: "Grains",
    standSize: 18,
    status: "pending",
    submittedAt: "2026-02-20T16:45:00Z",
    contactEmail: "collective@ethcoffee.et",
    contactName: "Tadesse Bekele",
    contactPhone: "+251 91 234 5678",
    description: "Premium Ethiopian coffee beans and agricultural products.",
  },
  {
    id: "APP005",
    companyName: "Ghana Cocoa Farms",
    country: "Ghana",
    category: "Grains",
    standSize: 30,
    status: "rejected",
    submittedAt: "2026-02-05T11:00:00Z",
    contactEmail: "info@ghanacocoa.gh",
    contactName: "Kofi Mensah",
    contactPhone: "+233 24 567 8901",
    description: "Traditional cocoa farming with modern sustainable practices.",
  },
  {
    id: "APP006",
    companyName: "Morocco Citrus Export",
    country: "Morocco",
    category: "Fruits",
    standSize: 42,
    status: "pending",
    submittedAt: "2026-02-22T08:30:00Z",
    contactEmail: "export@moroccitrus.ma",
    contactName: "Hassan El Amrani",
    contactPhone: "+212 6 12 34 56 78",
    description: "Premium citrus fruits from the Atlas region.",
  },
  {
    id: "APP007",
    companyName: "Tanzania Seeds Co",
    country: "Tanzania",
    category: "Seeds",
    standSize: 20,
    status: "approved",
    submittedAt: "2026-02-12T13:20:00Z",
    contactEmail: "seeds@tzseeds.co.tz",
    contactName: "Neema Mwamba",
    contactPhone: "+255 78 901 2345",
    description: "High-yield seed varieties adapted for East African conditions.",
  },
  {
    id: "APP008",
    companyName: "Uganda Organic Farms",
    country: "Uganda",
    category: "Vegetables",
    standSize: 28,
    status: "pending",
    submittedAt: "2026-02-25T10:00:00Z",
    contactEmail: "organic@ugandafarms.ug",
    contactName: "Grace Nakato",
    contactPhone: "+256 77 234 5678",
    description: "Certified organic vegetables and sustainable farming consultancy.",
  },
]

// Sample Halls
export const mockHalls: Hall[] = [
  {
    id: "HALL001",
    name: "West Africa Pavilion",
    theme: "Tropical Fruits & Vegetables",
    totalArea: 500,
    availableArea: 180,
    stands: [
      { id: "S001", hallId: "HALL001", number: "WA-01", size: 24, status: "occupied", assignedCompany: "Nigeria Agro Solutions", assignedApplicationId: "APP002" },
      { id: "S002", hallId: "HALL001", number: "WA-02", size: 30, status: "reserved", assignedCompany: "Ghana Cocoa Farms" },
      { id: "S003", hallId: "HALL001", number: "WA-03", size: 36, status: "available" },
      { id: "S004", hallId: "HALL001", number: "WA-04", size: 24, status: "available" },
      { id: "S005", hallId: "HALL001", number: "WA-05", size: 18, status: "available" },
    ],
  },
  {
    id: "HALL002",
    name: "East Africa Pavilion",
    theme: "Coffee, Tea & Highland Produce",
    totalArea: 450,
    availableArea: 120,
    stands: [
      { id: "S006", hallId: "HALL002", number: "EA-01", size: 24, status: "occupied", assignedCompany: "Kenya Fresh Exports", assignedApplicationId: "APP001" },
      { id: "S007", hallId: "HALL002", number: "EA-02", size: 20, status: "occupied", assignedCompany: "Tanzania Seeds Co", assignedApplicationId: "APP007" },
      { id: "S008", hallId: "HALL002", number: "EA-03", size: 28, status: "reserved", assignedCompany: "Uganda Organic Farms" },
      { id: "S009", hallId: "HALL002", number: "EA-04", size: 18, status: "available" },
    ],
  },
  {
    id: "HALL003",
    name: "Southern Africa Pavilion",
    theme: "Technology & Innovation",
    totalArea: 600,
    availableArea: 350,
    stands: [
      { id: "S010", hallId: "HALL003", number: "SA-01", size: 48, status: "occupied", assignedCompany: "SA Greenhouse Tech", assignedApplicationId: "APP003" },
      { id: "S011", hallId: "HALL003", number: "SA-02", size: 36, status: "available" },
      { id: "S012", hallId: "HALL003", number: "SA-03", size: 36, status: "available" },
      { id: "S013", hallId: "HALL003", number: "SA-04", size: 24, status: "available" },
    ],
  },
  {
    id: "HALL004",
    name: "North Africa Pavilion",
    theme: "Mediterranean Produce",
    totalArea: 400,
    availableArea: 280,
    stands: [
      { id: "S014", hallId: "HALL004", number: "NA-01", size: 42, status: "reserved", assignedCompany: "Morocco Citrus Export" },
      { id: "S015", hallId: "HALL004", number: "NA-02", size: 30, status: "available" },
      { id: "S016", hallId: "HALL004", number: "NA-03", size: 24, status: "available" },
    ],
  },
]

// Sample Invoices
export const mockInvoices: Invoice[] = [
  {
    id: "INV001",
    applicationId: "APP002",
    companyName: "Nigeria Agro Solutions",
    hallName: "West Africa Pavilion",
    standNumber: "WA-01",
    standSize: 36,
    amount: 7200,
    depositAmount: 2880,
    depositRequired: 2880,
    deadline: "2026-03-15T23:59:59Z",
    status: "deposit_paid",
    createdAt: "2026-02-11T10:00:00Z",
  },
  {
    id: "INV002",
    applicationId: "APP003",
    companyName: "SA Greenhouse Tech",
    hallName: "Southern Africa Pavilion",
    standNumber: "SA-01",
    standSize: 48,
    amount: 12000,
    depositAmount: 0,
    depositRequired: 4800,
    deadline: "2026-03-08T23:59:59Z",
    status: "offer_sent",
    createdAt: "2026-02-08T15:30:00Z",
  },
  {
    id: "INV003",
    applicationId: "APP007",
    companyName: "Tanzania Seeds Co",
    hallName: "East Africa Pavilion",
    standNumber: "EA-02",
    standSize: 20,
    amount: 4000,
    depositAmount: 4000,
    depositRequired: 1600,
    deadline: "2026-03-01T23:59:59Z",
    status: "fully_paid",
    createdAt: "2026-02-13T09:00:00Z",
  },
  {
    id: "INV004",
    applicationId: "APP001",
    companyName: "Kenya Fresh Exports",
    hallName: "East Africa Pavilion",
    standNumber: "EA-01",
    standSize: 24,
    amount: 4800,
    depositAmount: 1920,
    depositRequired: 1920,
    deadline: "2026-02-28T23:59:59Z",
    status: "overdue",
    createdAt: "2026-02-16T11:00:00Z",
  },
]

// Sample Payments
export const mockPayments: Payment[] = [
  {
    id: "PAY001",
    invoiceId: "INV001",
    companyName: "Nigeria Agro Solutions",
    amount: 7200,
    depositPaid: true,
    depositAmount: 2880,
    fullPaid: false,
    fullAmount: 7200,
    dueDate: "2026-03-15T23:59:59Z",
    paidDate: "2026-02-20T14:30:00Z",
    status: "partial",
    lateFee: 0,
  },
  {
    id: "PAY002",
    invoiceId: "INV002",
    companyName: "SA Greenhouse Tech",
    amount: 12000,
    depositPaid: false,
    depositAmount: 0,
    fullPaid: false,
    fullAmount: 12000,
    dueDate: "2026-03-08T23:59:59Z",
    status: "pending",
    lateFee: 0,
  },
  {
    id: "PAY003",
    invoiceId: "INV003",
    companyName: "Tanzania Seeds Co",
    amount: 4000,
    depositPaid: true,
    depositAmount: 1600,
    fullPaid: true,
    fullAmount: 4000,
    dueDate: "2026-03-01T23:59:59Z",
    paidDate: "2026-02-25T10:00:00Z",
    status: "paid",
    lateFee: 0,
  },
  {
    id: "PAY004",
    invoiceId: "INV004",
    companyName: "Kenya Fresh Exports",
    amount: 4800,
    depositPaid: true,
    depositAmount: 1920,
    fullPaid: false,
    fullAmount: 4800,
    dueDate: "2026-02-28T23:59:59Z",
    paidDate: "2026-02-18T09:00:00Z",
    status: "overdue",
    lateFee: 240,
  },
]

// Sample Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: "LOG001",
    userId: "1",
    userName: "John Okonkwo",
    action: "Approved Application",
    details: "Approved application APP002 from Nigeria Agro Solutions",
    timestamp: "2026-02-11T09:30:00Z",
  },
  {
    id: "LOG002",
    userId: "3",
    userName: "Kwame Asante",
    action: "Generated Invoice",
    details: "Generated invoice INV001 for Nigeria Agro Solutions - $7,200",
    timestamp: "2026-02-11T10:00:00Z",
  },
  {
    id: "LOG003",
    userId: "2",
    userName: "Amara Diallo",
    action: "Assigned Stand",
    details: "Assigned stand WA-01 to Nigeria Agro Solutions",
    timestamp: "2026-02-11T10:15:00Z",
  },
  {
    id: "LOG004",
    userId: "3",
    userName: "Kwame Asante",
    action: "Marked Payment",
    details: "Marked deposit payment of $2,880 for INV001",
    timestamp: "2026-02-20T14:30:00Z",
  },
  {
    id: "LOG005",
    userId: "1",
    userName: "John Okonkwo",
    action: "Rejected Application",
    details: "Rejected application APP005 from Ghana Cocoa Farms - Reason: Incomplete documentation",
    timestamp: "2026-02-06T11:00:00Z",
  },
]

// Sample Admin Users
export const mockAdminUsers: AdminUser[] = [
  {
    id: "1",
    email: "admin@hortilogistica.africa",
    name: "John Okonkwo",
    role: "super_admin",
    lastLogin: "2026-03-09T08:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    email: "events@hortilogistica.africa",
    name: "Amara Diallo",
    role: "event_manager",
    lastLogin: "2026-03-08T14:30:00Z",
    createdAt: "2025-06-20T09:00:00Z",
  },
  {
    id: "3",
    email: "finance@hortilogistica.africa",
    name: "Kwame Asante",
    role: "finance_manager",
    lastLogin: "2026-03-09T07:45:00Z",
    createdAt: "2025-03-10T11:00:00Z",
  },
]

// Dashboard Statistics
export function getDashboardStats() {
  const pendingApplications = mockApplications.filter((a) => a.status === "pending").length
  const totalBookedArea = mockHalls.reduce((sum, h) => sum + (h.totalArea - h.availableArea), 0)
  const totalAvailableArea = mockHalls.reduce((sum, h) => sum + h.availableArea, 0)
  const totalRevenue = mockInvoices.reduce((sum, i) => sum + i.depositAmount, 0)
  const expectedRevenue = mockInvoices.reduce((sum, i) => sum + i.amount, 0)
  const hallOccupancy = Math.round((totalBookedArea / (totalBookedArea + totalAvailableArea)) * 100)
  const overduePayments = mockPayments.filter((p) => p.status === "overdue")

  return {
    pendingApplications,
    totalBookedArea,
    totalAvailableArea,
    totalRevenue,
    expectedRevenue,
    hallOccupancy,
    overduePayments,
  }
}

// Applications by Country (for chart)
export function getApplicationsByCountry() {
  const countryCounts: Record<string, number> = {}
  mockApplications.forEach((app) => {
    countryCounts[app.country] = (countryCounts[app.country] || 0) + 1
  })
  return Object.entries(countryCounts).map(([country, count]) => ({ country, count }))
}

// Applications by Category (for chart)
export function getApplicationsByCategory() {
  const categoryCounts: Record<string, number> = {}
  mockApplications.forEach((app) => {
    categoryCounts[app.category] = (categoryCounts[app.category] || 0) + 1
  })
  return Object.entries(categoryCounts).map(([category, count]) => ({ category, count }))
}

// Sponsored Placements
export interface SponsoredPlacement {
  id: string
  partnerName: string
  website: string
  contactEmail: string
  contactName: string
  category: "Accommodation" | "Travel" | "Visa" | "Local Logistics" | "Finance"
  placementLocation: "Sidebar Carousel" | "Below Results" | "Resource Hub"
  status: "Active" | "Inactive" | "Pending" | "Expired"
  startDate: string
  endDate: string
  impressions: number
  clicks: number
  feeAmount: number
  paymentStatus: "Paid" | "Pending" | "Overdue"
  adTitle: string
  adDescription: string
  adImage: string
  ctaText: string
  ctaLink: string
  priority: number
  maxImpressions?: number
  notes?: string
}

export const mockPlacements: SponsoredPlacement[] = [
  {
    id: "PL001",
    partnerName: "Safari Lodge Nairobi",
    website: "https://safarilodge.co.ke",
    contactEmail: "partnerships@safarilodge.co.ke",
    contactName: "Mary Wanjiku",
    category: "Accommodation",
    placementLocation: "Sidebar Carousel",
    status: "Active",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    impressions: 15420,
    clicks: 892,
    feeAmount: 2500,
    paymentStatus: "Paid",
    adTitle: "Exclusive Exhibitor Rates",
    adDescription: "Special rates for Horti Logistica exhibitors. 5-star luxury in the heart of Nairobi.",
    adImage: "/placeholder.svg",
    ctaText: "Book Now",
    ctaLink: "https://safarilodge.co.ke/horti-special",
    priority: 1,
    maxImpressions: 50000,
    notes: "Premium partner - renewal expected",
  },
  {
    id: "PL002",
    partnerName: "Kenya Airways",
    website: "https://kenya-airways.com",
    contactEmail: "corporate@kenya-airways.com",
    contactName: "James Ochieng",
    category: "Travel",
    placementLocation: "Below Results",
    status: "Active",
    startDate: "2026-01-15",
    endDate: "2026-06-20",
    impressions: 28540,
    clicks: 1245,
    feeAmount: 5000,
    paymentStatus: "Paid",
    adTitle: "Fly with Kenya Airways",
    adDescription: "Direct flights to Nairobi from 40+ destinations. Group discounts available.",
    adImage: "/placeholder.svg",
    ctaText: "View Flights",
    ctaLink: "https://kenya-airways.com/horti",
    priority: 1,
  },
  {
    id: "PL003",
    partnerName: "VisaConnect Africa",
    website: "https://visaconnect.africa",
    contactEmail: "support@visaconnect.africa",
    contactName: "Ahmed Hassan",
    category: "Visa",
    placementLocation: "Resource Hub",
    status: "Pending",
    startDate: "2026-03-01",
    endDate: "2026-06-15",
    impressions: 0,
    clicks: 0,
    feeAmount: 1500,
    paymentStatus: "Pending",
    adTitle: "Fast Visa Processing",
    adDescription: "Get your Kenya visa in 48 hours. Trusted by 10,000+ business travelers.",
    adImage: "/placeholder.svg",
    ctaText: "Apply Now",
    ctaLink: "https://visaconnect.africa/kenya",
    priority: 2,
  },
  {
    id: "PL004",
    partnerName: "Quick Logistics Ltd",
    website: "https://quicklogistics.co.ke",
    contactEmail: "sales@quicklogistics.co.ke",
    contactName: "Peter Mwangi",
    category: "Local Logistics",
    placementLocation: "Sidebar Carousel",
    status: "Active",
    startDate: "2026-02-15",
    endDate: "2026-07-01",
    impressions: 8920,
    clicks: 456,
    feeAmount: 1800,
    paymentStatus: "Paid",
    adTitle: "Exhibition Logistics",
    adDescription: "Full-service exhibition logistics. Setup, breakdown, and storage solutions.",
    adImage: "/placeholder.svg",
    ctaText: "Get Quote",
    ctaLink: "https://quicklogistics.co.ke/exhibition",
    priority: 2,
  },
  {
    id: "PL005",
    partnerName: "AfriPay Business",
    website: "https://afripay.com",
    contactEmail: "enterprise@afripay.com",
    contactName: "Fatima Obi",
    category: "Finance",
    placementLocation: "Below Results",
    status: "Expired",
    startDate: "2025-09-01",
    endDate: "2026-02-28",
    impressions: 42100,
    clicks: 2890,
    feeAmount: 3500,
    paymentStatus: "Paid",
    adTitle: "Secure Business Payments",
    adDescription: "Cross-border payments made simple. Accept payments from 50+ countries.",
    adImage: "/placeholder.svg",
    ctaText: "Learn More",
    ctaLink: "https://afripay.com/business",
    priority: 3,
  },
]

// Ticket Registrations
export interface TicketRegistration {
  id: string
  name: string
  email: string
  phone: string
  company: string
  country: string
  ticketType: "Buyer" | "Visitor" | "Group" | "VIP"
  purchaseDate: string
  amountPaid: number
  paymentStatus: "Paid" | "Pending" | "Refunded"
  approvalStatus: "Pending" | "Approved" | "Rejected"
  qrCodeLink: string
  industryAffiliation?: string
  groupSize?: number
  notes?: string
}

export const mockTickets: TicketRegistration[] = [
  {
    id: "TKT001",
    name: "Elizabeth Njeri",
    email: "elizabeth@freshproduce.co.ke",
    phone: "+254 722 123 456",
    company: "Fresh Produce International",
    country: "Kenya",
    ticketType: "Buyer",
    purchaseDate: "2026-02-20T10:30:00Z",
    amountPaid: 250,
    paymentStatus: "Paid",
    approvalStatus: "Approved",
    qrCodeLink: "/api/tickets/TKT001/qr",
    industryAffiliation: "Wholesale Distributor",
  },
  {
    id: "TKT002",
    name: "Samuel Adeyemi",
    email: "samuel@lagosimports.ng",
    phone: "+234 803 456 789",
    company: "Lagos Imports Co.",
    country: "Nigeria",
    ticketType: "Buyer",
    purchaseDate: "2026-02-22T14:15:00Z",
    amountPaid: 250,
    paymentStatus: "Paid",
    approvalStatus: "Pending",
    qrCodeLink: "/api/tickets/TKT002/qr",
    industryAffiliation: "Supermarket Chain",
  },
  {
    id: "TKT003",
    name: "Grace Mensah",
    email: "grace.mensah@email.com",
    phone: "+233 24 567 890",
    company: "Individual",
    country: "Ghana",
    ticketType: "Visitor",
    purchaseDate: "2026-02-25T09:00:00Z",
    amountPaid: 75,
    paymentStatus: "Paid",
    approvalStatus: "Approved",
    qrCodeLink: "/api/tickets/TKT003/qr",
  },
  {
    id: "TKT004",
    name: "Mohammed Al-Rashid",
    email: "m.alrashid@uaefoods.ae",
    phone: "+971 50 123 4567",
    company: "UAE Foods Trading",
    country: "UAE",
    ticketType: "VIP",
    purchaseDate: "2026-02-18T11:30:00Z",
    amountPaid: 500,
    paymentStatus: "Paid",
    approvalStatus: "Approved",
    qrCodeLink: "/api/tickets/TKT004/qr",
    industryAffiliation: "Import/Export",
    notes: "VIP lounge access requested",
  },
  {
    id: "TKT005",
    name: "Chen Wei",
    email: "chen.wei@agrotech.cn",
    phone: "+86 138 1234 5678",
    company: "AgroTech Solutions",
    country: "China",
    ticketType: "Group",
    purchaseDate: "2026-02-28T16:00:00Z",
    amountPaid: 600,
    paymentStatus: "Pending",
    approvalStatus: "Pending",
    qrCodeLink: "/api/tickets/TKT005/qr",
    industryAffiliation: "Agricultural Technology",
    groupSize: 5,
  },
  {
    id: "TKT006",
    name: "Aisha Osman",
    email: "aisha@tanzaniafarms.co.tz",
    phone: "+255 78 234 5678",
    company: "Tanzania Farms Collective",
    country: "Tanzania",
    ticketType: "Buyer",
    purchaseDate: "2026-03-01T08:45:00Z",
    amountPaid: 250,
    paymentStatus: "Paid",
    approvalStatus: "Approved",
    qrCodeLink: "/api/tickets/TKT006/qr",
    industryAffiliation: "Farm Cooperative",
  },
  {
    id: "TKT007",
    name: "Pierre Dubois",
    email: "p.dubois@eurofresh.fr",
    phone: "+33 6 12 34 56 78",
    company: "EuroFresh Distribution",
    country: "France",
    ticketType: "Buyer",
    purchaseDate: "2026-03-02T13:20:00Z",
    amountPaid: 0,
    paymentStatus: "Pending",
    approvalStatus: "Pending",
    qrCodeLink: "/api/tickets/TKT007/qr",
    industryAffiliation: "European Distributor",
  },
  {
    id: "TKT008",
    name: "David Okonkwo",
    email: "david@email.com",
    phone: "+234 812 345 6789",
    company: "Individual",
    country: "Nigeria",
    ticketType: "Visitor",
    purchaseDate: "2026-02-15T10:00:00Z",
    amountPaid: 75,
    paymentStatus: "Refunded",
    approvalStatus: "Rejected",
    qrCodeLink: "/api/tickets/TKT008/qr",
    notes: "Refund requested - unable to attend",
  },
]

// Ticket Settings
export interface TicketSettings {
  buyerPrice: number
  visitorPrice: number
  groupPrice: number // per person
  vipPrice: number
  groupMinSize: number
  earlyBirdDiscount: number
  earlyBirdDeadline: string
  registrationDeadline: string
  discountCodes: { code: string; discount: number; expiresAt: string }[]
}

export const mockTicketSettings: TicketSettings = {
  buyerPrice: 250,
  visitorPrice: 75,
  groupPrice: 60,
  vipPrice: 500,
  groupMinSize: 5,
  earlyBirdDiscount: 15,
  earlyBirdDeadline: "2026-04-01",
  registrationDeadline: "2026-06-10",
  discountCodes: [
    { code: "EARLY2026", discount: 15, expiresAt: "2026-04-01" },
    { code: "PARTNER10", discount: 10, expiresAt: "2026-06-01" },
  ],
}

// Placement Settings
export interface PlacementSettings {
  maxAdsPerLocation: Record<string, number>
  rotationLogic: "random" | "sequential"
  defaultBadgeText: string
  defaultBadgeColor: string
}

export const mockPlacementSettings: PlacementSettings = {
  maxAdsPerLocation: {
    "Sidebar Carousel": 5,
    "Below Results": 3,
    "Resource Hub": 4,
  },
  rotationLogic: "random",
  defaultBadgeText: "Sponsored",
  defaultBadgeColor: "#2E7D32",
}

// Event Settings
export interface EventSettings {
  eventName: string
  eventDates: { start: string; end: string }
  pricePerSqm: number
  depositPercentage: number
  lateFeePercentage: number
  paymentDeadlineDays: number
}

export const mockEventSettings: EventSettings = {
  eventName: "Horti Logistica Africa 2026",
  eventDates: { start: "2026-06-15", end: "2026-06-18" },
  pricePerSqm: 200,
  depositPercentage: 40,
  lateFeePercentage: 5,
  paymentDeadlineDays: 14,
}

// Web Traffic Analytics
export interface TrafficData {
  date: string
  visits: number
  uniqueUsers: number
  bounceRate: number
  avgSessionDuration: number // in seconds
  conversions: number
}

export interface GeoTrafficData {
  country: string
  region: string
  countryCode: string
  visits: number
  uniqueUsers: number
  bounceRate: number
  conversions: number
  avgDuration: number
  source: "Organic" | "Direct" | "Referral" | "Social" | "Paid"
  lat: number
  lng: number
}

export interface PagePerformance {
  page: string
  views: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  exitRate: number
}

export interface TrafficSource {
  source: "Organic" | "Direct" | "Referral" | "Social" | "Paid"
  visits: number
  percentage: number
  conversions: number
}

export interface AIInsight {
  id: string
  type: "warning" | "opportunity" | "success"
  title: string
  description: string
  action?: string
  metric?: string
  region?: string
}

// Daily traffic data for the past 30 days
export const mockDailyTraffic: TrafficData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const baseVisits = 1200 + Math.floor(Math.random() * 800)
  const weekend = date.getDay() === 0 || date.getDay() === 6
  const visits = weekend ? Math.floor(baseVisits * 0.6) : baseVisits
  return {
    date: date.toISOString().split("T")[0],
    visits,
    uniqueUsers: Math.floor(visits * 0.75),
    bounceRate: 35 + Math.floor(Math.random() * 20),
    avgSessionDuration: 180 + Math.floor(Math.random() * 120),
    conversions: Math.floor(visits * 0.08 * Math.random()),
  }
})

// Weekly traffic aggregation
export const mockWeeklyTraffic: TrafficData[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - ((11 - i) * 7))
  const visits = 8000 + Math.floor(Math.random() * 4000)
  return {
    date: date.toISOString().split("T")[0],
    visits,
    uniqueUsers: Math.floor(visits * 0.72),
    bounceRate: 38 + Math.floor(Math.random() * 15),
    avgSessionDuration: 195 + Math.floor(Math.random() * 100),
    conversions: Math.floor(visits * 0.075),
  }
})

// Geo traffic data by country
export const mockGeoTraffic: GeoTrafficData[] = [
  { country: "Kenya", region: "East Africa", countryCode: "KE", visits: 28540, uniqueUsers: 21405, bounceRate: 32, conversions: 1842, avgDuration: 245, source: "Organic", lat: -1.286389, lng: 36.817223 },
  { country: "South Africa", region: "Southern Africa", countryCode: "ZA", visits: 18920, uniqueUsers: 14190, bounceRate: 38, conversions: 1124, avgDuration: 198, source: "Direct", lat: -33.9249, lng: 18.4241 },
  { country: "Ethiopia", region: "East Africa", countryCode: "ET", visits: 15640, uniqueUsers: 11730, bounceRate: 42, conversions: 876, avgDuration: 175, source: "Referral", lat: 9.0054, lng: 38.7636 },
  { country: "Nigeria", region: "West Africa", countryCode: "NG", visits: 12450, uniqueUsers: 9338, bounceRate: 45, conversions: 623, avgDuration: 156, source: "Social", lat: 6.5244, lng: 3.3792 },
  { country: "Tanzania", region: "East Africa", countryCode: "TZ", visits: 11280, uniqueUsers: 8460, bounceRate: 35, conversions: 712, avgDuration: 221, source: "Organic", lat: -6.1630, lng: 35.7516 },
  { country: "Netherlands", region: "Europe", countryCode: "NL", visits: 9870, uniqueUsers: 7403, bounceRate: 28, conversions: 892, avgDuration: 312, source: "Direct", lat: 52.3676, lng: 4.9041 },
  { country: "Uganda", region: "East Africa", countryCode: "UG", visits: 8950, uniqueUsers: 6713, bounceRate: 40, conversions: 534, avgDuration: 188, source: "Organic", lat: 0.3136, lng: 32.5811 },
  { country: "Ghana", region: "West Africa", countryCode: "GH", visits: 7620, uniqueUsers: 5715, bounceRate: 48, conversions: 381, avgDuration: 142, source: "Social", lat: 5.6037, lng: -0.1870 },
  { country: "Egypt", region: "North Africa", countryCode: "EG", visits: 6890, uniqueUsers: 5168, bounceRate: 52, conversions: 276, avgDuration: 125, source: "Paid", lat: 30.0444, lng: 31.2357 },
  { country: "Morocco", region: "North Africa", countryCode: "MA", visits: 5420, uniqueUsers: 4065, bounceRate: 55, conversions: 189, avgDuration: 118, source: "Paid", lat: 33.9716, lng: -6.8498 },
  { country: "United Kingdom", region: "Europe", countryCode: "GB", visits: 5180, uniqueUsers: 3885, bounceRate: 30, conversions: 467, avgDuration: 285, source: "Referral", lat: 51.5072, lng: -0.1276 },
  { country: "Germany", region: "Europe", countryCode: "DE", visits: 4820, uniqueUsers: 3615, bounceRate: 32, conversions: 410, avgDuration: 268, source: "Direct", lat: 52.5200, lng: 13.4050 },
  { country: "United States", region: "Americas", countryCode: "US", visits: 4560, uniqueUsers: 3420, bounceRate: 35, conversions: 365, avgDuration: 242, source: "Organic", lat: 38.8951, lng: -77.0364 },
  { country: "UAE", region: "Middle East", countryCode: "AE", visits: 3890, uniqueUsers: 2918, bounceRate: 38, conversions: 312, avgDuration: 225, source: "Direct", lat: 25.2048, lng: 55.2708 },
  { country: "India", region: "Asia", countryCode: "IN", visits: 3240, uniqueUsers: 2430, bounceRate: 58, conversions: 145, avgDuration: 95, source: "Organic", lat: 20.5937, lng: 78.9629 },
  { country: "China", region: "Asia", countryCode: "CN", visits: 2980, uniqueUsers: 2235, bounceRate: 62, conversions: 119, avgDuration: 88, source: "Referral", lat: 35.8617, lng: 104.1954 },
  { country: "Rwanda", region: "East Africa", countryCode: "RW", visits: 2450, uniqueUsers: 1838, bounceRate: 36, conversions: 172, avgDuration: 198, source: "Organic", lat: -1.9403, lng: 29.8739 },
  { country: "Zambia", region: "Southern Africa", countryCode: "ZM", visits: 2180, uniqueUsers: 1635, bounceRate: 44, conversions: 131, avgDuration: 165, source: "Referral", lat: -15.3875, lng: 28.3228 },
]

// Top pages performance
export const mockPagePerformance: PagePerformance[] = [
  { page: "/", views: 45620, uniqueViews: 38277, avgTimeOnPage: 45, bounceRate: 42, exitRate: 28 },
  { page: "/exhibitors", views: 32450, uniqueViews: 27258, avgTimeOnPage: 125, bounceRate: 35, exitRate: 22 },
  { page: "/tickets", views: 28920, uniqueViews: 24293, avgTimeOnPage: 180, bounceRate: 48, exitRate: 45 },
  { page: "/about", views: 18760, uniqueViews: 15758, avgTimeOnPage: 95, bounceRate: 38, exitRate: 32 },
  { page: "/venue", views: 15430, uniqueViews: 12961, avgTimeOnPage: 78, bounceRate: 40, exitRate: 35 },
  { page: "/sponsors", views: 12890, uniqueViews: 10828, avgTimeOnPage: 65, bounceRate: 45, exitRate: 40 },
  { page: "/contact", views: 9870, uniqueViews: 8291, avgTimeOnPage: 55, bounceRate: 52, exitRate: 48 },
  { page: "/apply", views: 8540, uniqueViews: 7174, avgTimeOnPage: 240, bounceRate: 28, exitRate: 65 },
  { page: "/news", views: 6230, uniqueViews: 5233, avgTimeOnPage: 110, bounceRate: 55, exitRate: 38 },
  { page: "/resources", views: 4890, uniqueViews: 4108, avgTimeOnPage: 145, bounceRate: 42, exitRate: 35 },
]

// Traffic sources breakdown
export const mockTrafficSources: TrafficSource[] = [
  { source: "Organic", visits: 68420, percentage: 42, conversions: 4789 },
  { source: "Direct", visits: 48960, percentage: 30, conversions: 3917 },
  { source: "Referral", visits: 22840, percentage: 14, conversions: 1599 },
  { source: "Social", visits: 16280, percentage: 10, conversions: 977 },
  { source: "Paid", visits: 6500, percentage: 4, conversions: 520 },
]

// AI-generated insights
export const mockAIInsights: AIInsight[] = [
  {
    id: "insight-1",
    type: "warning",
    title: "Low Traffic from West Africa",
    description: "Traffic from Nigeria and Ghana is 35% below regional average. Consider targeted LinkedIn campaigns in these markets.",
    action: "Create Targeted Campaign",
    region: "West Africa",
  },
  {
    id: "insight-2",
    type: "opportunity",
    title: "High Bounce on Tickets Page",
    description: "The tickets page has a 48% bounce rate, higher than average. UX improvements like clearer pricing and simplified checkout could increase conversions.",
    action: "View Page Analytics",
    metric: "48% bounce rate",
  },
  {
    id: "insight-3",
    type: "success",
    title: "Strong European Engagement",
    description: "Visitors from Netherlands and UK show 2.5x higher conversion rates. Consider expanding European marketing efforts.",
    region: "Europe",
  },
  {
    id: "insight-4",
    type: "warning",
    title: "Mobile Conversion Gap",
    description: "Mobile users convert 40% less than desktop users. Mobile UX optimization recommended.",
    metric: "40% lower conversion",
  },
  {
    id: "insight-5",
    type: "opportunity",
    title: "Peak Traffic Hours",
    description: "Highest traffic occurs between 10AM-2PM EAT. Schedule social posts and email campaigns during these hours for maximum reach.",
    action: "Schedule Campaign",
  },
]

// Heatmap data for peak hours (hour x day of week matrix)
export const mockHeatmapData: number[][] = [
  // Sun, Mon, Tue, Wed, Thu, Fri, Sat (rows) x 24 hours (cols)
  [120, 85, 72, 65, 58, 52, 48, 55, 95, 180, 245, 320, 380, 350, 290, 245, 210, 185, 165, 150, 142, 138, 135, 128], // Sun
  [95, 68, 52, 45, 42, 55, 125, 285, 420, 580, 695, 780, 820, 750, 685, 620, 548, 465, 385, 320, 265, 215, 175, 135], // Mon
  [92, 65, 48, 42, 40, 52, 118, 275, 412, 568, 682, 768, 812, 745, 678, 615, 542, 458, 378, 315, 258, 208, 168, 128], // Tue
  [98, 70, 52, 45, 42, 58, 128, 292, 438, 595, 712, 798, 845, 778, 712, 648, 572, 485, 398, 332, 275, 225, 182, 142], // Wed
  [95, 68, 50, 44, 41, 55, 122, 282, 425, 582, 698, 785, 828, 762, 695, 632, 558, 472, 388, 322, 268, 218, 178, 138], // Thu
  [88, 62, 45, 40, 38, 48, 108, 255, 385, 528, 638, 718, 762, 698, 638, 578, 508, 428, 352, 292, 242, 195, 158, 122], // Fri
  [135, 98, 82, 72, 65, 58, 52, 62, 108, 195, 268, 348, 412, 382, 318, 268, 228, 202, 180, 165, 155, 148, 145, 140], // Sat
]

// Analytics settings
export interface AnalyticsSettings {
  ga4ApiKey?: string
  refreshInterval: number // minutes
  alertThresholds: {
    bounceRate: number
    conversionDropPercent: number
  }
  customKPIs: string[]
  chartPreferences: {
    defaultChartType: "line" | "bar" | "area"
    colorScheme: string[]
  }
}

export const mockAnalyticsSettings: AnalyticsSettings = {
  refreshInterval: 15,
  alertThresholds: {
    bounceRate: 50,
    conversionDropPercent: 20,
  },
  customKPIs: ["Exhibitor Applications", "Ticket Revenue", "Sponsor Inquiries"],
  chartPreferences: {
    defaultChartType: "area",
    colorScheme: ["#2E7D32", "#8B4513", "#1565C0", "#F57C00", "#7B1FA2"],
  },
}
