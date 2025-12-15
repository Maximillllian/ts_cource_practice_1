// {
//     id: `p_${1100 + i}`,
//     kind: "person",
//     name: `Person ${i}`,
//     createdAt: nowIso(),
//     updatedAt: nowIso(),
//     email: i % 7 === 0 ? null : `person${i}@example.com`,
//     dob: i % 9 === 0 ? undefined : `199${i % 10}-0${(i % 8) + 1}-1${i % 9}`,
//     tags: i % 3 === 0 ? ["new"] : [],
//     custom: { score: i * 3 },
//   }

type BaseEntity = {
    id: string,
    kind: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    tags: string[],
    custom: Record<string, unknown>
}

type Person = BaseEntity & {
    id: `p_${string}`,
    kind: 'person',
    email: string | null,
    dob: string | undefined, 
};

interface Company extends BaseEntity {
    id: `c_${string}`,
    kind: 'company',
    domain: string | undefined,
    foundedAt: string,
}

export type Entity = Person | Company;