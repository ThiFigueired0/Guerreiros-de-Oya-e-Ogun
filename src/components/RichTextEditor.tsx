import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';
import { Bold, Italic, List, ListOrdered, CheckSquare, Highlighter, Strikethrough, Heading1, Heading2, Quote, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  if (!editor) {
    return null;
  }

  const actBtnClass = cn(
    "p-1.5 rounded-lg transition-colors",
    settings.darkMode 
      ? "hover:bg-[#2d3748] text-gray-300 data-[active=true]:bg-brand-gold/20 data-[active=true]:text-brand-gold" 
      : "hover:bg-gray-100 text-gray-600 data-[active=true]:bg-brand-gold/10 data-[active=true]:text-brand-gold"
  );

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 p-2 border-b",
      settings.darkMode ? "border-[#2d3748] bg-[#1a2333]" : "border-gray-200 bg-gray-50/50"
    )}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={actBtnClass}
        data-active={editor.isActive('bold')}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={actBtnClass}
        data-active={editor.isActive('italic')}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={actBtnClass}
        data-active={editor.isActive('strike')}
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        className={actBtnClass}
        data-active={editor.isActive('highlight')}
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={actBtnClass}
        data-active={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={actBtnClass}
        data-active={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={actBtnClass}
        data-active={editor.isActive('bulletList')}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={actBtnClass}
        data-active={editor.isActive('orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={actBtnClass}
        data-active={editor.isActive('taskList')}
      >
        <CheckSquare className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={actBtnClass}
        data-active={editor.isActive('blockquote')}
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={actBtnClass}
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={actBtnClass}
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export const RichTextEditor = ({ content, onChange, readOnly = false }: RichTextEditorProps) => {
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose max-w-none focus:outline-none min-h-[150px] p-4',
          settings.darkMode ? 'prose-invert' : ''
        ),
      },
    },
  });

  // Effect to update content when the prop changes exactly when not focused
  // This is a common requirement to support prop updates while avoiding cursor jumping
  React.useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden flex flex-col",
      settings.darkMode ? "border-[#2d3748] bg-[#111827]" : "border-gray-200 bg-white",
      readOnly && "border-transparent bg-transparent"
    )}>
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto max-h-[500px]" />
    </div>
  );
};
