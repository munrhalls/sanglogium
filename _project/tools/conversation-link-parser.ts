/**
 * Conversation Link Parser
 *
 * Parses @[conversation:"Title"] syntax and extracts conversation metadata
 * Based on research from _project/research/windsurf-conversation-link-syntax.md
 */

export interface ConversationLink {
  syntax: string;           // Original @[conversation:"Title"] syntax
  title: string;            // Extracted title
  id?: string;              // UUID (if available from metadata)
  type: "Conversation";     // Type indicator
}

export interface ConversationMetadata {
  id: string;               // UUID
  title: string;            // Human-readable title
  syntax: string;           // Full @[conversation:"..."] syntax
}

/**
 * Parse @[conversation:"Title"] syntax from text
 */
export function parseConversationLinks(text: string): ConversationLink[] {
  const conversationRegex = /@\[conversation:"([^"]+)"\]/g;
  const matches = text.matchAll(conversationRegex);

  return Array.from(matches, match => ({
    syntax: match[0],
    title: match[1],
    type: "Conversation" as const
  }));
}

/**
 * Parse conversation metadata from additional_metadata section
 */
export function parseConversationMetadata(metadata: { items?: Array<{ type: string; id: string; title: string }> }): ConversationMetadata[] {
  if (!metadata || !metadata.items) return [];

  return metadata.items
    .filter(item => item.type === "Conversation")
    .map(item => ({
      id: item.id,
      title: item.title,
      syntax: `@[conversation:"${item.title}"]`
    }));
}

/**
 * Create mapping from conversation titles to UUIDs
 */
export function createConversationMap(metadata: { items?: Array<{ type: string; id: string; title: string }> }): Record<string, string> {
  const conversations = parseConversationMetadata(metadata);
  const map: Record<string, string> = {};

  conversations.forEach(conv => {
    map[conv.title] = conv.id;
  });

  return map;
}

/**
 * Enrich parsed links with UUIDs from metadata
 */
export function enrichConversationLinks(
  text: string,
  metadata: { items?: Array<{ type: string; id: string; title: string }> }
): (ConversationLink & { id: string })[] {
  const links = parseConversationLinks(text);
  const idMap = createConversationMap(metadata);

  return links.map(link => ({
    ...link,
    id: idMap[link.title] || ""
  })).filter(link => link.id); // Only return links with valid IDs
}

/**
 * Extract all conversation IDs from text
 */
export function extractConversationIds(text: string, metadata: { items?: Array<{ type: string; id: string; title: string }> }): string[] {
  const enrichedLinks = enrichConversationLinks(text, metadata);
  return enrichedLinks.map(link => link.id);
}

/**
 * Format conversation for prompts_log.txt
 */
export function formatConversationForLog(
  conversation: ConversationLink & { id: string },
  content?: string
): string {
  const timestamp = new Date().toISOString();
  const header = `\n\n=== ${conversation.title} ===\nID: ${conversation.id}\nTimestamp: ${timestamp}\n`;

  if (content) {
    return `${header}\n${content}\n`;
  }

  return `${header}\n[Content not accessible - see research document for access methods]\n`;
}
