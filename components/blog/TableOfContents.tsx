import { getPageTableOfContents } from "notion-utils";
import type { ExtendedRecordMap, PageBlock } from "notion-types";

interface TableOfContentsProps {
  pageBlock: PageBlock | null;
  recordMap: ExtendedRecordMap;
}

export function TableOfContents({ pageBlock, recordMap }: TableOfContentsProps) {
  if (!pageBlock) return null;
  
  const tableOfContents = getPageTableOfContents(pageBlock, recordMap);
  if (tableOfContents.length === 0) return null;

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
      <ul className="space-y-1">
        {tableOfContents.map((item, index) => {
          if (!item?.id || !item?.text) return null;
          
          return (
            <li
              key={index}
              style={{ paddingLeft: `${(item.indentLevel || 0) * 16}px` }}
            >
              <a
                href={`#${item.id}`}
                className="text-blue-600 hover:underline"
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
