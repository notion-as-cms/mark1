import { Renderer } from "@/app/blog/[slug]/renderer";
import type { ExtendedRecordMap } from "notion-types";
import { TableOfContents } from "./TableOfContents";
import { findPageBlock } from "@/lib/notion-utils";

interface BlogPostProps {
  recordMap: ExtendedRecordMap;
}

export function BlogPost({ recordMap }: BlogPostProps) {
  const pageBlock = findPageBlock(recordMap);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-red-50">
      <TableOfContents pageBlock={pageBlock} recordMap={recordMap} />
      <Renderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        showTableOfContents={false}
      />
    </div>
  );
}
