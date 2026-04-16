# /conversations - Windsurf Conversation Access

**Purpose:** Access and read Windsurf conversations stored in protobuf format

## Usage

### List Conversations
```bash
node conversation-reader.cjs list
```
Lists all conversations with IDs, dates, and sizes

### Read Last N Conversations
```bash
node conversation-reader.cjs last 20
```
Shows the last 20 conversations (newest first)

### Export Conversation for Manual Decoding
```bash
node conversation-reader.cjs export <conversation-id>
```
Exports the conversation file to `conversation-exports/` folder with batch script for decoding

### Search Conversations
```bash
node conversation-reader.cjs search <query>
```
Search by conversation ID or date

### Create Index
```bash
node conversation-reader.cjs index
```
Creates a JSON index of all conversations

### Statistics
```bash
node conversation-reader.cjs stats
```
Shows conversation statistics

## Manual Decoding

For full conversation content:
1. Export the conversation: `node conversation-reader.cjs export <id>`
2. Run the generated batch script in `conversation-exports/`
3. Or use the web decoder at https://protobuf-decoder.netlify.app/

## Examples

```bash
# Read last 20 conversations
node conversation-reader.cjs last 20

# Export a specific conversation
node conversation-reader.cjs export d0b0294b-a255-4c0f-9e5f-90bf45ad6035

# Search for conversations from today
node conversation-reader.cjs search "14.04.2026"
```
