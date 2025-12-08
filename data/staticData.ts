export const INDIAN_STATES = [
    { key: 'SELECT', label: '--- राज्य चुनें ---' },
    { key: 'MH', label: 'महाराष्ट्र' },
    { key: 'UP', label: 'उत्तर प्रदेश' },
    { key: 'RJ', label: 'राजस्थान' },
    { key: 'MP', label: 'मध्य प्रदेश' },
    { key: 'GJ', label: 'गुजरात' },
    // Add more states as needed
];

export const DISTRICTS_BY_STATE: { [key: string]: { key: string, label: string }[] } = {
    SELECT: [{ key: 'SELECT', label: '--- जिला चुनें ---' }],
    MH: [
        { key: 'ND', label: 'नांदेड़' },
        { key: 'PU', label: 'पुणे' },
        { key: 'MU', label: 'मुंबई' },
        { key: 'NA', label: 'नागपुर' },
    ],
    UP: [
        { key: 'LU', label: 'लखनऊ' },
        { key: 'KA', label: 'कानपुर' },
        { key: 'AG', label: 'आगरा' },
    ],
    RJ: [
        { key: 'JA', label: 'जयपुर' },
        { key: 'JO', label: 'जोधपुर' },
    ],
    MP: [
        { key: 'BH', label: 'भोपाल' },
        { key: 'IN', label: 'इंदौर' },
    ],
    GJ: [
        { key: 'AH', label: 'अहमदाबाद' },
        { key: 'SU', label: 'सूरत' },
    ],
    DEFAULT: [{ key: 'DEFAULT', label: '--- पहले राज्य चुनें ---' }],
};
