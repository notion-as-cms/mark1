import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/blog/pagination";

export type BlogPost = {
  id: string;
  url: string;
  data: {
    title: string;
    description: string;
    date: string;
    author?: string;
    tags?: string[];
  };
};

type BlogConfiguration = {
  pageSize?: number;
  basePath?: string;
};

type PostListProps = {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  heading?: string;
  description?: string;
  basePath?: string;
  disablePagination?: boolean;
  configuration?: BlogConfiguration;
};

export function PostList({
  posts,
  currentPage,
  totalPages,
  heading = "Blog Posts",
  description = "Discover the latest insights and tutorials about modern web development, UI design, and component-driven architecture.",
  basePath = "/blog",
  disablePagination = false,
  configuration = {},
}: PostListProps) {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{heading}</h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        )}
      </section>

      <section className="space-y-12">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      {!disablePagination && totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath || "/blog"}
          />
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group grid gap-8 md:grid-cols-2 md:gap-8 lg:gap-12">
      <div className="order-last md:order-first">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.data.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-3 group-hover:underline">
          <Link href={post.url}>{post.data.title}</Link>
        </h2>
        <p className="text-muted-foreground mb-4">{post.data.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>{post.data.author || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.data.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </div>
          <Link
            href={post.url}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Read more
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Link href={post.url} className="block h-full w-full">
          <img
            src={`https://picsum.photos/800/450?random=${post.id}&grayscale`}
            alt={post.data.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>
    </article>
  );
}

// Pagination component is now imported from ./pagination
