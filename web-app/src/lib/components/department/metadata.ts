export type InstituteEntry = {
    name: string;
    icon: () => Promise<typeof import('*.svg?component')>;
};

export const kInstituteMapping: Record<string, InstituteEntry> = {
    '': {
        icon: () => import('./icons/FB01.svg?component'),
        name: 'Unbekannt'
    },

    '01': {
        icon: () => import('./icons/FB01.svg?component'),
        name: 'Law and Economics'
    },
    '02': {
        icon: () => import('./icons/FB02.svg?component'),
        name: 'History and Social Sciences'
    },
    '03': {
        icon: () => import('./icons/FB03.svg?component'),
        name: 'Human Sciences'
    },
    '04': {
        icon: () => import('./icons/FB04.svg?component'),
        name: 'Mathematics'
    },
    '05': {
        icon: () => import('./icons/FB05.svg?component'),
        name: 'Physics'
    },
    '07': {
        icon: () => import('./icons/FB07.svg?component'),
        name: 'Chemistry'
    },
    '10': {
        icon: () => import('./icons/FB10.svg?component'),
        name: 'Biology'
    },
    '11': {
        icon: () => import('./icons/FB11.svg?component'),
        name: 'Materials- and Geosciences'
    },
    '13': {
        icon: () => import('./icons/FB13.svg?component'),
        name: 'Civil and Environmental Engineering'
    },
    '15': {
        icon: () => import('./icons/FB15.svg?component'),
        name: 'Architecture'
    },
    '16': {
        icon: () => import('./icons/FB16.svg?component'),
        name: 'Mechanical Engineering'
    },
    '18': {
        icon: () => import('./icons/FB18.svg?component'),
        name: 'Electrical Engineering and Information Technology'
    },
    '20': {
        icon: () => import('./icons/FB20.svg?component'),
        name: 'Computer Science'
    },

    '41': {
        /* TODO: Proper icon */
        icon: () => import('./icons/FB01.svg?component'),
        name: 'Language Resource Centre'
    }
};