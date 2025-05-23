// lib/notion.ts
import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";
import {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const notionCustom = new NotionCompatAPI(notion);

export interface PageInfo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lastEditedAt: string;
  cover?: string;
  icon?: string | null;
}

export const getPage = async (pageId: string, allTags?: Tag[]) => {
  const recordMap = await notionCustom.getPage(pageId);
  const rawPage = (recordMap as any).raw?.page;
  const properties = rawPage?.properties || {};

  // Extract common page properties
  const pageInfo: PageInfo = {
    id: rawPage?.id || '',
    title: properties?.Name?.title?.[0]?.plain_text || 'No title',
    description: properties?.Description?.rich_text?.[0]?.plain_text || '',
    createdAt: rawPage?.created_time || '',
    lastEditedAt: rawPage?.last_edited_time || '',
    cover: rawPage?.cover?.type === 'external' 
      ? rawPage.cover.external.url 
      : rawPage?.cover?.file?.url,
    icon: rawPage?.icon?.type === 'emoji' 
      ? rawPage.icon.emoji 
      : rawPage?.icon?.file?.url || null
  };

  // Process tags if provided
  let blogTags: Tag[] = [];
  if (rawPage && allTags) {
    const tagIds = properties?.Tags?.relation?.map((r: any) => r.id) || [];
    blogTags = allTags.filter(tag => tagIds.includes(tag.id));
  }

  return {
    ...recordMap,
    blogTags,
    pageInfo,
    raw: {
      ...(recordMap as any).raw,
      page: rawPage,
    },
  } as typeof recordMap & {
    blogTags: Tag[];
    pageInfo: PageInfo;
    raw: {
      page: PageObjectResponse;
    };
  };
};

export interface Tag {
  id: string;
  value: string;
  label: string;
}

export async function getTags(): Promise<Tag[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_TAG_DATABASE_ID!,
  });

  return response.results.map((page: any) => ({
    id: page.id,
    value: page.properties.Slug.rich_text[0]?.plain_text || "",
    label: page.properties.Name.title[0]?.plain_text || "",
  }));
}

export async function getPublishedPosts() {
  return notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID!,
    filter: {
      property: "Published",
      status: { equals: "Done" },
    },
  });
}

export async function getPageBySlug(slug: string) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID!,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
  });
  return response.results[0];
}

export interface PageInfo {
  title: string;
}

export function getPageInfo(page: PageObjectResponse): PageInfo {
  const info: PageInfo = { title: "unknown" };
  const keys = Object.keys(page.properties);

  for (const key of keys) {
    if (page.properties[key].type === "title") {
      info.title = getPlainText(page.properties[key].title);
    }
  }

  return info;
}

export function getPlainText(rich: RichTextItemResponse[]): string {
  return rich.map((v) => v.plain_text).join();
}
