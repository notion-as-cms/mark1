import { getPageBySlug, getPage, getTags, getPublishedPosts } from "@/lib/notion";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BlogPost } from "@/components/blog/BlogPost";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.results
    .filter((post): post is PageObjectResponse => {
      if (!("properties" in post)) return false;
      const slugProp = post.properties.Slug;
      return (
        slugProp?.type === "rich_text" &&
        Array.isArray(slugProp.rich_text) &&
        slugProp.rich_text.length > 0
      );
    })
    .map((post) => ({
      slug: (post.properties.Slug as any).rich_text[0].plain_text,
    }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPageBySlug(slug);
  const tags = await getTags();
  const recordMap = await getPage(post.id, tags);

  return <BlogPost recordMap={recordMap} />;
}
