"use client";

import { useEffect } from "react";

type PostViewTrackerProps = {
  postId: string;
};

export function PostViewTracker({ postId }: PostViewTrackerProps) {
  useEffect(() => {
    let isCancelled = false;

    async function trackPostView() {
      try {
        const response = await fetch(`/api/posts/${postId}/view`, {
          cache: "no-store",
          keepalive: true,
          method: "POST",
        });

        if (!response.ok && !isCancelled) {
          console.error("Failed to track post view");
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to track post view", error);
        }
      }
    }

    void trackPostView();

    return () => {
      isCancelled = true;
    };
  }, [postId]);

  return null;
}
