'use client';
import type { ProfileRecord, UserRecord } from '@/types';
import { cn } from '@/utils';
import Link from 'next/link';
import { UserLevelBadge } from './user-level-badge';
import { FollowButton } from './ui/FollowerButton';
import { UserModeratorTool } from '@/app/[username]/moderator-tool';
import { ProfileAiAssistance } from '@/app/[username]/ai-assistance';
import { useSession } from './auth-provider';
interface ProfileHeaderProps {
  profile: ProfileRecord;
  user: UserRecord;
  selectedTab?: 'profile' | 'articles';
}

export function ProfileHeader({ selectedTab = 'profile', profile, user }: ProfileHeaderProps) {
  const { session } = useSession();

  return (
    <div className="relative border-b">
      <div className="container relative z-10 mx-auto py-4 flex gap-3">
        <div
          className="w-20 h-20 rounded-xl border-2 border-orange-400 bg-orange-100 overflow-hidden"
          style={
            user.image
              ? {
                  backgroundImage: `url(${user.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        />
        <div className="flex flex-col justify-center">
          <div className="flex gap-2 items-center">
            <h1 className="font-semibold text-lg">{user.name}</h1>
            <UserLevelBadge level={user.level} />
          </div>
          <p className="text-muted-foreground text-sm">{profile.title}</p>
          <p className="text-muted-foreground text-sm font-mono">@{profile.alias}</p>
        </div>
      </div>

      <div className="flex gap-4 container mx-auto text-sm mb-2 items-center">
        <FollowButton defaultFollowed={user.hasCurrentUserFollowed} targetUserId={profile.userId} />

        <div>
          <strong>{user.followersCount}</strong>{' '}
          <span className="text-gray-400 dark:text-gray-500">Followers</span>
        </div>
        <div>
          <strong>{user.followingCount}</strong>{' '}
          <span className="text-gray-400 dark:text-gray-500">Following</span>
        </div>

        <UserModeratorTool user={user} />
        {session?.user.id === profile.userId && <ProfileAiAssistance />}
      </div>

      <nav className="container relative z-10 mx-auto text-sm flex">
        <Link
          href={`/@${profile.alias}`}
          className={cn('p-2 px-4 border-b-4', selectedTab === 'profile' ? 'border-orange-500' : 'border-background')}
        >
          Profile
        </Link>
        <Link
          href={`/@${profile.alias}/articles`}
          className={cn('p-2 px-4 border-b-4', selectedTab === 'articles' ? 'border-orange-500' : 'border-background')}
        >
          Articles
        </Link>
      </nav>
    </div>
  );
}
