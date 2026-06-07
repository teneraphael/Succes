import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber, cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";
import { WhoToFollowHeader, TrendingTopicsHeader } from "./TrendsSidebarClient";

interface TrendsSidebarProps {
  className?: string;
}

export default function TrendsSidebar({ className }: TrendsSidebarProps) {
  return (
    <div className={cn("hidden md:block sticky top-[5.25rem] h-fit w-72 flex-none space-y-4 lg:w-80", className)}>
      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/60 p-5 space-y-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-muted shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-2 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        }
      >
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();
  if (!user) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: { id: user.id },
      followers: { none: { followerId: user.id } },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });

  if (!usersToFollow.length) return null;

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      {/* ✅ En-tête traduit via composant client */}
      <WhoToFollowHeader />

      <div className="p-4 space-y-4">
        {usersToFollow.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3">
            <UserTooltip user={u}>
              <Link href={`/users/${u.username}`} className="flex items-center gap-2.5 min-w-0">
                <UserAvatar avatarUrl={u.avatarUrl} size={36} className="shrink-0" />
                <div className="min-w-0">
                  <p className="line-clamp-1 break-all text-sm font-bold text-foreground hover:text-[#4a90e2] transition-colors">
                    {u.displayName}
                  </p>
                  <p className="line-clamp-1 break-all text-[11px] text-muted-foreground">
                    @{u.username}
                  </p>
                </div>
              </Link>
            </UserTooltip>
            <FollowButton
              userId={u.id}
              initialState={{
                followers: u._count.followers,
                isFollowedByUser: u.followers.some(
                  ({ followerId }) => followerId === user.id,
                ),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
      FROM posts
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;
    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  { revalidate: 3 * 60 * 60 },
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();
  if (!trendingTopics.length) return null;

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      {/* ✅ En-tête traduit via composant client */}
      <TrendingTopicsHeader />

      <div className="p-4 space-y-3">
        {trendingTopics.map(({ hashtag, count }, index) => {
          const title = hashtag.split("#")[1];
          return (
            <Link
              key={title}
              href={`/hashtag/${title}`}
              className="flex items-center gap-3 group"
            >
              <span className={[
                "text-xs font-black italic w-4 text-center shrink-0",
                index === 0 ? "text-red-500" :
                index === 1 ? "text-orange-500" :
                index === 2 ? "text-amber-500" :
                "text-muted-foreground",
              ].join(" ")}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="line-clamp-1 break-all text-sm font-black text-[#4a90e2] group-hover:underline"
                  title={hashtag}
                >
                  {hashtag}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  {formatNumber(count)} {count === 1 ? "post" : "posts"}
                </p>
              </div>
              {index < 3 && (
                <span className="text-[9px] bg-[#4a90e2]/10 text-[#4a90e2] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">
                  Hot
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}