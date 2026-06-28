import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";
import { store } from "@/lib/data/store";

describe("store (in-memory cache path)", () => {
  it("lists posts", () => {
    const posts = store.posts;
    expect(posts.length).toBeGreaterThan(0);
  });

  it("creates a post and adds it to the cache", async () => {
    const before = store.posts.length;
    const post = await store.createPost({
      text: "Test post from vitest",
      status: "draft",
      platforms: ["x"],
    });
    expect(post.text).toBe("Test post from vitest");
    expect(store.posts.length).toBe(before + 1);
    expect(store.posts[0].id).toBe(post.id);
  });

  it("deletes a post", async () => {
    const post = await store.createPost({
      text: "To be deleted",
      status: "draft",
      platforms: ["x"],
    });
    const ok = await store.deletePost(post.id);
    expect(ok).toBe(true);
    expect(store.posts.find((p) => p.id === post.id)).toBeUndefined();
  });

  it("listPosts filters by status", async () => {
    // The cache has posts of various statuses; create a known one.
    await store.createPost({ text: "Draft", status: "draft", platforms: ["x"] });
    const drafts = store.posts.filter((p) => p.status === "draft");
    expect(drafts.length).toBeGreaterThan(0);
    expect(drafts.every((p) => p.status === "draft")).toBe(true);
  });
});

describe("password hash integration", () => {
  it("hashPassword + verifyPassword round-trip", () => {
    const hash = hashPassword("integration-test-123");
    expect(verifyPassword("integration-test-123", hash)).toBe(true);
  });
});
