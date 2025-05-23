import { Tag } from "@/lib/notion";

type NotionPage = {
  id: string;
  properties: {
    Name?: {
      title: Array<{ plain_text: string }>;
    };
    Description?: {
      rich_text: Array<{ plain_text: string }>;
    };
    Slug?: {
      rich_text: Array<{ plain_text: string }>;
    };
    Date?: {
      date: { start: string };
    };
    Author?: {
      people: Array<{ name: string }>;
    };
    Tags?: {
      relation: Array<{ id: string }>;
    };
    [key: string]: any;
  };
};

export function isNotionPage(page: any): page is NotionPage {
  return page && typeof page === "object" && "properties" in page;
}

export function mapNotionPostToBlogPost(post: any, tags: Tag[] = []) {
  if (!isNotionPage(post)) return null;

  const tagIds = post.properties.Tags?.relation?.map((r: any) => r.id) || [];
  const postTags = tags
    .filter(tag => tagIds.includes(tag.id))
    .map(tag => tag.label);

  return {
    id: post.id,
    url: `/blog/${post.properties.Slug?.rich_text?.[0]?.plain_text || post.id}`,
    data: {
      title: post.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      description: post.properties.Description?.rich_text?.[0]?.plain_text || '',
      date: post.properties.Date?.date?.start || new Date().toISOString(),
      author: post.properties.Author?.people?.[0]?.name || undefined,
      tags: postTags,
    },
  };
}
