import fs from "fs/promises";
import path from "path";
import { Research } from "@prisma/client";

export class JekyllManager {
  private readonly postsDir: string;

  constructor() {
    this.postsDir = path.join(process.cwd(), "research-blog", "_posts");
  }

  private async ensureDirectories() {
    try {
      await fs.access(this.postsDir);
    } catch (error) {
      await fs.mkdir(this.postsDir, { recursive: true });
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
    return `${formattedDate}-${sanitizedSlug}.md`;
  }

  private generatePostContent(research: Research): string {
    const date = this.formatDate(research.publishedAt);
    const formattedDate = date.toISOString().split("T")[0];

    return `---
layout: post
title: "${research.title}"
protocol: "${research.protocol}"
type: "${research.type}"
description: "${research.description}"
date: ${formattedDate}
slug: ${research.slug}
---

${research.description}
`;
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

      console.log("Posts directory:", this.postsDir);
      console.log("Creating post with data:", {
        ...research,
        publishedAt: this.formatDate(research.publishedAt),
      });

      const fileName = this.generateFileName(research);
      const filePath = path.join(this.postsDir, fileName);
      const content = this.generatePostContent(research);

      await fs.writeFile(filePath, content, "utf-8");

      const jekyllUrl = this.generateUrl(research.publishedAt, research.slug);

      console.log("Post created successfully:", {
        filePath,
        fileName,
        jekyllUrl,
        formattedDate: this.formatDate(research.publishedAt).toISOString(),
      });

      return jekyllUrl;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  }

  async updatePost(research: Research): Promise<string> {
    try {
      await this.ensureDirectories();

      const files = await fs.readdir(this.postsDir);
      const oldFile = files.find((file) => file.includes(research.slug));

      if (oldFile) {
        const oldFilePath = path.join(this.postsDir, oldFile);
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

      const files = await fs.readdir(this.postsDir);
      const file = files.find((f) => f.includes(slug));

      if (file) {
        const filePath = path.join(this.postsDir, file);
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  }
}
