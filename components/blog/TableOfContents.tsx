import { getPageTableOfContents } from "notion-utils";

interface TableOfContentsItem {
  id: string;
  text: string;
  indentLevel: number;
}

export type TOCItemType = {
  title: React.ReactNode;
  url: string;
  depth: number;
};

export type TableOfContents = TOCItemType[];

export function convertToTOC(items: TableOfContentsItem[]): TableOfContents {
  return items
    .filter((item): item is TableOfContentsItem => !!item?.id && !!item?.text)
    .map((item) => ({
      title: item.text,
      url: `#${item.id}`,
      depth: item.indentLevel || 0,
    }));
}

export function TableOfContents({ pageBlock, recordMap }: { pageBlock: any, recordMap: any }) {
  if (!pageBlock || !recordMap) return null;
  
  try {
    const tableOfContents = getPageTableOfContents(pageBlock, recordMap);
    if (!tableOfContents || tableOfContents.length === 0) return null;

    const items = convertToTOC(tableOfContents);

    return (
      <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="text-sm font-medium mb-4 text-foreground">On This Page</h3>
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li
              key={index}
              style={{ marginLeft: `${item.depth * 12}px` }}
              className="truncate"
            >
              <a
                href={item.url}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error('Error rendering table of contents:', error);
    return null;
  }
}
