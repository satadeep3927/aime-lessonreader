import { Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Style = Record<string, any>;

const ms = StyleSheet.create({
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique" },
  boldItalic: { fontFamily: "Helvetica-BoldOblique" },
  code: { fontFamily: "Courier", fontSize: 10, backgroundColor: "#f0f0f0" },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bulletChar: { width: 14, color: "#888" },
  bulletText: { flex: 1 },
});

/**
 * Parse a markdown string into an array of react-pdf <Text> nodes.
 * Supports: **bold**, *italic*, ***bold italic***, `inline code`.
 */
function parseInline(text: string, baseStyle?: Style): ReactNode[] {
  // Regex for ***bold italic***, **bold**, *italic*, `code`
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const merge = (...extra: Style[]) =>
    baseStyle ? [baseStyle, ...extra] : extra;

  while ((match = regex.exec(text)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      nodes.push(
        <Text key={`t${lastIndex}`} style={baseStyle}>
          {text.slice(lastIndex, match.index)}
        </Text>,
      );
    }

    if (match[2]) {
      // ***bold italic***
      nodes.push(
        <Text key={`bi${match.index}`} style={merge(ms.boldItalic)}>
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      // **bold**
      nodes.push(
        <Text key={`b${match.index}`} style={merge(ms.bold)}>
          {match[3]}
        </Text>,
      );
    } else if (match[4]) {
      // *italic*
      nodes.push(
        <Text key={`i${match.index}`} style={merge(ms.italic)}>
          {match[4]}
        </Text>,
      );
    } else if (match[5]) {
      // `code`
      nodes.push(
        <Text key={`c${match.index}`} style={merge(ms.code)}>
          {match[5]}
        </Text>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Trailing plain text
  if (lastIndex < text.length) {
    nodes.push(
      <Text key={`t${lastIndex}`} style={baseStyle}>
        {text.slice(lastIndex)}
      </Text>,
    );
  }

  return nodes.length > 0 ? nodes : [<Text key="plain" style={baseStyle}>{text}</Text>];
}

interface MarkdownTextProps {
  children: string;
  style?: Style;
}

/**
 * Renders a markdown string into react-pdf nodes.
 * Handles block-level: lines starting with `- ` or `* ` become bullet items.
 * Everything else is rendered as inline-formatted text wrapped in a single <Text>.
 */
export const MarkdownText = ({ children: text, style }: MarkdownTextProps) => {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);

    if (bulletMatch) {
      blocks.push(
        <View key={`bl${i}`} style={ms.bulletRow}>
          <Text style={ms.bulletChar}>•</Text>
          <Text style={style ? [ms.bulletText, style] : ms.bulletText}>{parseInline(bulletMatch[1], style)}</Text>
        </View>,
      );
    } else if (line.trim() === "") {
      // Empty line — small spacer
      blocks.push(<View key={`sp${i}`} style={{ height: 4 }} />);
    } else {
      blocks.push(
        <Text key={`p${i}`} style={style}>
          {parseInline(line, style)}
        </Text>,
      );
    }
    i++;
  }

  // Wrap in a View to prevent layout conflicts with parent flex containers
  return <View>{blocks}</View>;
};
