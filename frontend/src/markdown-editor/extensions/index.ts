import { HorizontalRuleExtension } from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { LinkExtension } from "@lexical/link";
import { ListExtension } from "@lexical/list";
import { RichTextExtension } from "@lexical/rich-text";
import { TableExtension } from "@lexical/table";
import { defineExtension } from "lexical";
import { CodePrismExtension } from "./CodePrism";
import { ImageExtension } from "./Image";
import { KatexExtension } from "./Katex";
import { ThemeExtension } from "./Theme";

export const MarkdownEditorExtension = defineExtension({
  name: "@scilog/lexical-markdown-editor",
  namespace: "@scilog/lexical-markdown-editor",
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    LinkExtension,
    TableExtension,
    HorizontalRuleExtension,
    ImageExtension,
    KatexExtension,
    CodePrismExtension,
    ThemeExtension,
  ],
});

export { createTransformers } from "./transformers.ts";
