/**
 * MemoizedMarkdown Component
 * 
 * This component optimizes Markdown rendering performance by:
 * 1. Parsing Markdown into discrete blocks
 * 2. Memoizing individual blocks to prevent unnecessary re-renders
 * 3. Only updating blocks that have actually changed
 * 
 * This significantly improves performance, especially for long conversations
 * with streaming responses.
 */

import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';

/**
 * Parse a markdown string into an array of block tokens
 * @param markdown The markdown string to parse
 * @returns Array of raw markdown blocks
 */
function parseMarkdownIntoBlocks(markdown: string): string[] {
  console.debug(`🟠 [MemoizedMarkdown] markdown:`, markdown, null, 2);
  const tokens = marked.lexer(markdown);
  console.debug(`🟠 [MemoizedMarkdown] tokens:`, tokens, null, 2);
  return tokens.map(token => token.raw);
}

/**
 * Custom components to override default markdown rendering.
 * Ensures that <pre> blocks have horizontal scrolling for overflow.
 */
const customMarkdownComponents: Components = {
  pre: ({ node, ...props }) => (
    <pre {...props} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} />
  ),
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
};

/**
 * Memoized component that renders a single markdown block
 * Only re-renders if the content actually changes
 */
const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <div className="prose prose-invert prose-sm max-w-none text-xs">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkBreaks]} 
          rehypePlugins={[rehypeRaw]}
          components={customMarkdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if content changes
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

/**
 * Memoized Markdown component that parses and renders markdown content
 * with optimized performance
 */
export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    // Parse markdown into blocks, memoized based on content
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock 
            content={block} 
            key={`${id}-block_${index}`} 
          />
        ))}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

export default MemoizedMarkdown; 