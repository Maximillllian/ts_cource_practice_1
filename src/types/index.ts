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

export type PrefixedId<Prefix extends string> = `${Prefix}_${string}`;

export type PersonId = PrefixedId<'p'>; 
export type CompanyId = PrefixedId<'c'>; 
export type DealId = PrefixedId<'d'>;
export type NoteId = PrefixedId<'n'>;

type BaseEntity = {
    id: PrefixedId<string>,
    kind: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    tags: string[],
    custom: Record<string, unknown>
}

export type Person = BaseEntity & {
    id: PersonId,
    kind: 'person',
    email: string | null,
    dob: string | undefined, 
};

interface Company extends BaseEntity {
    id: CompanyId,
    kind: 'company',
    domain: string | undefined,
    foundedAt: string,
}

export type Note = {
    id: NoteId,
    subjectKind: string, // ???
    subjectId: string, // ???
    text: string, // ???
    createdAt: string,
};

export type Deal = {
    id: DealId,
    title: string,
    stage: string, // 'lead', 'proposal', 'stage'
    amount: number,
    ownerId: PersonId,
    contactIds: Person['id'][],
    createdAt: string,
    updatedAt: string,
}

export type Entity = Person | Company;