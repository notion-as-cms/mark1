// lib/notion.ts
import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";
import {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const notionCustom = new NotionCompatAPI(notion);

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
