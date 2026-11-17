export const BUSINESS_ARCHETYPES = {
  TYPE_1: {
    id: 1,
    name: 'Type 1: Sole Operator',
    badgeText: 'Type 1: Sole Operator',
    description: '1 Owner • 1 Shop',
    allowsBranches: false,
    allowsBusinesses: false,
    hasEmployees: true,
  },
  TYPE_2: {
    id: 2,
    name: 'Type 2: Single Branch + Staff',
    badgeText: 'Type 2: Single Branch + Staff',
    description: '1 Owner • Single Branch',
    allowsBranches: false,
    allowsBusinesses: false,
    hasEmployees: true,
  },
  TYPE_3: {
    id: 3,
    name: 'Type 3: Multi-Branch Enterprise',
    badgeText: 'Type 3: Multi-Branch Enterprise',
    description: '1 Owner • Multiple Branches',
    allowsBranches: true,
    allowsBusinesses: false,
    hasEmployees: true,
  },
  TYPE_4: {
    id: 4,
    name: 'Type 4: Multi-Business Conglomerate',
    badgeText: 'Type 4: Multi-Business Conglomerate',
    description: '1 Owner • Multiple Businesses',
    allowsBranches: true,
    allowsBusinesses: true,
    hasEmployees: true,
  },
};

export const getArchetypeById = (id) => {
  const num = Number(id) || 1;
  return BUSINESS_ARCHETYPES[`TYPE_${num}`] || BUSINESS_ARCHETYPES.TYPE_1;
};

export default BUSINESS_ARCHETYPES;