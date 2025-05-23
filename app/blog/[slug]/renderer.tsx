"use client";
import { NotionRenderer } from "react-notion-x";
import type { ComponentProps } from "react";

export function Renderer(props: ComponentProps<typeof NotionRenderer>) {
  return <NotionRenderer {...props} />;
}
