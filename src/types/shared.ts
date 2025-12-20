import { BaseEntity, Company, Deal, Person } from "./model"

export type SearchResult = {
    name: BaseEntity["name"],
    hint: string
} & (
    | Pick<Company, "id" | "kind">
    | Pick<Person, "id" | "kind">
    | Pick<Deal, "id" | "kind">
    )