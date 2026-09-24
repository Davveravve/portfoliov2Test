import type { PostType, ProjectStatus } from "@/db/schema";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  prototype: "Prototype",
  in_development: "In development",
  released: "Released",
  on_hold: "On hold",
  archived: "Archived",
};

export const POST_TYPE_LABEL: Record<PostType, string> = {
  devlog: "Devlog",
  milestone: "Milestone",
  release: "Release",
  showcase: "Showcase",
};
