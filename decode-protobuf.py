import os
import json
import struct
from datetime import datetime

class ProtobufDecoder:
    def __init__(self):
        self.conversation_path = r"C:\Users\janpi\.codeium\windsurf\cascade"
        self.cache_path = os.path.join(os.path.dirname(__file__), '.conversation-cache')
        os.makedirs(self.cache_path, exist_ok=True)

    def extract_strings_from_binary(self, buffer):
        """Extract all readable strings from binary buffer"""
        strings = []
        current = ""

        for i, byte in enumerate(buffer):
            if isinstance(byte, str):
                byte = ord(byte)

            # Printable ASCII or UTF-8 start
            if 32 <= byte <= 126 or byte >= 128:
                current += chr(byte)
            else:
                if len(current) > 5:  # Filter short strings
                    strings.append({
                        'text': current.strip(),
                        'position': i - len(current)
                    })
                current = ""

        return strings

    def try_decode_as_protobuf(self, buffer):
        """Try to decode using basic protobuf parsing"""
        messages = []
        pos = 0

        while pos < len(buffer):
            if pos >= len(buffer):
                break

            # Read field number and wire type
            try:
                key_byte = buffer[pos]
                field_num = key_byte >> 3
                wire_type = key_byte & 0x07
                pos += 1

                if wire_type == 2:  # Length-delimited
                    # Read length
                    length = 0
                    shift = 0
                    while pos < len(buffer) and shift < 32:
                        byte = buffer[pos]
                        length |= (byte & 0x7F) << shift
                        pos += 1
                        if not (byte & 0x80):
                            break
                        shift += 7

                    if length > 0 and length < 100000 and pos + length <= len(buffer):
                        data = buffer[pos:pos + length]

                        # Try UTF-8 decode
                        try:
                            text = data.decode('utf-8')
                            if self.is_readable_text(text):
                                messages.append({
                                    'field': field_num,
                                    'text': text,
                                    'length': length
                                })
                        except UnicodeDecodeError:
                            pass

                        pos += length
                    else:
                        pos += 1
                elif wire_type == 0:  # Varint
                    while pos < len(buffer) and (buffer[pos] & 0x80):
                        pos += 1
                    pos += 1
                elif wire_type == 5:  # 32-bit
                    pos += 4
                elif wire_type == 1:  # 64-bit
                    pos += 8
                else:
                    pos += 1

            except (IndexError, struct.error):
                pos += 1
                continue

        return messages

    def is_readable_text(self, text):
        """Check if text is readable"""
        if len(text) < 5:
            return False

        readable = 0
        for char in text[:100]:
            if char.isprintable():
                readable += 1

        return readable / min(len(text), 100) > 0.7

    def organize_conversation(self, messages):
        """Organize messages into conversation format"""
        conversation = []

        for msg in messages:
            text = msg['text']

            # Try to parse as JSON
            try:
                data = json.loads(text)
                if isinstance(data, dict):
                    role = data.get('role', 'unknown')
                    content = data.get('content', data.get('text', str(data)))

                    conversation.append({
                        'role': role,
                        'content': content,
                        'timestamp': data.get('timestamp', datetime.now().isoformat()),
                        'metadata': data
                    })
                    continue
            except json.JSONDecodeError:
                pass

            # Check for role indicators in text
            role = 'unknown'
            if any(word in text.lower() for word in ['user', 'human', 'you:']):
                role = 'user'
            elif any(word in text.lower() for word in ['assistant', 'cascade', 'ai', 'bot:']):
                role = 'assistant'

            conversation.append({
                'role': role,
                'content': text,
                'timestamp': datetime.now().isoformat(),
                'raw_text': text
            })

        return conversation

    def decode_conversation(self, conversation_id):
        """Decode a single conversation"""
        pb_file = os.path.join(self.conversation_path, f"{conversation_id}.pb")
        cache_file = os.path.join(self.cache_path, f"{conversation_id}.json")

        # Check cache
        if os.path.exists(cache_file):
            cache_mtime = os.path.getmtime(cache_file)
            pb_mtime = os.path.getmtime(pb_file)
            if cache_mtime > pb_mtime:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)

        if not os.path.exists(pb_file):
            raise FileNotFoundError(f"Conversation file not found: {pb_file}")

        # Read and decode
        with open(pb_file, 'rb') as f:
            buffer = f.read()

        # Try different decoding methods
        messages = self.try_decode_as_protobuf(buffer)

        # If protobuf parsing fails, fall back to string extraction
        if not messages:
            strings = self.extract_strings_from_binary(buffer)
            messages = [{'field': 0, 'text': s['text'], 'length': len(s['text'])} for s in strings]

        # Organize into conversation
        conversation = self.organize_conversation(messages)

        result = {
            'id': conversation_id,
            'metadata': {
                'file_size': len(buffer),
                'decoded_at': datetime.now().isoformat(),
                'message_count': len(conversation)
            },
            'messages': conversation
        }

        # Cache result
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        return result

    def list_conversations(self):
        """List all conversations"""
        conversations = []

        for filename in os.listdir(self.conversation_path):
            if filename.endswith('.pb'):
                filepath = os.path.join(self.conversation_path, filename)
                stats = os.stat(filepath)
                conv_id = filename[:-3]  # Remove .pb

                conversations.append({
                    'id': conv_id,
                    'timestamp': datetime.fromtimestamp(stats.st_mtime),
                    'size': stats.st_size,
                    'filepath': filepath
                })

        return sorted(conversations, key=lambda x: x['timestamp'], reverse=True)

    def read_last_conversations(self, count=20):
        """Read last N conversations"""
        conversations = self.list_conversations()[:count]
        results = []

        for conv in conversations:
            try:
                decoded = self.decode_conversation(conv['id'])
                results.append({
                    **conv,
                    'decoded': decoded
                })
            except Exception as e:
                print(f"Failed to decode {conv['id']}: {e}")

        return results

    def format_conversation(self, conversation):
        """Format conversation for display"""
        output = f"# Conversation {conversation['id']}\n"
        output += f"Date: {conversation['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}\n"
        output += f"Size: {conversation['size']} bytes\n\n"

        if 'decoded' in conversation and conversation['decoded']['messages']:
            for msg in conversation['decoded']['messages']:
                output += f"## {msg['role'].upper()}\n"
                output += f"{msg['content']}\n\n"
        else:
            output += "No readable content found\n\n"

        return output

if __name__ == "__main__":
    import sys

    decoder = ProtobufDecoder()

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python decode-protobuf.py list")
        print("  python decode-protobuf.py read <conversation-id>")
        print("  python decode-protobuf.py last <count>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "list":
        conversations = decoder.list_conversations()
        print("Conversations (newest first):")
        for i, conv in enumerate(conversations, 1):
            print(f"{i}. {conv['id']} - {conv['timestamp'].strftime('%Y-%m-%d %H:%M:%S')} ({conv['size']} bytes)")

    elif command == "read" and len(sys.argv) > 2:
        conv_id = sys.argv[2]
        decoded = decoder.decode_conversation(conv_id)
        print(json.dumps(decoded, indent=2, ensure_ascii=False))

    elif command == "last" and len(sys.argv) > 2:
        count = int(sys.argv[2]) if sys.argv[2].isdigit() else 20
        conversations = decoder.read_last_conversations(count)

        for conv in conversations:
            print(decoder.format_conversation(conv))
            print("---\n")

    else:
        print("Invalid command")
        print("Usage:")
        print("  python decode-protobuf.py list")
        print("  python decode-protobuf.py read <conversation-id>")
        print("  python decode-protobuf.py last <count>")
