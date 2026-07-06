import { prisma } from "./db.server";
import { ForbiddenError, NotFoundError } from "./errors";

export interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

export async function toggleLike(
  userId: string,
  widgetId: string,
): Promise<ToggleLikeResult> {
  const widget = await prisma.widget.findUnique({
    where: { id: widgetId },
    select: { id: true, visibility: true, authorId: true, likesCount: true },
  });
  if (!widget) throw new NotFoundError("Widget not found");
  if (widget.visibility === "PRIVATE" && widget.authorId !== userId) {
    throw new ForbiddenError("You can’t like a private widget");
  }

  const existing = await prisma.like.findUnique({
    where: { userId_widgetId: { userId, widgetId } },
    select: { userId: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { userId_widgetId: { userId, widgetId } } }),
      prisma.widget.update({
        where: { id: widgetId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false, likesCount: Math.max(0, widget.likesCount - 1) };
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId, widgetId } }),
    prisma.widget.update({
      where: { id: widgetId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
  return { liked: true, likesCount: widget.likesCount + 1 };
}
