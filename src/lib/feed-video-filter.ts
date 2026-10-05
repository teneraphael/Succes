import { Prisma } from "@prisma/client";

// Une vidéo commence dans Vidéos Deals. Elle rejoint le fil après avoir
// obtenu suffisamment de vues réelles dans la plateforme.
export const FEATURED_VIDEO_VIEWS = 100;

export const homeFeedVideoFilter: Prisma.PostWhereInput = {
  OR: [
    { attachments: { none: { type: "VIDEO" } } },
    { attachments: { some: { type: "VIDEO" } }, views: { gte: FEATURED_VIDEO_VIEWS } },
  ],
};
