export interface BlogAuthor {
  name: string;
  role: string;
  image: string;
}

export interface BlogBlock {
  headingType: string;
  contentType: string;
  heading: string;
  content: string | string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  blocks?: BlogBlock[];
  image: string;
  author: BlogAuthor;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

export interface BlogData {
  blogs: BlogPost[];
  categories: string[];
}

// Empty blog data - all blogs are now loaded from JSON files
const embeddedBlogData: BlogData = {
  blogs: [],
  categories: []
};

export function getBlogData(): BlogData {
  return embeddedBlogData;
}
