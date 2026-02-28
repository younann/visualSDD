import { useRef, useEffect, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownPanelProps {
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownPanel({ content, onChange }: MarkdownPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isInternalUpdate.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: 'ui-monospace, monospace' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // Only create editor once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor when external content changes
  const updateContent = useCallback((newContent: string) => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === newContent) return;

    isInternalUpdate.current = true;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: newContent },
    });
    isInternalUpdate.current = false;
  }, []);

  useEffect(() => {
    updateContent(content);
  }, [content, updateContent]);

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
        Markdown Editor
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
