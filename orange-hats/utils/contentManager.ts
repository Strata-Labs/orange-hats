import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { Research } from "@prisma/client";
import { ResearchPostWithContent } from "@/components/blog/ResearchList.tsx";

export class ContentManager {
  private readonly contentDir: string;

  constructor() {
    this.contentDir = path.join(process.cwd(), "content", "research");
  }

  private async ensureDirectories() {
    try {
      await fs.access(this.contentDir);
    } catch (error) {
      await fs.mkdir(this.contentDir, { recursive: true });
    }
  }

  private formatDate(date: Date | string): Date {
    const d = new Date(date);
    d.setUTCHours(12, 0, 0, 0);
    return d;
  }

  private generateFileName(research: Research): string {
    const date = this.formatDate(research.publishedAt);
    const formattedDate = date.toISOString().split("T")[0];
    const sanitizedSlug = research.slug.replace(/[^a-zA-Z0-9-]/g, "-");
    return `${formattedDate}-${sanitizedSlug}.mdx`;
  }

  private generateFrontMatter(research: Research): string {
    const date = this.formatDate(research.publishedAt);
    const formattedDate = date.toISOString().split("T")[0];

    const frontMatter = {
      title: research.title,
      protocol: research.protocol,
      type: research.type,
      description: research.description,
      publishedAt: formattedDate,
      slug: research.slug,
      id: research.id,
      jekyllUrl: research.jekyllUrl,
      createdAt: research.createdAt.toISOString(),
      updatedAt: research.updatedAt.toISOString(),
    };

    return matter.stringify(research.description || "", frontMatter);
  }

  private generateUrl(date: Date | string, slug: string): string {
    const d = this.formatDate(date);
    return `/research/${d.getUTCFullYear()}/${String(
      d.getUTCMonth() + 1
    ).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${slug}`;
  }

  async createPost(research: Research): Promise<string> {
    try {
      await this.ensureDirectories();

      const fileName = this.generateFileName(research);
      const filePath = path.join(this.contentDir, fileName);
      const content = this.generateFrontMatter(research);

      await fs.writeFile(filePath, content, "utf-8");

      const url = this.generateUrl(research.publishedAt, research.slug);
      return url;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  }

  async updatePost(research: Research): Promise<string> {
    try {
      await this.ensureDirectories();

      const files = await fs.readdir(this.contentDir);
      const oldFile = files.find((file) => file.includes(research.slug));

      if (oldFile) {
        const oldFilePath = path.join(this.contentDir, oldFile);
        await fs.unlink(oldFilePath);
      }

      return this.createPost(research);
    } catch (error) {
      console.error("Failed to update post:", error);
      throw error;
    }
  }

  async deletePost(slug: string): Promise<void> {
    try {
      await this.ensureDirectories();

      const files = await fs.readdir(this.contentDir);
      const file = files.find((f) => f.includes(slug));

      if (file) {
        const filePath = path.join(this.contentDir, file);
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  }

  async getAllPosts(): Promise<ResearchPostWithContent[]> {
    try {
      await this.ensureDirectories();

      const files = await fs.readdir(this.contentDir);
      const posts = await Promise.all(
        files.map(async (fileName) => {
          const filePath = path.join(this.contentDir, fileName);
          const content = await fs.readFile(filePath, "utf-8");
          const { data, content: postContent } = matter(content);

          return {
            ...data,
            content: postContent,
          } as ResearchPostWithContent;
        })
      );

      return posts.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error("Failed to get posts:", error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<ResearchPostWithContent> {
    try {
      await this.ensureDirectories();

      const files = await fs.readdir(this.contentDir);
      const fileName = files.find((f) => f.includes(slug));

      if (!fileName) {
        throw new Error(`Post with slug ${slug} not found`);
      }

      const filePath = path.join(this.contentDir, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      const { data, content: postContent } = matter(content);

      return {
        ...data,
        content: postContent,
      } as ResearchPostWithContent;
    } catch (error) {
      console.error("Failed to get post:", error);
      throw error;
    }
  }
}
