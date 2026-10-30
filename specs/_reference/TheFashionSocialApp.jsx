import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Ticket,
  ShieldCheck,
  QrCode,
  Mail,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  Building2,
  CreditCard,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Lock,
  Eye,
  Edit3,
  Send,
  Award,
  GlassWater,
  Mic2,
  Shirt,
  ArrowRight,
  Check,
  Info,
  LogOut,
  Sliders,
  FileText,
  UserCheck,
  Smartphone,
  Download,
  Copy
} from 'lucide-react';

// --- INITIAL DATA & PRD CONFIGURATIONS ---

const INITIAL_CATEGORIES = [
  {
    id: 'cat-regular',
    name: 'Regular',
    tagline: 'General Admission & Showcase Access',
    price: 15000,
    totalInventory: 2000,
    sold: 1140,
    status: 'OPEN',
    badgeColor: 'border-zinc-500 text-zinc-200 bg-zinc-900/80',
    accent: '#A1A1AA',
    benefits: [
      'General admission to The Fashion Social',
      'Full access to Runway Showcases & Brand Pop-ups',
      'Live Headline Comedy performances',
      'Access to social networking & shopping zones'
    ],
    disclaimer: null
  },
  {
    id: 'cat-vip',
    name: 'VIP',
    tagline: 'Enhanced Experience & Lounge Seating',
    price: 45000,
    totalInventory: 650,
    sold: 412,
    status: 'OPEN',
    badgeColor: 'border-[#C5A059] text-[#F3E5AB] bg-[#C5A059]/10',
    accent: '#C5A059',
    benefits: [
      'Fast-track priority red carpet entry',
      'Designated VIP Lounge seating area',
      'Complimentary signature welcome cocktail',
      'Priority access to designer exhibition booths',
      'Digital event lookbook & souvenir badge'
    ],
    disclaimer: 'Subject to final venue seating plan.'
  },
  {
    id: 'cat-vvip',
    name: 'VVIP',
    tagline: 'Front-Row Luxury & Table Service',
    price: 120000,
    totalInventory: 250,
    sold: 188,
    status: 'OPEN',
    badgeColor: 'border-[#D4AF37] text-[#0A0A0A] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059]',
    accent: '#D4AF37',
    benefits: [
      'Prime front-row proximity to Runway & Comedy Stage',
      'Reserved luxury table seating with dedicated host service',
      'Premium bottle & artisanal platter inclusion',
      'Exclusive VVIP Backstage & Red Carpet Lounge access',
      'Dedicated valet & private security escort lane'
    ],
    disclaimer: 'Exclusive seating arrangements subject to final event plan.'
  },
  {
    id: 'cat-celeb',
    name: 'Sit with Influencers & Celebrities',
    tagline: 'Ultra-Exclusive Curated Table Experience',
    price: 250000,
    totalInventory: 100,
    sold: 76,
    status: 'OPEN',
    badgeColor: 'border-amber-300 text-amber-200 bg-gradient-to-r from-amber-950/90 via-yellow-900/60 to-amber-950/90',
    accent: '#FDE68A',
    benefits: [
      'Shared ultra-luxury table with designated Influencers & Celebrities',
      'All-inclusive top-shelf champagne & gourmet hospitality',
      'Professional red-carpet portrait session with media coverage',
      'Private meet-and-greet mixer with headline comedians & designers',
      'Bespoke luxury gift bag from partner fashion houses'
    ],
    disclaimer:
      'MANDATORY DISCLOSURE: Subject to confirmed arrangements and availability. Seating beside a specific named personality is not guaranteed unless confirmed in writing by NIYASA.'
  }
];

const INITIAL_INSTITUTIONS = [
  { id: 'inst-uniben', name: 'University of Benin (UNIBEN)', type: 'Federal University', location: 'Benin City, Edo State', active: true },
  { id: 'inst-biu', name: 'Benson Idahosa University (BIU)', type: 'Private University', location: 'Benin City, Edo State', active: true },
  { id: 'inst-aau', name: 'Ambrose Alli University (AAU)', type: 'State University', location: 'Ekpoma, Edo State', active: true },
  { id: 'inst-iuo', name: 'Igbinedion University, Okada (IUO)', type: 'Private University', location: 'Okada, Edo State', active: true },
  { id: 'inst-edsu', name: 'Edo State University, Uzairue (EDSU)', type: 'State University', location: 'Uzairue, Edo State', active: true },
  { id: 'inst-wellspring', name: 'Wellspring University', type: 'Private University', location: 'Benin City, Edo State', active: true },
  { id: 'inst-mudiame', name: 'Mudiame University', type: 'Private University', location: 'Irrua, Edo State', active: true }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    orderRef: 'TFS-ORD-90821',
    ticketNumber: 'TFS-2026-VVIP-4821',
    qrToken: 'TFS_SIG_90821_VVIP_4821_VERIFIED',
    buyerName: 'Osasere Igbinovia',
    email: 'osasere.i@uniben.edu',
    phone: '+234 803 491 0291',
    institution: 'University of Benin (UNIBEN)',
    categoryId: 'cat-vvip',
    categoryName: 'VVIP',
    quantity: 1,
    unitPrice: 120000,
    totalPaid: 120000,
    paymentStatus: 'PAID',
    paymentRef: 'PSK_88392019482',
    ticketStatus: 'UNUSED',
    scannedAt: null,
    scannedBy: null,
    paidAt: '2026-10-23 14:22 WAT',
    emailStatus: 'DELIVERED',
    emailRetries: 0
  },
  {
    id: 'ord-1002',
    orderRef: 'TFS-ORD-90822',
    ticketNumber: 'TFS-2026-CELEB-1094',
    qrToken: 'TFS_SIG_90822_CELEB_1094_VERIFIED',
    buyerName: 'Ehiaghe Obaseki',
    email: 'ehi.obaseki@biu.edu.ng',
    phone: '+234 812 883 7100',
    institution: 'Benson Idahosa University (BIU)',
    categoryId: 'cat-celeb',
    categoryName: 'Sit with Influencers & Celebrities',
    quantity: 1,
    unitPrice: 250000,
    totalPaid: 250000,
    paymentStatus: 'PAID',
    paymentRef: 'PSK_88392019910',
    ticketStatus: 'USED',
    scannedAt: '2026-10-23 18:05 WAT',
    scannedBy: 'Gate-Staff-02 (A. Erediauwa)',
    paidAt: '2026-10-23 15:10 WAT',
    emailStatus: 'DELIVERED',
    emailRetries: 1
  },
  {
    id: 'ord-1003',
    orderRef: 'TFS-ORD-90823',
    ticketNumber: 'TFS-2026-VIP-7731',
    qrToken: 'TFS_SIG_90823_VIP_7731_VERIFIED',
    buyerName: 'Nosa Akenzua',
    email: 'nosa.akenzua@gmail.com',
    phone: '+234 706 112 9400',
    institution: 'Ambrose Alli University (AAU)',
    categoryId: 'cat-vip',
    categoryName: 'VIP',
    quantity: 2,
    unitPrice: 45000,
    totalPaid: 90000,
    paymentStatus: 'PAID',
    paymentRef: 'PSK_88392020115',
    ticketStatus: 'UNUSED',
    scannedAt: null,
    scannedBy: null,
    paidAt: '2026-10-23 16:40 WAT',
    emailStatus: 'DELIVERED',
    emailRetries: 0
  },
  {
    id: 'ord-1004',
    orderRef: 'TFS-ORD-90824',
    ticketNumber: 'TFS-2026-REG-3390',
    qrToken: 'TFS_SIG_90824_REG_3390_VERIFIED',
    buyerName: 'adesuwa.omokaro@iuokada.edu.ng',
    buyerNameDisplay: 'Adesuwa Omokaro',
    email: 'adesuwa.omokaro@iuokada.edu.ng',
    phone: '+234 902 554 1289',
    institution: 'Igbinedion University, Okada (IUO)',
    categoryId: 'cat-regular',
    categoryName: 'Regular',
    quantity: 3,
    unitPrice: 15000,
    totalPaid: 45000,
    paymentStatus: 'PAID',
    paymentRef: 'PSK_88392020499',
    ticketStatus: 'UNUSED',
    scannedAt: null,
    scannedBy: null,
    paidAt: '2026-10-23 17:15 WAT',
    emailStatus: 'DELIVERED',
    emailRetries: 0
  },
  {
    id: 'ord-1005',
    orderRef: 'TFS-ORD-90825',
    ticketNumber: 'TFS-2026-VIP-0019',
    qrToken: 'TFS_SIG_90825_VIP_0019_REVOKED',
    buyerName: 'Kelvin Osunde',
    email: 'kelvin.osunde@edsu.edu.ng',
    phone: '+234 809 332 8172',
    institution: 'Edo State University, Uzairue (EDSU)',
    categoryId: 'cat-vip',
    categoryName: 'VIP',
    quantity: 1,
    unitPrice: 45000,
    totalPaid: 45000,
    paymentStatus: 'REFUNDED',
    paymentRef: 'PSK_88392020811',
    ticketStatus: 'REFUNDED',
    scannedAt: null,
    scannedBy: null,
    paidAt: '2026-10-23 12:05 WAT',
    emailStatus: 'DELIVERED',
    emailRetries: 0
  }
];

const INITIAL_AUDIT_LOGS = [
  { id: 'aud-1', time: '18:05 WAT', actor: 'Gate-Staff-02', action: 'CHECK_IN_SCAN', detail: 'Ticket TFS-2026-CELEB-1094 marked USED atomically' },
  { id: 'aud-2', time: '17:15 WAT', actor: 'SYSTEM_WEBHOOK', action: 'PAYMENT_VERIFIED', detail: 'Paystack webhook verified PSK_88392020499 (₦45,000)' },
  { id: 'aud-3', time: '16:41 WAT', actor: 'RESEND_SERVICE', action: 'EMAIL_DISPATCHED', detail: 'Customer Ticket + NIYASA Official Sale Alert sent for TFS-ORD-90823' },
  { id: 'aud-4', time: '13:20 WAT', actor: 'Admin (NIYASA Lead)', action: 'INVENTORY_SYNC', detail: 'Verified 3,000 guest planning allocation across 4 tiers' }
];

// Format currency in NGN
const formatNGN = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
};

// Custom SVG QR Code Generator (Deterministic visual pattern based on string seed)
const LuxuryQRCode = ({ value, size = 168 }) => {
  const grid = useMemo(() => {
    const cells = 21;
    const matrix = Array(cells)
      .fill(0)
      .map(() => Array(cells).fill(false));

    // Finder patterns (3 corners)
    const drawFinder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[r0 + r][c0 + c] = true;
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, cells - 7);
    drawFinder(cells - 7, 0);

    // Seed hash from value
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c >= cells - 8) ||
          (r >= cells - 8 && c < 8);
        if (!inFinder) {
          const bit = ((hash >> ((r * cells + c) % 24)) ^ (r * 7 + c * 13)) & 1;
          matrix[r][c] = Boolean(bit);
        }
      }
    }
    return matrix;
  }, [value]);

  const cellSize = size / 21;

  return (
    <div className="p-3 bg-[#FAFAFA] rounded-xl border-2 border-[#D4AF37] shadow-inner inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#FAFAFA" />
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx * cellSize}
                y={rIdx * cellSize}
                width={cellSize + 0.3}
                height={cellSize + 0.3}
                fill="#0A0A0A"
                rx={1}
              />
            ) : null
          )
        )}
        {/* Center NIYASA Monogram Emblem */}
        <rect
          x={size / 2 - 18}
          y={size / 2 - 18}
          width={36}
          height={36}
          rx={6}
          fill="#0A0A0A"
          stroke="#D4AF37"
          strokeWidth="2"
        />
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          fill="#D4AF37"
          fontSize="10"
          fontWeight="bold"
          fontFamily="serif"
        >
          TFS
        </text>
      </svg>
    </div>
  );
};

export default function App() {
  // Navigation Mode: 'landing' | 'checkout' | 'ticket' | 'admin'
  const [activeView, setActiveView] = useState('landing');

  // Shared Application State
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [institutions, setInstitutions] = useState(INITIAL_INSTITUTIONS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Selected Ticket & Checkout State
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat-vip');
  const [quantity, setQuantity] = useState(1);
  const [holdSeconds, setHoldSeconds] = useState(600); // 10:00 atomic hold timer
  const [buyerName, setBuyerName] = useState('Osaze Omoregie');
  const [buyerEmail, setBuyerEmail] = useState('osaze.omoregie@uniben.edu');
  const [buyerPhone, setBuyerPhone] = useState('+234 805 219 4401');
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('University of Benin (UNIBEN)');
  const [isCustomInstitution, setIsCustomInstitution] = useState(false);
  const [customInstitutionName, setCustomInstitutionName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [checkoutError, setCheckoutError] = useState('');

  // Simulated Paystack Modal & Verification State
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [paymentSimState, setPaymentSimState] = useState('IDLE'); // 'IDLE' | 'PROCESSING' | 'PENDING_UNVERIFIED' | 'FAILED' | 'VERIFIED'
  const [pendingOrderDraft, setPendingOrderDraft] = useState(null);

  // Active Ticket for "My Ticket" View
  const [activeTicketOrder, setActiveTicketOrder] = useState(INITIAL_ORDERS[0]);
  const [emailModalType, setEmailModalType] = useState(null); // 'CUSTOMER' | 'ORGANISER' | null

  // Admin Dashboard State
  const [adminRole, setAdminRole] = useState('ADMIN'); // 'ADMIN' | 'STAFF' | 'FINANCE'
  const [adminSubTab, setAdminSubTab] = useState('overview'); // 'overview' | 'orders' | 'institutions' | 'categories' | 'scanner'
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [scannerInput, setScannerInput] = useState('TFS-2026-VVIP-4821');
  const [scanResult, setScanResult] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'gold') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Countdown timer for Inventory Hold in Checkout
  useEffect(() => {
    if (activeView !== 'checkout') return;
    const timer = setInterval(() => {
      setHoldSeconds((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeView]);

  // Enforce Least Privilege Role Switching (FR-13)
  useEffect(() => {
    if (adminRole === 'STAFF') {
      setAdminSubTab('scanner');
    } else if (adminRole === 'FINANCE' && (adminSubTab === 'categories' || adminSubTab === 'scanner')) {
      setAdminSubTab('overview');
    }
  }, [adminRole]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || categories[0],
    [categories, selectedCategoryId]
  );

  const filteredInstitutions = useMemo(() => {
    if (!institutionQuery.trim()) return institutions;
    return institutions.filter(
      (i) =>
        i.name.toLowerCase().includes(institutionQuery.toLowerCase()) ||
        i.location.toLowerCase().includes(institutionQuery.toLowerCase())
    );
  }, [institutions, institutionQuery]);

  // Computed Admin Metrics
  const metrics = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalPaid, 0);
    const dynamicTicketsSold = categories.reduce((acc, c) => acc + c.sold, 0);
    const totalCapacity = categories.reduce((acc, c) => acc + c.totalInventory, 0);
    const scannedCount = orders.filter((o) => o.ticketStatus === 'USED').length;
    return {
      totalRevenue,
      dynamicTicketsSold,
      totalCapacity,
      scannedCount,
      paidOrderCount: paidOrders.length
    };
  }, [orders, categories]);

  // Institution Breakdown Calculation
  const institutionStats = useMemo(() => {
    const map = {};
    institutions.forEach((inst) => {
      map[inst.name] = { name: inst.name, tickets: 0, revenue: 0, orders: 0 };
    });

    // Seed baseline visual numbers + live orders
    const baseline = {
      'University of Benin (UNIBEN)': { tickets: 690, revenue: 28450000 },
      'Benson Idahosa University (BIU)': { tickets: 420, revenue: 24100000 },
      'Ambrose Alli University (AAU)': { tickets: 280, revenue: 9800000 },
      'Igbinedion University, Okada (IUO)': { tickets: 215, revenue: 15200000 },
      'Edo State University, Uzairue (EDSU)': { tickets: 120, revenue: 5400000 },
      'Wellspring University': { tickets: 61, revenue: 2150000 },
      'Mudiame University': { tickets: 30, revenue: 1100000 }
    };

    Object.keys(baseline).forEach((k) => {
      if (map[k]) {
        map[k].tickets += baseline[k].tickets;
        map[k].revenue += baseline[k].revenue;
      }
    });

    orders
      .filter((o) => o.paymentStatus === 'PAID')
      .forEach((o) => {
        if (!map[o.institution]) {
          map[o.institution] = { name: o.institution, tickets: 0, revenue: 0, orders: 0 };
        }
        map[o.institution].tickets += o.quantity;
        map[o.institution].revenue += o.totalPaid;
        map[o.institution].orders += 1;
      });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders, institutions]);

  // --- HANDLERS ---

  const handleSelectTierFromLanding = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setQuantity(1);
    setHoldSeconds(600);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiateCheckout = (e) => {
    e.preventDefault();
    setCheckoutError('');

    const finalInstitution = isCustomInstitution ? customInstitutionName.trim() : selectedInstitution;

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setCheckoutError('Please complete your full name, email address, and Nigerian phone number.');
      return;
    }
    if (!finalInstitution) {
      setCheckoutError('Please select your institution or specify your school name.');
      return;
    }
    if (!acceptedTerms) {
      setCheckoutError('You must acknowledge the Event Terms, Refund Policy, and NDPA Privacy Notice.');
      return;
    }

    const remaining = selectedCategory.totalInventory - selectedCategory.sold;
    if (quantity > remaining) {
      setCheckoutError(`Only ${remaining} tickets remaining in this category.`);
      return;
    }

    const draftOrder = {
      orderRef: `TFS-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      buyerName: buyerName.trim(),
      email: buyerEmail.trim(),
      phone: buyerPhone.trim(),
      institution: finalInstitution,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      quantity,
      unitPrice: selectedCategory.price,
      totalPaid: selectedCategory.price * quantity
    };

    setPendingOrderDraft(draftOrder);
    setPaymentSimState('IDLE');
    setPaystackModalOpen(true);
  };

  // Simulated Server-Side Payment Webhook & Ticket Issuance (FR-05, FR-06, FR-07, FR-08)
  const handleSimulatePaystackOutcome = (outcome) => {
    setPaymentSimState('PROCESSING');

    setTimeout(() => {
      if (outcome === 'PENDING') {
        setPaymentSimState('PENDING_UNVERIFIED');
        showToast('Payment is pending bank confirmation. No valid ticket issued yet (FR-05).', 'amber');
        return;
      }

      if (outcome === 'FAILED') {
        setPaymentSimState('FAILED');
        showToast('Transaction declined or abandoned. Inventory reservation released.', 'red');
        return;
      }

      // VERIFIED SERVER-SIDE SUCCESS
      const codePrefix =
        pendingOrderDraft.categoryName === 'Regular'
          ? 'REG'
          : pendingOrderDraft.categoryName === 'VIP'
          ? 'VIP'
          : pendingOrderDraft.categoryName === 'VVIP'
          ? 'VVIP'
          : 'CELEB';

      const randomNum = Math.floor(1000 + Math.random() * 8999);
      const ticketNumber = `TFS-2026-${codePrefix}-${randomNum}`;
      const paymentRef = `PSK_${Math.floor(10000000000 + Math.random() * 89999999999)}`;

      const newVerifiedOrder = {
        id: `ord-${Date.now()}`,
        ...pendingOrderDraft,
        ticketNumber,
        qrToken: `TFS_SIG_${pendingOrderDraft.orderRef}_${ticketNumber}_VERIFIED`,
        paymentStatus: 'PAID',
        paymentRef,
        ticketStatus: 'UNUSED',
        scannedAt: null,
        scannedBy: null,
        paidAt: '2026-10-23 22:04 WAT',
        emailStatus: 'DELIVERED',
        emailRetries: 0
      };

      // If custom institution was entered, add it to directory for consistent reporting
      if (
        isCustomInstitution &&
        customInstitutionName.trim() &&
        !institutions.some((i) => i.name.toLowerCase() === customInstitutionName.trim().toLowerCase())
      ) {
        setInstitutions((prev) => [
          ...prev,
          {
            id: `inst-custom-${Date.now()}`,
            name: customInstitutionName.trim(),
            type: 'Added via Checkout',
            location: 'Nigeria',
            active: true
          }
        ]);
      }

      // Commit inventory atomically
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === pendingOrderDraft.categoryId
            ? { ...cat, sold: cat.sold + pendingOrderDraft.quantity }
            : cat
        )
      );

      setOrders((prev) => [newVerifiedOrder, ...prev]);
      setActiveTicketOrder(newVerifiedOrder);
      setScannerInput(ticketNumber); // Pre-fill scanner so user can test scanning their new ticket right away!

      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          time: '22:04 WAT',
          actor: 'PAYSTACK_WEBHOOK',
          action: 'ORDER_PAID_ISSUED',
          detail: `Verified ${paymentRef} (${formatNGN(newVerifiedOrder.totalPaid)}). Issued ${ticketNumber} & sent Resend emails.`
        },
        ...prev
      ]);

      setPaymentSimState('VERIFIED');
      setTimeout(() => {
        setPaystackModalOpen(false);
        setActiveView('ticket');
        showToast(`Payment verified! Ticket ${ticketNumber} issued & emailed.`, 'gold');
      }, 900);
    }, 900);
  };

  // Admin: Resend Ticket Email without duplicating ticket or charge (FR-10)
  const handleResendTicketEmail = (order) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, emailStatus: 'DELIVERED', emailRetries: (o.emailRetries || 0) + 1 }
          : o
      )
    );
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        time: '22:05 WAT',
        actor: `Admin (${adminRole})`,
        action: 'TICKET_RESEND',
        detail: `Re-dispatched existing ticket ${order.ticketNumber} to ${order.email} (Idempotent: No new charge)`
      },
      ...prev
    ]);
    showToast(`Ticket ${order.ticketNumber} resent to ${order.email} via Resend.`, 'gold');
  };

  // Gate Check-In QR Verification (FR-12)
  const handleVerifyTicketAtGate = (queryTicketStr) => {
    const cleanInput = (queryTicketStr || scannerInput).trim().toUpperCase();
    if (!cleanInput) return;

    const matchedOrder = orders.find(
      (o) =>
        o.ticketNumber.toUpperCase() === cleanInput ||
        o.qrToken.toUpperCase() === cleanInput ||
        o.orderRef.toUpperCase() === cleanInput
    );

    if (!matchedOrder) {
      setScanResult({
        outcome: 'INVALID',
        title: 'INVALID / UNKNOWN TICKET — DO NOT ADMIT',
        message: `No verified ticket record matches "${cleanInput}". Verify guest payment receipt or escalate to Box Office.`,
        order: null
      });
      return;
    }

    if (matchedOrder.paymentStatus !== 'PAID' || matchedOrder.ticketStatus === 'REFUNDED') {
      setScanResult({
        outcome: 'REFUNDED',
        title: 'CANCELLED OR REFUNDED TICKET — REJECT ENTRY',
        message: `Ticket ${matchedOrder.ticketNumber} has status "${matchedOrder.paymentStatus}". Entry is strictly prohibited (Section 7).`,
        order: matchedOrder
      });
      return;
    }

    if (matchedOrder.ticketStatus === 'USED') {
      setScanResult({
        outcome: 'DUPLICATE',
        title: 'DUPLICATE SCAN ALERT — ALREADY USED',
        message: `This ticket was already scanned and admitted at ${matchedOrder.scannedAt} by ${matchedOrder.scannedBy}. Do not admit a second time.`,
        order: matchedOrder
      });
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          time: '22:06 WAT',
          actor: `Gate (${adminRole})`,
          action: 'DUPLICATE_SCAN_BLOCKED',
          detail: `Blocked second scan attempt on ${matchedOrder.ticketNumber}`
        },
        ...prev
      ]);
      return;
    }

    // First scan: Atomically mark as USED
    const timestamp = '2026-10-23 22:06 WAT';
    const staffLabel = adminRole === 'STAFF' ? 'Check-In Staff #04' : 'Event Administrator';

    const updatedOrder = {
      ...matchedOrder,
      ticketStatus: 'USED',
      scannedAt: timestamp,
      scannedBy: staffLabel
    };

    setOrders((prev) => prev.map((o) => (o.id === matchedOrder.id ? updatedOrder : o)));
    if (activeTicketOrder?.id === matchedOrder.id) {
      setActiveTicketOrder(updatedOrder);
    }

    setScanResult({
      outcome: 'VALID',
      title: 'VALID UNUSED TICKET — ADMIT GUEST',
      message: `Ticket ${matchedOrder.ticketNumber} atomically marked as USED at ${timestamp}. Welcome guest to the ${matchedOrder.categoryName} section!`,
      order: updatedOrder
    });

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        time: '22:06 WAT',
        actor: staffLabel,
        action: 'CHECK_IN_ACCEPTED',
        detail: `Admitted ${matchedOrder.buyerName} (${matchedOrder.ticketNumber} • ${matchedOrder.categoryName})`
      },
      ...prev
    ]);
  };

  // Save edited category price/inventory (Admin only)
  const handleSaveCategoryEdit = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? editingCategory : c))
    );
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        time: '22:07 WAT',
        actor: 'Event Administrator',
        action: 'CATEGORY_UPDATED',
        detail: `Updated ${editingCategory.name}: Price ${formatNGN(editingCategory.price)}, Capacity ${editingCategory.totalInventory}`
      },
      ...prev
    ]);
    showToast(`Updated ${editingCategory.name} tier configuration.`, 'gold');
    setEditingCategory(null);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans selection:bg-[#D4AF37] selection:text-[#0A0A0A]">
      {/* Google Fonts Injection for High-Fashion Editorial Serif */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-editorial {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .gold-shimmer {
          background: linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #C5A059 100%);
        }
        .gold-text {
          background: linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #C5A059 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* TOP PROTOTYPE SWITCHER & BRAND HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0A]/90 border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
            {/* Brand Identity */}
            <div
              onClick={() => setActiveView('landing')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg gold-shimmer flex items-center justify-center text-[#0A0A0A] font-editorial font-bold text-xl shadow-lg shadow-[#D4AF37]/20">
                FS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                    NIYASA PRESENTS
                  </span>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30">
                    Benin City, Edo State
                  </span>
                </div>
                <h1 className="font-editorial text-xl sm:text-2xl font-bold tracking-wide text-[#FAFAFA] group-hover:text-[#F3E5AB] transition-colors">
                  THE FASHION SOCIAL
                </h1>
              </div>
            </div>

            {/* Interactive Prototype View Switcher */}
            <nav
              aria-label="Prototype View Switcher"
              className="flex items-center gap-1.5 bg-[#121212] p-1.5 rounded-xl border border-zinc-800 overflow-x-auto"
            >
              <button
                onClick={() => setActiveView('landing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeView === 'landing'
                    ? 'gold-shimmer text-[#0A0A0A] font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Event Showcase</span>
              </button>

              <button
                onClick={() => setActiveView('checkout')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeView === 'checkout'
                    ? 'gold-shimmer text-[#0A0A0A] font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>2. Tickets & Checkout</span>
              </button>

              <button
                onClick={() => setActiveView('ticket')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeView === 'ticket'
                    ? 'gold-shimmer text-[#0A0A0A] font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>3. My Digital Ticket</span>
              </button>

              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeView === 'admin'
                    ? 'gold-shimmer text-[#0A0A0A] font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>4. Admin & Gate Scanner</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* FLOATING TOAST ALERT */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              toast.type === 'red'
                ? 'bg-red-950/95 border-red-500/50 text-red-100'
                : toast.type === 'amber'
                ? 'bg-amber-950/95 border-amber-500/50 text-amber-100'
                : 'bg-[#121212]/95 border-[#D4AF37] text-[#F3E5AB]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 1: PUBLIC LANDING PAGE & LUXURY EVENT SHOWCASE
         ===================================================================== */}
      {activeView === 'landing' && (
        <main className="pb-20">
          {/* HERO SECTION */}
          <section className="relative overflow-hidden border-b border-[#D4AF37]/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#241C0C] via-[#0A0A0A] to-[#0A0A0A] pt-12 pb-20 sm:py-24">
            {/* Subtle Editorial Grid Lines */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs tracking-[0.2em] uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>NIYASA PRESENTS • BENIN CITY, EDO STATE</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-editorial text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
                      THE FASHION <span className="gold-text italic font-normal">SOCIAL</span>
                    </h2>
                    <p className="font-editorial italic text-2xl sm:text-3xl text-[#F3E5AB]/90">
                      “Style Meets Laughter”
                    </p>
                  </div>

                  <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    An ultra-luxury convergence of couture runway artistry, headline live comedy,
                    artisanal cocktails, and high-society networking in the heart of Benin City.
                    Designed for campus icons, young executives, designers, and cultural tastemakers.
                  </p>

                  {/* Key Event Metadata Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#121212]/90 border border-zinc-800 flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0" />
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-zinc-400">Location</div>
                        <div className="text-sm font-semibold text-white">Benin City, Edo State</div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#121212]/90 border border-zinc-800 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#D4AF37] shrink-0" />
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-zinc-400">Edition Target</div>
                        <div className="text-sm font-semibold text-white">December 2026 Showcase</div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#121212]/90 border border-zinc-800 flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#D4AF37] shrink-0" />
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-zinc-400">Planned Attendance</div>
                        <div className="text-sm font-semibold text-[#F3E5AB]">3,000 Exclusive Guests</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Actions */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => setActiveView('checkout')}
                      className="gold-shimmer text-[#0A0A0A] font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-wider flex items-center gap-3 shadow-xl shadow-[#D4AF37]/20 hover:opacity-95 transition-all"
                    >
                      <span>Reserve Your Pass</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('ticket-tiers-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-4 rounded-xl border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10 text-sm font-semibold transition-all"
                    >
                      Compare 4 Luxury Tiers
                    </button>
                  </div>
                </div>

                {/* Editorial Lookbook & Live Demand Card */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl bg-gradient-to-b from-[#1A1610] to-[#0E0E0E] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] block">
                          LIVE BOX OFFICE PULSE
                        </span>
                        <h3 className="font-editorial text-2xl font-bold text-white">
                          Edo State Campus & Social Wave
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Sales Open
                      </span>
                    </div>

                    {/* Equal Prominence Visual Pillars */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                          <Shirt className="w-5 h-5" />
                        </div>
                        <div className="font-editorial text-lg font-bold text-white">High Couture</div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Avant-garde runway presentations, red-carpet photography & emerging designer pop-ups.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                          <Mic2 className="w-5 h-5" />
                        </div>
                        <div className="font-editorial text-lg font-bold text-white">Live Comedy</div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Unfiltered rib-cracking sets from Nigeria’s finest comedians & viral creators.
                        </p>
                      </div>
                    </div>

                    {/* Live Inventory Progress */}
                    <div className="space-y-2 bg-[#0A0A0A]/90 p-4 rounded-xl border border-zinc-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Verified Passes Issued</span>
                        <span className="text-[#F3E5AB] font-semibold">
                          {metrics.dynamicTicketsSold.toLocaleString()} / {metrics.totalCapacity.toLocaleString()} Target
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full gold-shimmer rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((metrics.dynamicTicketsSold / metrics.totalCapacity) * 100)
                            )}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                        <span>Top Campus: UNIBEN & BIU</span>
                        <span className="text-[#D4AF37]">Instant QR Email Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EXPERIENCE PILLARS (FASHION + COMEDY EQUAL PROMINENCE) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-zinc-900">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                CURATED EXPERIENCE DIRECTION
              </span>
              <h3 className="font-editorial text-3xl sm:text-5xl font-bold">
                Where Editorial Glamour Meets Unstoppable Laughter
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base">
                Crafted by NIYASA to unite students, young professionals, models, and fashion brands across Edo State.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Shirt,
                  title: 'Runway Showcases',
                  desc: 'High-fashion collections from standout Nigerian streetwear and couture labels on a 60ft lit runway.'
                },
                {
                  icon: Mic2,
                  title: 'Headline Comedy Acts',
                  desc: 'Equal-billing comedy showcases blending satire, campus culture, and high-energy crowd interaction.'
                },
                {
                  icon: GlassWater,
                  title: 'Cocktails & Social Lounge',
                  desc: 'Bespoke mixology bars, champagne tables, and curated networking spaces for creatives and founders.'
                },
                {
                  icon: Award,
                  title: 'Campus & Youth Spotlight',
                  desc: 'Represent UNIBEN, BIU, AAU, IUO, EDSU, Wellspring, Mudiame & beyond on the red carpet.'
                }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#121212] border border-zinc-800/80 hover:border-[#D4AF37]/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-5 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h4 className="font-editorial text-2xl font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FOUR TICKET CATEGORIES SHOWCASE (SECTION 7 PRD) */}
          <section id="ticket-tiers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  SELECT YOUR ACCESS TIER
                </span>
                <h3 className="font-editorial text-3xl sm:text-5xl font-bold mt-1">
                  Four Distinct Luxury Ticket Categories
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                Every verified ticket includes a unique cryptographic QR code dispatched automatically to your email upon server-side payment confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const remaining = cat.totalInventory - cat.sold;
                const percentSold = Math.round((cat.sold / cat.totalInventory) * 100);
                const isSoldOut = remaining <= 0 || cat.status !== 'OPEN';

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl bg-[#121212] border flex flex-col justify-between p-6 transition-all ${
                      cat.id === 'cat-vvip' || cat.id === 'cat-celeb'
                        ? 'border-[#D4AF37]/60 shadow-xl shadow-[#D4AF37]/10'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* Category Badge & Availability */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${cat.badgeColor}`}
                        >
                          {cat.name}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {remaining} left
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mb-4 min-h-[32px]">{cat.tagline}</p>

                      {/* Price Display */}
                      <div className="mb-6 pb-5 border-b border-zinc-800">
                        <div className="text-3xl font-editorial font-bold text-white">
                          {formatNGN(cat.price)}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">
                          Per admitted guest • Unique QR pass
                        </div>
                      </div>

                      {/* Benefits List */}
                      <ul className="space-y-3 mb-6">
                        {cat.benefits.map((benefit, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                            <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Mandatory PRD Section 7 Disclaimer for Celebrity/VIP Tiers */}
                      {cat.disclaimer && (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed mb-6">
                          <span className="font-semibold block text-amber-300 mb-0.5">
                            Organiser Seating Notice:
                          </span>
                          {cat.disclaimer}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Capacity Bar */}
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full gold-shimmer"
                          style={{ width: `${percentSold}%` }}
                        />
                      </div>

                      <button
                        disabled={isSoldOut}
                        onClick={() => handleSelectTierFromLanding(cat.id)}
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isSoldOut
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : cat.id === 'cat-vvip' || cat.id === 'cat-celeb'
                            ? 'gold-shimmer text-[#0A0A0A] hover:opacity-95 shadow-lg shadow-[#D4AF37]/15'
                            : 'bg-white text-[#0A0A0A] hover:bg-[#F3E5AB]'
                        }`}
                      >
                        <span>{isSoldOut ? 'Sold Out' : `Select ${cat.name}`}</span>
                        {!isSoldOut && <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ & SUPPORT POLICIES SECTION */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="rounded-2xl bg-[#121212] border border-zinc-800 p-6 sm:p-10">
              <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                  GUEST INFORMATION & POLICIES
                </span>
                <h3 className="font-editorial text-3xl font-bold mt-1">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 space-y-1.5">
                  <h4 className="font-semibold text-[#F3E5AB]">
                    How do I receive my ticket after paying on Paystack?
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Once our backend verifies your transaction directly with Paystack, your branded digital ticket and unique QR code are automatically emailed to you and displayed on screen.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 space-y-1.5">
                  <h4 className="font-semibold text-[#F3E5AB]">
                    Why do you ask for my University or Institution?
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The Fashion Social unites campuses across Edo State. Institution data is collected solely for event operations, campus representation analytics, and approved promotions under our NDPA Privacy Notice.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 space-y-1.5">
                  <h4 className="font-semibold text-[#F3E5AB]">
                    Can I share my QR code with a friend?
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    No. Every ticket QR token is atomically marked as <code className="text-amber-300">USED</code> on the first scan at the venue gate. Any subsequent scan of the same QR code will be flagged and rejected.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 space-y-1.5">
                  <h4 className="font-semibold text-[#F3E5AB]">
                    What if my ticket email doesn’t arrive?
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Check your spam/promotions folder first. You can also contact NIYASA Support with your Order Reference, and our administrators can trigger an instant one-click ticket resend.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          VIEW 2: INTERACTIVE TICKET SELECTION & CHECKOUT FLOW
         ===================================================================== */}
      {activeView === 'checkout' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
          {/* Atomic Inventory Hold Banner (Section 9 & Appendix B) */}
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#1A150B] via-[#121212] to-[#1A150B] border border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#F3E5AB] font-semibold">
                  Atomic Inventory Reservation Active
                </div>
                <p className="text-xs text-zinc-400">
                  Your selected ticket allocation is safely held during checkout to prevent overselling (FR-11).
                </p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#0A0A0A] border border-[#D4AF37]/40 font-mono text-sm text-[#D4AF37] font-bold">
              Hold Expires: {formatTimer(holdSeconds)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: TIER SELECTOR & BUYER FORM */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Choose Category & Quantity */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-zinc-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                      STEP 1 OF 2
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
                      Select Ticket Category & Quantity
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {categories.map((cat) => {
                    const isSelected = cat.id === selectedCategoryId;
                    const remaining = cat.totalInventory - cat.sold;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1D180F] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                            : 'bg-[#0A0A0A] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-white">{cat.name}</span>
                          <span className="text-xs font-bold text-[#F3E5AB]">
                            {formatNGN(cat.price)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2">{cat.tagline}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>{remaining} tickets available</span>
                          {isSelected && (
                            <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mandatory Disclaimer Box if Celebrity or VIP tier selected */}
                {selectedCategory.disclaimer && (
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200 leading-relaxed">
                      {selectedCategory.disclaimer}
                    </p>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div>
                    <label className="text-sm font-semibold text-white block">
                      Number of Tickets
                    </label>
                    <span className="text-xs text-zinc-400">
                      Each admitted guest receives a unique ticket identifier & QR code.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0A0A0A] p-1.5 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-base">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-9 h-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Buyer Information & Edo State Institution Selector */}
              <form
                onSubmit={handleInitiateCheckout}
                className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-zinc-800 space-y-6"
              >
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                    STEP 2 OF 2
                  </span>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
                    Guest Details & Institution Directory
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your digital pass will be sent to the email address entered below immediately after payment verification.
                  </p>
                </div>

                {checkoutError && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                      Full Name (As on ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g., Osaze Omoregie"
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                      Email Address (For Ticket Delivery) *
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="name@university.edu.ng"
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                      Phone Number (Nigeria) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Searchable Edo State Institution Directory (Section 8 PRD) */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-wider text-[#F3E5AB] font-semibold">
                      University / Tertiary Institution Directory (FR-03) *
                    </label>
                    <span className="text-[11px] text-zinc-400">Edo State & Beyond</span>
                  </div>

                  {/* Filter input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={institutionQuery}
                      onChange={(e) => setInstitutionQuery(e.target.value)}
                      placeholder="Filter institutions (e.g., UNIBEN, BIU, AAU, Okada)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Selectable Institution Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredInstitutions.map((inst) => {
                      const active = !isCustomInstitution && selectedInstitution === inst.name;
                      return (
                        <button
                          type="button"
                          key={inst.id}
                          onClick={() => {
                            setIsCustomInstitution(false);
                            setSelectedInstitution(inst.name);
                          }}
                          className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                            active
                              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F3E5AB] font-semibold'
                              : 'bg-[#0A0A0A] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{inst.name}</div>
                            <div className="text-[10px] text-zinc-500">{inst.location}</div>
                          </div>
                          {active && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                        </button>
                      );
                    })}

                    {/* "Other Institution" fallback per Section 8 PRD */}
                    <button
                      type="button"
                      onClick={() => setIsCustomInstitution(true)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isCustomInstitution
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F3E5AB] font-semibold'
                          : 'bg-[#0A0A0A] border-dashed border-zinc-700 text-zinc-400 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div>
                        <div>+ Other Institution / Unlisted School</div>
                        <div className="text-[10px] text-zinc-500">Enter your institution manually</div>
                      </div>
                      {isCustomInstitution && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                    </button>
                  </div>

                  {isCustomInstitution && (
                    <div className="pt-2">
                      <label className="block text-xs text-[#F3E5AB] mb-1.5">
                        Enter Your Institution or Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customInstitutionName}
                        onChange={(e) => setCustomInstitutionName(e.target.value)}
                        placeholder="e.g., Auchi Polytechnic / University of Lagos"
                        className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#D4AF37] text-white text-sm focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Privacy & Terms Acknowledgement (Section 8 & 16 NDPA compliance) */}
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 accent-[#D4AF37] w-4 h-4 rounded"
                    />
                    <span className="text-xs text-zinc-300 leading-relaxed">
                      I agree to the <strong>Event Entry Terms & Refund Policy</strong> and acknowledge the{' '}
                      <strong>NDPA Privacy Notice</strong>. I understand my contact and institution details are collected for ticket issuance, entry validation, and event reporting.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full gold-shimmer text-[#0A0A0A] font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-[#D4AF37]/20 hover:opacity-95 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    Proceed to Secure Paystack Checkout ({formatNGN(selectedCategory.price * quantity)})
                  </span>
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: LIVE ORDER SUMMARY & SERVER SECURITY GUARANTEES */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-[#D4AF37]/40 sticky top-24 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">
                      SERVER-CALCULATED SUMMARY
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-white">
                      Your Order Breakdown
                    </h3>
                  </div>
                  <Ticket className="w-6 h-6 text-[#D4AF37]" />
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Event</span>
                    <span className="font-semibold text-white text-right">
                      The Fashion Social — Style Meets Laughter
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Organiser & City</span>
                    <span className="text-zinc-200">NIYASA • Benin City, Edo State</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Selected Category</span>
                    <span className="font-semibold text-[#F3E5AB]">{selectedCategory.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Selected Institution</span>
                    <span className="text-zinc-200 text-right max-w-[220px] truncate">
                      {isCustomInstitution
                        ? customInstitutionName || 'Custom Institution'
                        : selectedInstitution}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Unit Price × Quantity</span>
                    <span className="text-zinc-200">
                      {formatNGN(selectedCategory.price)} × {quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Gateway Processing</span>
                    <span className="text-emerald-400 text-xs font-medium">Included (NGN)</span>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-zinc-400">
                      Total Payable (FR-04)
                    </span>
                    <span className="font-editorial text-3xl font-bold text-[#F3E5AB]">
                      {formatNGN(selectedCategory.price * quantity)}
                    </span>
                  </div>
                </div>

                {/* PRD Section 10 Security Architecture Callout */}
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800 space-y-2.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 text-[#F3E5AB] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Payment & Ticket Security Architecture</span>
                  </div>
                  <p className="leading-relaxed">
                    • Prices are calculated from trusted database records on the server (FR-04).
                  </p>
                  <p className="leading-relaxed">
                    • Tickets are only issued after verified Paystack webhook confirmation (FR-05).
                  </p>
                  <p className="leading-relaxed">
                    • Simultaneous customer ticket email & official NIYASA sale alert via Resend (FR-07, FR-08).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          VIEW 3: BRANDED DIGITAL TICKET ("MY TICKET" VIEW) & EMAIL PREVIEWS
         ===================================================================== */}
      {activeView === 'ticket' && activeTicketOrder && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                VERIFIED DIGITAL ADMISSION CREDENTIAL
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold mt-1">
                My Branded Event Pass
              </h2>
            </div>

            {/* Action buttons to inspect the automated emails (Section 11 & 23 PRD) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setEmailModalType('CUSTOMER')}
                className="px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-zinc-800 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>Preview Customer Email (23.1)</span>
              </button>
              <button
                onClick={() => setEmailModalType('ORGANISER')}
                className="px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>Preview NIYASA Sale Alert (23.2)</span>
              </button>
            </div>
          </div>

          {/* LUXURY PERFORATED DIGITAL PASS */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1B160D] via-[#0F0F0F] to-[#0A0A0A] border-2 border-[#D4AF37]/60 shadow-2xl shadow-[#D4AF37]/10 overflow-hidden">
            {/* Top Ribbon */}
            <div className="gold-shimmer px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[#0A0A0A]">
              <div className="flex items-center gap-2 font-bold text-xs tracking-[0.2em] uppercase">
                <Sparkles className="w-4 h-4" />
                <span>NIYASA OFFICIAL E-TICKET • BENIN CITY, EDO STATE</span>
              </div>
              <div className="text-xs font-mono font-bold">
                ORDER REF: {activeTicketOrder.orderRef}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Ticket Left Details */}
              <div className="lg:col-span-8 p-6 sm:p-10 space-y-6 border-b lg:border-b-0 lg:border-r border-dashed border-[#D4AF37]/40">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">
                      STYLE MEETS LAUGHTER
                    </span>
                    <h3 className="font-editorial text-3xl sm:text-5xl font-bold text-white mt-1">
                      THE FASHION SOCIAL
                    </h3>
                  </div>

                  {/* Live Ticket Status Badge */}
                  <div>
                    {activeTicketOrder.ticketStatus === 'UNUSED' && (
                      <span className="px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        VERIFIED & UNUSED
                      </span>
                    )}
                    {activeTicketOrder.ticketStatus === 'USED' && (
                      <span className="px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        USED AT GATE ({activeTicketOrder.scannedAt})
                      </span>
                    )}
                    {activeTicketOrder.ticketStatus === 'REFUNDED' && (
                      <span className="px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        REFUNDED / INVALID
                      </span>
                    )}
                  </div>
                </div>

                {/* Guest & Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#0A0A0A]/80 border border-zinc-800">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Ticket Holder Name
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {activeTicketOrder.buyerName}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">{activeTicketOrder.email}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A0A0A]/80 border border-[#D4AF37]/40">
                    <div className="text-[10px] uppercase tracking-wider text-[#D4AF37]">
                      Admission Category
                    </div>
                    <div className="text-base font-bold text-[#F3E5AB] mt-0.5">
                      {activeTicketOrder.categoryName} (×{activeTicketOrder.quantity})
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Verified Paid: {formatNGN(activeTicketOrder.totalPaid)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A0A0A]/80 border border-zinc-800">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Selected Institution
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {activeTicketOrder.institution}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A0A0A]/80 border border-zinc-800">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Unique Ticket Number (FR-06)
                    </div>
                    <div className="text-sm font-mono font-bold text-[#D4AF37] mt-0.5">
                      {activeTicketOrder.ticketNumber}
                    </div>
                  </div>
                </div>

                {/* Venue & Gate Instructions */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-300">
                  <div className="space-y-1">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Gate Check-In & Security Notice</span>
                    </div>
                    <p className="text-zinc-400">
                      Present this QR code at the Benin City venue entrance. The QR payload contains a signed opaque token and does not expose unnecessary personal data (Section 12).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScannerInput(activeTicketOrder.ticketNumber);
                      setActiveView('admin');
                      setAdminSubTab('scanner');
                    }}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37] text-[#F3E5AB] font-semibold hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all"
                  >
                    Test Gate Scan Now →
                  </button>
                </div>
              </div>

              {/* Ticket Right Stub: Scannable QR Code */}
              <div className="lg:col-span-4 p-6 sm:p-10 flex flex-col items-center justify-center bg-[#0A0A0A]/60 text-center space-y-4">
                <LuxuryQRCode value={activeTicketOrder.qrToken} size={176} />
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-widest text-zinc-400">
                    Signed QR Token Payload
                  </div>
                  <div className="font-mono text-xs text-[#F3E5AB] bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {activeTicketOrder.ticketNumber}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 max-w-[200px]">
                  Payment Ref: {activeTicketOrder.paymentRef}
                </p>
              </div>
            </div>
          </div>

          {/* Switch Between Sample Tickets */}
          <div className="mt-8 p-5 rounded-2xl bg-[#121212] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              <strong className="text-white block mb-0.5">Prototype Ticket Switcher:</strong>
              Inspect different ticket states (Unused, Already Scanned at Gate, or Refunded) from the database.
            </div>
            <div className="flex flex-wrap gap-2">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setActiveTicketOrder(ord)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    activeTicketOrder.id === ord.id
                      ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] font-bold'
                      : 'bg-[#0A0A0A] text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {ord.ticketNumber} ({ord.ticketStatus})
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          VIEW 4: ADMIN DASHBOARD & QR GATE CHECK-IN PORTAL
         ===================================================================== */}
      {activeView === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
          {/* Role-Based Access Control Header (Section 5 & FR-13) */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-[#D4AF37]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                  NIYASA OPERATIONS PORTAL
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Least-Privilege RBAC Enabled (FR-13)
                </span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                Admin Dashboard & Gate Verification
              </h2>
            </div>

            {/* Interactive Role Switcher */}
            <div className="flex flex-wrap items-center gap-2 bg-[#0A0A0A] p-1.5 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-400 px-2">Simulate Staff Role:</span>
              {[
                { id: 'ADMIN', label: 'Event Administrator (Full)' },
                { id: 'STAFF', label: 'Check-In Staff (Scanner Only)' },
                { id: 'FINANCE', label: 'Finance Reviewer (Read-Only)' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setAdminRole(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    adminRole === r.id
                      ? 'bg-[#D4AF37] text-[#0A0A0A]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Sub-Navigation Tabs (Filtered by Role) */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
            {adminRole !== 'STAFF' && (
              <>
                <button
                  onClick={() => setAdminSubTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    adminSubTab === 'overview'
                      ? 'bg-white text-[#0A0A0A]'
                      : 'bg-[#121212] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Overview & Sales KPIs
                </button>
                <button
                  onClick={() => setAdminSubTab('institutions')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    adminSubTab === 'institutions'
                      ? 'bg-white text-[#0A0A0A]'
                      : 'bg-[#121212] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Institution Reach Report
                </button>
                <button
                  onClick={() => setAdminSubTab('orders')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    adminSubTab === 'orders'
                      ? 'bg-white text-[#0A0A0A]'
                      : 'bg-[#121212] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Orders & Ticket Resend (FR-10)
                </button>
              </>
            )}

            {adminRole === 'ADMIN' && (
              <button
                onClick={() => setAdminSubTab('categories')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminSubTab === 'categories'
                    ? 'bg-white text-[#0A0A0A]'
                    : 'bg-[#121212] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Category & Price Management
              </button>
            )}

            {adminRole !== 'FINANCE' && (
              <button
                onClick={() => setAdminSubTab('scanner')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  adminSubTab === 'scanner'
                    ? 'gold-shimmer text-[#0A0A0A] font-bold'
                    : 'bg-[#121212] text-[#F3E5AB] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Gate Scanner (FR-12)</span>
              </button>
            )}
          </div>

          {/* -----------------------------------------------------------------
              ADMIN TAB 1: OVERVIEW & SALES KPIS
             ----------------------------------------------------------------- */}
          {adminSubTab === 'overview' && adminRole !== 'STAFF' && (
            <div className="space-y-8">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-[#121212] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Verified Gross Revenue</span>
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="font-editorial text-3xl font-bold text-[#F3E5AB]">
                    {formatNGN(86200000 + metrics.totalRevenue)}
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    100% Server-verified via Paystack
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121212] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Paid Tickets Issued</span>
                    <Ticket className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="font-editorial text-3xl font-bold text-white">
                    {metrics.dynamicTicketsSold.toLocaleString()} / 3,000
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {Math.round((metrics.dynamicTicketsSold / 3000) * 100)}% of planning target
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121212] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Institutions Represented</span>
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="font-editorial text-3xl font-bold text-white">
                    {institutions.length} Campuses
                  </div>
                  <div className="text-[11px] text-[#F3E5AB]">
                    Led by UNIBEN, BIU & AAU
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121212] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Email Delivery & Gate Status</span>
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="font-editorial text-3xl font-bold text-emerald-400">
                    99.8% Delivered
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {metrics.scannedCount} sample tickets checked in
                  </div>
                </div>
              </div>

              {/* Category Performance Table & Audit Log */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121212] border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-2xl font-bold">
                      Ticket Category Breakdown
                    </h3>
                    {adminRole === 'ADMIN' && (
                      <button
                        onClick={() => setAdminSubTab('categories')}
                        className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Configure Tiers
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {categories.map((cat) => {
                      const pct = Math.round((cat.sold / cat.totalInventory) * 100);
                      return (
                        <div
                          key={cat.id}
                          className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800/90 space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-bold text-white">{cat.name}</span>
                              <span className="text-xs text-zinc-400 ml-2">
                                ({formatNGN(cat.price)})
                              </span>
                            </div>
                            <span className="text-xs font-mono text-[#F3E5AB]">
                              {cat.sold} / {cat.totalInventory} sold ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className="h-full gold-shimmer"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Gross: {formatNGN(cat.sold * cat.price)}</span>
                            <span>Remaining: {cat.totalInventory - cat.sold}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Security & Webhook Audit Log (Section 13 & 15) */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121212] border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-2xl font-bold">
                      System Audit Trail
                    </h3>
                    <span className="text-[11px] text-zinc-400">Immutable Event Log</span>
                  </div>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-[#0A0A0A] border border-zinc-800/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#D4AF37]">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-zinc-500">{log.time}</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">{log.detail}</p>
                        <div className="text-[10px] text-zinc-500">Actor: {log.actor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              ADMIN TAB 2: INSTITUTION REACH REPORT (SECTION 8 & 13 PRD)
             ----------------------------------------------------------------- */}
          {adminSubTab === 'institutions' && adminRole !== 'STAFF' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    CAMPUS & TERTIARY DEMOGRAPHICS
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
                    Verified Sales Grouped by Institution
                  </h3>
                </div>
                <div className="text-xs text-zinc-400">
                  Includes Edo State Universities & custom checkout entries
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-4">Institution Name</th>
                      <th className="py-3 px-4">Paid Tickets</th>
                      <th className="py-3 px-4">Verified Revenue</th>
                      <th className="py-3 px-4">Audience Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-sm">
                    {institutionStats.map((stat, idx) => {
                      const sharePct = Math.min(
                        100,
                        Math.round((stat.tickets / metrics.dynamicTicketsSold) * 100)
                      );
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/40">
                          <td className="py-4 px-4 font-semibold text-white">
                            {stat.name}
                          </td>
                          <td className="py-4 px-4 text-zinc-300 font-mono">
                            {stat.tickets.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-[#F3E5AB] font-semibold">
                            {formatNGN(stat.revenue)}
                          </td>
                          <td className="py-4 px-4 w-64">
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full gold-shimmer"
                                  style={{ width: `${sharePct}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-zinc-400 w-10">
                                {sharePct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              ADMIN TAB 3: ORDERS, CUSTOMER LOOKUP & RESEND TICKET (FR-09, FR-10)
             ----------------------------------------------------------------- */}
          {adminSubTab === 'orders' && adminRole !== 'STAFF' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-zinc-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    CUSTOMER LOOKUP & RECOVERY
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
                    Orders & Idempotent Ticket Resend
                  </h3>
                </div>

                {/* Search & Status Filter */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search ticket #, name, email, ref..."
                      className="pl-9 pr-4 py-2 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#D4AF37] w-64"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-xs text-zinc-300"
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="PAID">PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-3">Ticket # / Order Ref</th>
                      <th className="py-3 px-3">Buyer & Institution</th>
                      <th className="py-3 px-3">Category & Total</th>
                      <th className="py-3 px-3">Payment / Gate</th>
                      <th className="py-3 px-3">Email Log</th>
                      <th className="py-3 px-3 text-right">Actions (FR-10)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {orders
                      .filter((o) => {
                        const matchesStatus =
                          orderStatusFilter === 'ALL' || o.paymentStatus === orderStatusFilter;
                        const q = orderSearch.toLowerCase();
                        const matchesQuery =
                          !q ||
                          o.ticketNumber.toLowerCase().includes(q) ||
                          o.orderRef.toLowerCase().includes(q) ||
                          o.buyerName.toLowerCase().includes(q) ||
                          o.email.toLowerCase().includes(q);
                        return matchesStatus && matchesQuery;
                      })
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-900/40">
                          <td className="py-4 px-3 font-mono">
                            <div className="font-bold text-[#F3E5AB]">{ord.ticketNumber}</div>
                            <div className="text-[11px] text-zinc-500">{ord.orderRef}</div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="font-semibold text-white">{ord.buyerName}</div>
                            <div className="text-zinc-400">{ord.email}</div>
                            <div className="text-[11px] text-[#D4AF37]">{ord.institution}</div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="font-semibold text-white">
                              {ord.categoryName} (×{ord.quantity})
                            </div>
                            <div className="text-zinc-300">{formatNGN(ord.totalPaid)}</div>
                          </td>
                          <td className="py-4 px-3 space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.paymentStatus === 'PAID'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-500/15 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                            <div className="text-[11px] text-zinc-400">
                              Gate: <strong className="text-white">{ord.ticketStatus}</strong>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="text-emerald-400 font-semibold">
                              {ord.emailStatus}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              Resends: {ord.emailRetries}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setActiveTicketOrder(ord);
                                setActiveView('ticket');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium"
                            >
                              View Pass
                            </button>
                            {adminRole === 'ADMIN' && ord.paymentStatus === 'PAID' && (
                              <button
                                onClick={() => handleResendTicketEmail(ord)}
                                className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A0A0A] font-semibold transition-all inline-flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Resend Email</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              ADMIN TAB 4: TICKET CATEGORY & INVENTORY MANAGEMENT (ADMIN ONLY)
             ----------------------------------------------------------------- */}
          {adminSubTab === 'categories' && adminRole === 'ADMIN' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-zinc-800 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
                  TICKET CATALOGUE CONFIGURATION
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
                  Manage Prices, Capacities & Sales Windows
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-5 rounded-xl bg-[#0A0A0A] border border-zinc-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-editorial text-2xl font-bold text-white">
                          {cat.name}
                        </h4>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {cat.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{cat.tagline}</p>

                      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-900 text-xs">
                        <div>
                          <span className="text-zinc-500 block">Unit Price</span>
                          <span className="font-bold text-[#F3E5AB] text-sm">
                            {formatNGN(cat.price)}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Allocation</span>
                          <span className="font-bold text-white text-sm">
                            {cat.totalInventory}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Paid Sold</span>
                          <span className="font-bold text-emerald-400 text-sm">
                            {cat.sold}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingCategory({ ...cat })}
                      className="w-full py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A0A0A] text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Price & Inventory Limit</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Edit Modal */}
              {editingCategory && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <form
                    onSubmit={handleSaveCategoryEdit}
                    className="max-w-md w-full rounded-2xl bg-[#121212] border border-[#D4AF37] p-6 space-y-4"
                  >
                    <h4 className="font-editorial text-2xl font-bold text-white">
                      Edit {editingCategory.name}
                    </h4>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Category Price (NGN)
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editingCategory.price}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            price: Number(e.target.value)
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Total Inventory Allocation
                      </label>
                      <input
                        type="number"
                        required
                        min={editingCategory.sold}
                        value={editingCategory.totalInventory}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            totalInventory: Number(e.target.value)
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-white text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl gold-shimmer text-[#0A0A0A] font-bold text-xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* -----------------------------------------------------------------
              ADMIN TAB 5: INTERACTIVE QR GATE SCANNER (SECTION 12 & FR-12)
             ----------------------------------------------------------------- */}
          {adminSubTab === 'scanner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#121212] border border-[#D4AF37]/40 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                      BENIN CITY VENUE GATE OPERATIONS
                    </span>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
                      QR Code & Ticket Verification Terminal
                    </h3>
                  </div>
                  <QrCode className="w-8 h-8 text-[#D4AF37]" />
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Scan a guest’s QR code or enter the ticket number below. The server validates current status and atomically marks unused tickets as <code className="text-emerald-300">USED</code> on the first scan. Repeated scans are automatically blocked.
                </p>

                {/* Manual / Simulated Scanner Input */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400">
                    Ticket Number or Signed QR Payload
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={scannerInput}
                      onChange={(e) => setScannerInput(e.target.value)}
                      placeholder="e.g., TFS-2026-VVIP-4821"
                      className="flex-1 px-4 py-3.5 rounded-xl bg-[#0A0A0A] border border-zinc-700 font-mono text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      onClick={() => handleVerifyTicketAtGate(scannerInput)}
                      className="gold-shimmer text-[#0A0A0A] font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Verify & Scan Ticket</span>
                    </button>
                  </div>
                </div>

                {/* Quick Test Preset Buttons for Evaluators */}
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400">
                    One-Click Gate Test Scenarios (FR-12):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {orders.map((ord) => (
                      <button
                        key={ord.id}
                        onClick={() => {
                          setScannerInput(ord.ticketNumber);
                          handleVerifyTicketAtGate(ord.ticketNumber);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center gap-2 transition-all"
                      >
                        <span className="text-[#F3E5AB]">{ord.ticketNumber}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            ord.ticketStatus === 'UNUSED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ord.ticketStatus === 'USED'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {ord.ticketStatus}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setScannerInput('TFS-2026-FAKE-9999');
                        handleVerifyTicketAtGate('TFS-2026-FAKE-9999');
                      }}
                      className="px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-xs font-mono text-red-300"
                    >
                      Test Forged QR (TFS-2026-FAKE-9999)
                    </button>
                  </div>
                </div>

                {/* Live Scan Result Banner */}
                {scanResult && (
                  <div
                    className={`p-6 rounded-2xl border-2 space-y-3 transition-all ${
                      scanResult.outcome === 'VALID'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100'
                        : scanResult.outcome === 'DUPLICATE'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100'
                        : 'bg-red-950/50 border-red-500 text-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {scanResult.outcome === 'VALID' && (
                        <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                      )}
                      {scanResult.outcome === 'DUPLICATE' && (
                        <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                      )}
                      {(scanResult.outcome === 'INVALID' || scanResult.outcome === 'REFUNDED') && (
                        <XCircle className="w-7 h-7 text-red-400 shrink-0" />
                      )}
                      <h4 className="font-editorial text-2xl font-bold">{scanResult.title}</h4>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed">{scanResult.message}</p>

                    {scanResult.order && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                        <div>
                          <span className="opacity-70 block">Guest Name</span>
                          <strong className="text-white">{scanResult.order.buyerName}</strong>
                        </div>
                        <div>
                          <span className="opacity-70 block">Category</span>
                          <strong className="text-[#F3E5AB]">{scanResult.order.categoryName}</strong>
                        </div>
                        <div>
                          <span className="opacity-70 block">Institution</span>
                          <strong className="text-white">{scanResult.order.institution}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gate Entry Live Stats */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121212] border border-zinc-800 space-y-6">
                <h3 className="font-editorial text-2xl font-bold">
                  Entry Operations Summary
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800">
                    <span className="text-xs text-zinc-400">Admitted (USED)</span>
                    <div className="font-editorial text-3xl font-bold text-emerald-400 mt-1">
                      {orders.filter((o) => o.ticketStatus === 'USED').length}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800">
                    <span className="text-xs text-zinc-400">Awaiting Scan (UNUSED)</span>
                    <div className="font-editorial text-3xl font-bold text-[#F3E5AB] mt-1">
                      {orders.filter((o) => o.ticketStatus === 'UNUSED').length}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800 space-y-2 text-xs text-zinc-400">
                  <div className="font-semibold text-white">Staff Gate Protocol</div>
                  <p>1. Verify guest’s QR code on mobile screen or printed confirmation.</p>
                  <p>2. If a second scan occurs, inspect the first scan timestamp and alert the Gate Supervisor.</p>
                  <p>3. Check-in staff accounts cannot modify ticket prices or export full guest lists (Section 5).</p>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          MODAL 1: SIMULATED PAYSTACK SERVER-SIDE VERIFICATION FLOW (FR-05, FR-14)
         ===================================================================== */}
      {paystackModalOpen && pendingOrderDraft && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-[#121212] border-2 border-[#D4AF37] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#0A0A0A] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Paystack Secure Checkout (NGN)
                  </div>
                  <div className="text-[11px] text-zinc-400">{pendingOrderDraft.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">Order {pendingOrderDraft.orderRef}</div>
                <div className="text-base font-bold text-[#F3E5AB]">
                  {formatNGN(pendingOrderDraft.totalPaid)}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ticket Tier:</span>
                  <span className="font-semibold text-white">
                    {pendingOrderDraft.categoryName} × {pendingOrderDraft.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Institution:</span>
                  <span className="text-[#F3E5AB]">{pendingOrderDraft.institution}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-[#F3E5AB] uppercase tracking-wider">
                  Test Server-Side Payment Verification States (FR-05 & FR-14):
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Per Section 10 of the PRD, the application never marks an order paid based solely on browser redirects. Choose a simulated webhook outcome below:
                </p>

                {/* Outcome 1: Verified Success */}
                <button
                  disabled={paymentSimState === 'PROCESSING'}
                  onClick={() => handleSimulatePaystackOutcome('SUCCESS')}
                  className="w-full py-3.5 px-4 rounded-xl gold-shimmer text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-lg hover:opacity-95 transition-all"
                >
                  <span>1. Simulate Verified Paystack Webhook (Success)</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                {/* Outcome 2: Pending Payment (No Ticket Issued Yet) */}
                <button
                  disabled={paymentSimState === 'PROCESSING'}
                  onClick={() => handleSimulatePaystackOutcome('PENDING')}
                  className="w-full py-3 px-4 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/40 text-amber-200 font-semibold text-xs flex items-center justify-between transition-all"
                >
                  <span>2. Simulate Pending Bank Transfer (Do Not Issue Ticket Yet)</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </button>

                {/* Outcome 3: Failed Payment */}
                <button
                  disabled={paymentSimState === 'PROCESSING'}
                  onClick={() => handleSimulatePaystackOutcome('FAILED')}
                  className="w-full py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-200 font-semibold text-xs flex items-center justify-between transition-all"
                >
                  <span>3. Simulate Declined / Failed Transaction</span>
                  <XCircle className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Status Feedback inside Modal */}
              {paymentSimState === 'PENDING_UNVERIFIED' && (
                <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500 text-xs text-amber-100 space-y-1">
                  <div className="font-bold text-amber-300">
                    ORDER STATUS: PENDING SERVER VERIFICATION
                  </div>
                  <p>
                    In compliance with Section 6 & FR-05, no valid admission ticket or QR code is shown while payment is pending verification.
                  </p>
                </div>
              )}

              {paymentSimState === 'FAILED' && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500 text-xs text-red-100 space-y-1">
                  <div className="font-bold text-red-300">
                    ORDER STATUS: PAYMENT FAILED
                  </div>
                  <p>
                    The payment provider reported a failed transaction. No ticket was generated and your reserved inventory has been released.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPaystackModalOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Close Checkout Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: TRANSACTIONAL EMAIL TEMPLATES PREVIEW (SECTION 23.1 & 23.2)
         ===================================================================== */}
      {emailModalType && activeTicketOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl bg-[#121212] border border-[#D4AF37] shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#0A0A0A] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#F3E5AB]">
                  {emailModalType === 'CUSTOMER'
                    ? 'PRD 23.1 — Customer Ticket Email (via Resend)'
                    : 'PRD 23.2 — Official NIYASA Organiser Sale Notification'}
                </span>
              </div>
              <button
                onClick={() => setEmailModalType(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {emailModalType === 'CUSTOMER' ? (
              <div className="p-6 space-y-4 text-xs sm:text-sm text-zinc-200 leading-relaxed max-h-[80vh] overflow-y-auto">
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-xs space-y-1">
                  <div>
                    <span className="text-zinc-500">To:</span> {activeTicketOrder.buyerName} &lt;{activeTicketOrder.email}&gt;
                  </div>
                  <div>
                    <span className="text-zinc-500">Subject:</span>{' '}
                    <strong className="text-[#F3E5AB]">
                      Your Ticket Is Confirmed — The Fashion Social
                    </strong>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#D4AF37]/30 space-y-3">
                  <p>Hello <strong>{activeTicketOrder.buyerName}</strong>,</p>
                  <p>
                    Your payment has been confirmed and your ticket for{' '}
                    <strong>The Fashion Social — Style Meets Laughter</strong> has been issued.
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#121212] border border-zinc-800 font-mono text-xs space-y-1">
                    <div>Ticket number: <span className="text-[#F3E5AB]">{activeTicketOrder.ticketNumber}</span></div>
                    <div>Ticket category: {activeTicketOrder.categoryName}</div>
                    <div>Institution: {activeTicketOrder.institution}</div>
                    <div>Order reference: {activeTicketOrder.orderRef}</div>
                    <div>Event location: Benin City, Edo State, Nigeria</div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Your QR code is included in this email and accessible via your secure ticket link. Please present it at the entrance for validation.
                  </p>
                  <p className="text-xs text-[#D4AF37] font-editorial italic text-base">
                    We look forward to welcoming you! — The Fashion Social Team (Organised by NIYASA)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4 text-xs sm:text-sm text-zinc-200 leading-relaxed max-h-[80vh] overflow-y-auto">
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-zinc-800 text-xs space-y-1">
                  <div>
                    <span className="text-zinc-500">To:</span> sales-notifications@thefashionsocial.ng (Official Event Email)
                  </div>
                  <div>
                    <span className="text-zinc-500">Subject:</span>{' '}
                    <strong className="text-emerald-300">
                      New Paid Ticket Order — {activeTicketOrder.orderRef}
                    </strong>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-zinc-800 space-y-3">
                  <p>A ticket order has been verified as paid on the server.</p>
                  <div className="p-3.5 rounded-xl bg-[#121212] border border-zinc-800 font-mono text-xs space-y-1">
                    <div>Order reference: {activeTicketOrder.orderRef}</div>
                    <div>Buyer: {activeTicketOrder.buyerName}</div>
                    <div>Buyer email: {activeTicketOrder.email}</div>
                    <div>Phone: {activeTicketOrder.phone}</div>
                    <div>Institution: {activeTicketOrder.institution}</div>
                    <div>Ticket category: {activeTicketOrder.categoryName}</div>
                    <div>Quantity: {activeTicketOrder.quantity}</div>
                    <div>Amount paid: {formatNGN(activeTicketOrder.totalPaid)}</div>
                    <div>Payment reference: {activeTicketOrder.paymentRef}</div>
                    <div>Paid at: {activeTicketOrder.paidAt}</div>
                  </div>
                  <p className="text-[11px] text-amber-300">
                    Security Note: View the order in the secure admin dashboard. Do not treat this email alone as a substitute for the payment provider’s transaction records.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-[#070707] py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-lg font-bold text-[#F3E5AB]">
              THE FASHION SOCIAL
            </span>
            <span>•</span>
            <span>Organised by NIYASA (Benin City, Edo State, Nigeria)</span>
          </div>
          <div>
            Style Meets Laughter • NDPA Privacy Compliant • Powered by Next.js, Supabase & Paystack
          </div>
        </div>
      </footer>
    </div>
  );
}