import { getPageTableOfContents } from "notion-utils";
import type { TableOfContentsProps } from "@/types/notion";

export function TableOfContents({ pageBlock, recordMap }: TableOfContentsProps) {
  if (!pageBlock || !recordMap) return null;
  
  try {
    const tableOfContents = getPageTableOfContents(pageBlock, recordMap);
    if (!tableOfContents || tableOfContents.length === 0) return null;

    return (
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
        <ul className="space-y-1">
          {tableOfContents.map((item, index) => {
            if (!item?.id || !item?.text) return null;
            
            return (
              <li
                key={`${item.id}-${index}`}
                style={{ paddingLeft: `${(item.indentLevel || 0) * 16}px` }}
                className="text-sm"
              >
                <a
                  href={`#${item.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  } catch (error) {
    console.error('Error rendering table of contents:', error);
    return null;
  }
}
