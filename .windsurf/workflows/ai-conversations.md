# AI Conversation Access Workflow

**Purpose:** Enable the AI to directly access and retrieve Windsurf conversations

## AI Commands

### Get Last N Conversations
```javascript
const AIConversationInterface = require('./ai-conversation-interface.cjs');
const interface = new AIConversationInterface();
const result = await interface.getLastConversations(10);
console.log(interface.formatResponse(result));
```

### Get Specific Conversation
```javascript
const AIConversationInterface = require('./ai-conversation-interface.cjs');
const interface = new AIConversationInterface();
const result = await interface.getConversationById('d0b0294b-a255-4c0f-9e5f-90bf45ad6035');
console.log(interface.formatResponse(result));
```

### Search Conversations
```javascript
const AIConversationInterface = require('./ai-conversation-interface.cjs');
const interface = new AIConversationInterface();
const result = await interface.searchConversations('redis');
console.log(interface.formatResponse(result));
```

### Get Statistics
```javascript
const AIConversationInterface = require('./ai-conversation-interface.cjs');
const interface = new AIConversationInterface();
const result = await interface.getStats();
console.log(interface.formatResponse(result));
```

## Current Capabilities

- **List conversations** with dates, sizes, and previews
- **Search by ID, date, or content** (basic)
- **Get conversation metadata** (not full content due to encoding)
- **Generate statistics** about conversation storage

## Limitations

- Conversations are stored in compressed/encoded protobuf format
- Full content extraction requires manual decoding
- Currently provides metadata and basic previews only

## Usage Examples

1. "Show me the last 10 conversations"
2. "Find conversations about Redis"
3. "Get conversation d0b0294b-a255-4c0f-9e5f-90bf45ad6035"
4. "What are my conversation statistics?"
