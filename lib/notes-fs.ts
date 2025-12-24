// lib/notes-fs.ts
import "server-only";

import path from "node:path";
import fs from "node:fs/promises";
import { cache } from "react";

/**
 * Markdown 笔记根目录：content/notes/**
 * 约定：slugKey = "Go/generics" 对应文件 content/notes/Go/generics.md
 */
const NOTES_DIR = path.join(process.cwd(), "content", "notes");

/**
 * 把用户传入的 slugParts 规范化为安全、稳定、可缓存命中的 slugKey
 * - decodeURIComponent：支持 URL 中的中文/空格等
 * - 统一分隔符为 "/"（Windows 也一致）
 * - 去掉空段、"."、".."、以及包含 ".." 的段
 * - 禁止绝对路径、盘符等（防穿越）
 */
function normalizeSlugParts(slugParts: string[]): string {
  if (!Array.isArray(slugParts)) {
    throw new Error("Invalid slugParts: expected array");
  }
  
  const decoded = slugParts.map((p) => {
    // decode 出错时不崩，直接用原字符串
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  });

  const cleaned = decoded
    .map((p) => p.replace(/\\/g, "/").trim())
    .filter((p) => p.length > 0)
    .filter((p) => p !== "." && p !== ".." && !p.includes(".."))
    .filter((p) => !p.startsWith("/")) // 禁止绝对路径
    .filter((p) => !/^[A-Za-z]:/.test(p)); // 禁止 Windows 盘符，如 C:\

  // 统一 key：去掉重复斜杠
  const slugKey = cleaned.join("/").replace(/\/+/g, "/");

  return slugKey;
}

/**
 * 根据 slugKey 生成目标 md 文件绝对路径
 * 并做强校验：最终路径必须在 NOTES_DIR 内（防止 path.join + ../ 绕过）
 */
function resolveNotePath(slugKey: string): string {
  // 例如：NOTES_DIR + "Go/generics.md"
  const target = path.resolve(NOTES_DIR, `${slugKey}.md`);
  const root = path.resolve(NOTES_DIR);

  // 关键：必须在 root 内
  // 注意：root + path.sep 用于避免 /notesX 被误判
  if (!target.startsWith(root + path.sep)) {
    throw new Error("Invalid note path");
  }

  return target;
}

/**
 * ✅ 真正缓存的 IO 函数
 * cache 的关键：参数必须是稳定 primitive（string），不能直接用数组
 */
const readNoteByKey = cache(async (slugKey: string) => {
  const fullPath = resolveNotePath(slugKey);

  // 先确认文件存在且可读，错误信息更清晰
  try {
    const st = await fs.stat(fullPath);
    if (!st.isFile()) {
      throw new Error("Not a file");
    }
  } catch {
    // 这里不要泄露真实文件系统路径给前端
    throw new Error(`Note not found: ${slugKey}`);
  }

  const content = await fs.readFile(fullPath, "utf8");

  return {
    slugKey,
    fullPath, // 仅 server 侧调试用（你也可以选择不返回）
    content,
  };
});

/**
 * 入口函数：给 page.tsx 用
 * - 接收 [...slug] 的 params.slug（数组）
 * - 统一转成稳定 slugKey
 * - 命中 cache 读取内容
 */
export async function getNoteMarkdownBySlug(slugParts: string[]) {
  const slugKey = normalizeSlugParts(slugParts);

  // slug 为空直接报错，避免读取 notes/.md
  if (!slugKey) {
    throw new Error("Invalid slug");
  }

  return readNoteByKey(slugKey);
}

/**
 * 获取所有笔记的 slugKey 列表，用于生成静态参数
 */
export async function getAllNotesSlugs(): Promise<string[]> {
  const slugs: string[] = [];

  async function walkDir(dir: string, prefix: string = "") {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const slug = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          await walkDir(fullPath, slug);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          // 移除 .md 后缀
          const slugKey = slug.replace(/\.md$/, "");
          slugs.push(slugKey);
        }
      }
    } catch (err) {
      // 目录读取失败则跳过
      console.error("Error reading directory:", dir, err);
    }
  }

  await walkDir(NOTES_DIR);
  return slugs;
}
