import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PenSquare, Tags } from "lucide-react";
import { requireUser } from "@/auth";
import { updatePostAction } from "@/app/posts/actions";
import { PostComposerForm } from "@/components/community/post-composer-form";
import { getEditablePostBySlug, getTagOptions } from "@/lib/community";

type EditPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  description: "编辑自己发布的 OpenClaw 社区帖子。",
  title: "编辑帖子",
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const user = await requireUser(`/posts/${slug}/edit`);
  const { editablePost, isDatabaseReady, tags } = await loadEditPostPageData({
    authorId: user.id,
    slug,
  });

  if (!isDatabaseReady) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
        <section className="rounded-[1.75rem] border border-default bg-surface p-6">
          <p className="text-lg font-semibold text-primary">数据库尚未就绪</p>
          <p className="mt-3 text-sm leading-7 text-secondary">
            请先启动 PostgreSQL，并执行 Prisma migration 与 seed，之后就可以正常编辑社区内容。
          </p>
        </section>
      </div>
    );
  }

  if (!editablePost) {
    notFound();
  }

  if (tags.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
        <section className="rounded-[1.75rem] border border-default bg-surface p-6">
          <p className="text-lg font-semibold text-primary">还没有可选标签</p>
          <p className="mt-3 text-sm leading-7 text-secondary">
            当前数据库中还没有标签数据，请先创建标签后再编辑帖子。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-default bg-surface p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-sm tracking-[0.28em] text-secondary uppercase">
            编辑帖子
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            修改你发布的帖子内容
          </h1>
          <p className="mt-5 text-sm leading-8 text-secondary md:text-base">
            你可以更新标题、正文和标签。保存后会返回帖子详情页，并展示最新内容。
          </p>
        </div>

        <div className="grid gap-5">
          <article className="rounded-[1.75rem] border border-default bg-surface p-6">
            <div className="flex items-center gap-3 text-brand-yellow">
              <PenSquare className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                编辑说明
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-secondary">
              <li>只有帖子作者本人可以进入这个页面。</li>
              <li>保存后会直接返回帖子详情页。</li>
              <li>标题和正文仍然为必填，未选标签时会自动归类到“其他”。</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-default bg-linear-to-br from-brand-yellow-soft via-brand-lobster-soft to-transparent p-6">
            <div className="flex items-center gap-3 text-brand-lobster">
              <Tags className="h-5 w-5" />
              <p className="text-sm font-medium tracking-[0.2em] uppercase">
                当前标签
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-primary">{tags.length}</p>
            <p className="mt-2 text-sm leading-7 text-secondary">
              你可以重新选择已有标签，帖子详情页和列表页会继续展示更新后的归类。
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-[2rem] border border-default bg-surface p-6 md:p-8">
        <PostComposerForm
          action={updatePostAction}
          description="保存成功后会自动返回帖子详情页。"
          hiddenFields={[{ name: "postSlug", value: editablePost.slug }]}
          initialValues={{
            attachments: editablePost.attachments,
            content: editablePost.content,
            tagIds: editablePost.tagIds,
            title: editablePost.title,
          }}
          pendingLabel="正在保存..."
          submitLabel="保存修改"
          tags={tags}
        />
      </section>
    </div>
  );
}

async function loadEditPostPageData(input: { authorId: string; slug: string }) {
  try {
    const [editablePost, tags] = await Promise.all([
      getEditablePostBySlug(input),
      getTagOptions(),
    ]);

    return {
      editablePost,
      isDatabaseReady: true,
      tags,
    };
  } catch (error) {
    console.error("Failed to load edit post page", error);

    return {
      editablePost: null,
      isDatabaseReady: false,
      tags: [],
    };
  }
}
