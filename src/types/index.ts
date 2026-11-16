export * from "./form";
export * from "./friction";

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  exact?: boolean;
}

export type ApplicationMode = "complex" | "simplified";
