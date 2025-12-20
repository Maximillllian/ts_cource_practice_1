export type Operation = {
    path: string, // ???
    op: "set" | "unset" | "push" | "inc",
    value: unknown, // ???
}

export type UnknownObject = Record<string, unknown>;