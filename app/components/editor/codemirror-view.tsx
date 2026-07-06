import { javascript } from "@codemirror/lang-javascript";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import type { Theme } from "~/lib/theme";

const extensions = [
  javascript({ jsx: true, typescript: true }),
  EditorView.lineWrapping,
];

interface CodeMirrorViewProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  className?: string;
}

export default function CodeMirrorView({
  value,
  onChange,
  theme,
  className,
}: CodeMirrorViewProps) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={theme === "dark" ? githubDark : githubLight}
      extensions={extensions}
      height="100%"
      className={className}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: false,
      }}
    />
  );
}
