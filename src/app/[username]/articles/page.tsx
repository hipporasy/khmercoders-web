import { getSession } from '@/app/session';
import { getProfileFromUsernameCache } from '@/server/cache/user';
import { ProfileTrackingComponent } from '../tracker';
import { ProfileHeader } from '@/components/profile-header';
import { getDB } from '@/libs/db';
import { ArticlePreviewItem } from '@/components/article-item';
import { bindingArticleListLikeStatus } from '@/server/services/article';
import { MainLayout } from '@/components/blocks/layout/MainLayout';
import { bindingFollowerStatusFromUser } from '@/server/services/followers';

export default async function UserArticleListPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { session } = await getSession();
  const profile = await getProfileFromUsernameCache(username);

  profile.user = session?.user?.id
    ? await bindingFollowerStatusFromUser(profile.user, session.user.id)
    : profile.user;

  // Getting all the article
  const db = await getDB();

  const isOwner = profile.user.id === session?.user.id;

  const articles = await bindingArticleListLikeStatus(
    await db.query.article.findMany({
      where: (article, { eq, and }) =>
        isOwner
          ? and(eq(article.userId, profile.user.id))
          : and(eq(article.userId, profile.user.id), eq(article.published, true)),
      columns: {
        id: true,
        title: true,
        summary: true,
        image: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        userId: true,
        likeCount: true,
        approvedByAI: true,
        commentCount: true,
        viewCount: true,
        reviewStatus: true,
        reviewBy: true,
      },
      with: {
        user: {
          with: {
            profile: {},
          },
        },
      },
      orderBy: (article, { desc }) => desc(article.updatedAt),
    }),
    session?.user?.id
  );

  return (
    <MainLayout>
      <ProfileTrackingComponent userId={profile.user.id} />
      <ProfileHeader user={profile.user} profile={profile.member_profile} selectedTab="articles" />

      {articles.length === 0 && <EmptyArticleState />}

      {articles.length > 0 && (
        <div className="mx-auto mb-12 flex flex-col gap-4">
          {articles.map(article => (
            <ArticlePreviewItem key={article.id} data={article} showControlPanel={isOwner} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

function EmptyArticleState() {
  return (
    <div className="text-center py-12 px-4 rounded-lg border border-dashed border-gray-300 bg-secondary max-w-4xl mx-auto my-8">
      <svg
        className="mx-auto h-16 w-16 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v10m2 4h-6m-2-4v4m0 0H9m2 0h4"
        />
      </svg>
      <h2 className="text-xl font-semibold mb-2">No Articles Found</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        This user hasn&apos;t published any articles yet. Check back later for new content.
      </p>
    </div>
  );
}
