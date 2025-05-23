import { Renderer } from "./renderer";
import { TableOfContents } from "./TableOfContents";
import { findPageBlock } from "@/lib/notion-utils";
import Image from "next/image";
import Link from "next/link";
import type { BlogPostProps, Tag } from "@/types/notion";

export function BlogPost({ recordMap }: BlogPostProps) {
  const pageBlock = findPageBlock(recordMap);
  const { tags = [], cover } = recordMap.pageInfo || {};
  const safeTags = (tags as Tag[]) || [];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Cover Image */}
      {cover && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={cover}
            alt="Post cover"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>
      )}

      <div className="px-4">
        {/* Tags */}
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {safeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.value}`}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}

        {/* Table of Contents */}
        <TableOfContents pageBlock={pageBlock} recordMap={recordMap} />

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <Renderer
            recordMap={recordMap}
            fullPage={false}
            darkMode={false}
            showTableOfContents={false}
          />
        </div>
      </div>
    </article>
  );
}
