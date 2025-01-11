import { atom } from "jotai";

export type AdminModalType = "create" | "edit" | "delete" | null;
export type AdminSection =
  | "audits"
  | "auditors"
  | "research"
  | "tools"
  | "applications";
interface AdminModalState {
  type: AdminModalType;
  section: AdminSection | null;
  itemId?: string;
}

export const adminModalAtom = atom<AdminModalState>({
  type: null,
  section: null,
  itemId: undefined,
});

export const activeAdminSectionAtom = atom<AdminSection>("audits");

export const adminLoadingAtom = atom<{
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}>({
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
});
