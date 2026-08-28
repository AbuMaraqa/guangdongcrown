import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Undo2,
    Unlink,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { MediaLibraryDialog } from '@/components/admin/media-picker';
import { cn } from '@/lib/utils';

/**
 * WYSIWYG editor for CMS body copy.
 *
 * The output is HTML, sanitised again server side before it is stored, so the
 * toolbar here defines the *intended* vocabulary rather than the security
 * boundary.
 */
export function RichTextEditor({
    value,
    onChange,
    placeholder,
    invalid,
}: {
    value: string | null;
    onChange: (html: string) => void;
    placeholder?: string;
    invalid?: boolean;
}) {
    const [mediaOpen, setMediaOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                protocols: ['http', 'https', 'mailto'],
            }),
            Image.configure({ inline: false }),
            Placeholder.configure({
                placeholder: placeholder ?? 'Write the content…',
            }),
        ],
        content: value ?? '',
        editorProps: {
            attributes: {
                class: 'prose-editor min-h-72 max-w-none px-4 py-3 outline-none',
            },
        },
        onUpdate: ({ editor: instance }) => {
            const html = instance.getHTML();
            onChange(html === '<p></p>' ? '' : html);
        },
    });

    // Keep the editor in step when the form resets or loads a different record.
    useEffect(() => {
        if (
            editor &&
            value !== null &&
            value !== editor.getHTML() &&
            !editor.isFocused
        ) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div className="h-80 animate-pulse rounded-lg border bg-muted/40" />
        );
    }

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border transition-colors focus-within:border-ring',
                invalid && 'border-destructive',
            )}
        >
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5">
                <ToolbarButton
                    editor={editor}
                    icon={Bold}
                    label="Bold"
                    isActive={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <ToolbarButton
                    editor={editor}
                    icon={Italic}
                    label="Italic"
                    isActive={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <ToolbarButton
                    editor={editor}
                    icon={Strikethrough}
                    label="Strikethrough"
                    isActive={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                />

                <Divider />

                <ToolbarButton
                    editor={editor}
                    icon={Heading2}
                    label="Heading 2"
                    isActive={editor.isActive('heading', { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                />
                <ToolbarButton
                    editor={editor}
                    icon={Heading3}
                    label="Heading 3"
                    isActive={editor.isActive('heading', { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                />

                <Divider />

                <ToolbarButton
                    editor={editor}
                    icon={List}
                    label="Bullet list"
                    isActive={editor.isActive('bulletList')}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                />
                <ToolbarButton
                    editor={editor}
                    icon={ListOrdered}
                    label="Numbered list"
                    isActive={editor.isActive('orderedList')}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                />
                <ToolbarButton
                    editor={editor}
                    icon={Quote}
                    label="Quote"
                    isActive={editor.isActive('blockquote')}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                />
                <ToolbarButton
                    editor={editor}
                    icon={Minus}
                    label="Divider"
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                />

                <Divider />

                <ToolbarButton
                    editor={editor}
                    icon={LinkIcon}
                    label="Add link"
                    isActive={editor.isActive('link')}
                    onClick={() => {
                        const previous = editor.getAttributes('link').href as
                            string | undefined;
                        const url = window.prompt(
                            'Link URL',
                            previous ?? 'https://',
                        );

                        if (url === null) {
                            return;
                        }

                        if (url === '') {
                            editor.chain().focus().unsetLink().run();

                            return;
                        }

                        editor
                            .chain()
                            .focus()
                            .extendMarkRange('link')
                            .setLink({ href: url })
                            .run();
                    }}
                />
                <ToolbarButton
                    editor={editor}
                    icon={Unlink}
                    label="Remove link"
                    disabled={!editor.isActive('link')}
                    onClick={() => editor.chain().focus().unsetLink().run()}
                />
                <ToolbarButton
                    editor={editor}
                    icon={ImagePlus}
                    label="Insert image"
                    onClick={() => setMediaOpen(true)}
                />

                <Divider />

                <ToolbarButton
                    editor={editor}
                    icon={Undo2}
                    label="Undo"
                    disabled={!editor.can().undo()}
                    onClick={() => editor.chain().focus().undo().run()}
                />
                <ToolbarButton
                    editor={editor}
                    icon={Redo2}
                    label="Redo"
                    disabled={!editor.can().redo()}
                    onClick={() => editor.chain().focus().redo().run()}
                />
            </div>

            <EditorContent editor={editor} />

            <MediaLibraryDialog
                open={mediaOpen}
                onOpenChange={setMediaOpen}
                onSelect={(items) => {
                    const item = items[0];

                    if (item?.isImage) {
                        editor
                            .chain()
                            .focus()
                            .setImage({ src: item.url, alt: item.alt ?? '' })
                            .run();
                    }
                }}
            />
        </div>
    );
}

function ToolbarButton({
    icon: Icon,
    label,
    onClick,
    isActive = false,
    disabled = false,
}: {
    editor: Editor;
    icon: ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={isActive}
            title={label}
            className={cn(
                'inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-40',
                isActive && 'bg-background text-foreground shadow-xs',
            )}
        >
            <span className="sr-only">{label}</span>
            <Icon className="size-4" />
        </button>
    );
}

function Divider() {
    return <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />;
}
