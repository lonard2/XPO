import { db } from "@/lib/db";

/**
 * Slot invariant: any transition out of APPROVED evicts the update's
 * homepage slot in the same transaction as the status change. Organizer
 * revert, admin unapprove, and delete all go through this shape so the
 * rail can never hold a draft or a removed row.
 */
export async function revertUpdateToDraft(
  updateId: string,
  copy: { title?: string; body?: string } = {}
) {
  const [updated] = await db.$transaction([
    db.eventUpdate.update({
      where: { id: updateId },
      data: {
        ...copy,
        status: "DRAFT",
        approvedBy: null,
        approvedAt: null,
      },
    }),
    db.homepageNewsSlot.deleteMany({ where: { updateId } }),
  ]);
  return updated;
}
