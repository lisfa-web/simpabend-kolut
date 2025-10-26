import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Heading1,
  Heading2,
  List,
  ListOrdered
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const availableVariables = [
  { label: "Nama OPD", value: "{{nama_opd}}" },
  { label: "Nomor Surat", value: "{{nomor_surat}}" },
  { label: "Tanggal Surat", value: "{{tanggal}}" },
  { label: "Nama Pejabat", value: "{{nama_pejabat}}" },
  { label: "NIP Pejabat", value: "{{nip_pejabat}}" },
  { label: "Jabatan Pejabat", value: "{{jabatan_pejabat}}" },
  { label: "Jenis Surat", value: "{{jenis_surat}}" },
];

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const insertVariable = (variable: string) => {
    editor.chain().focus().insertContent(variable + " ").run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon, 
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: React.ElementType; 
    label: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-accent"
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-4">
      <Card className="border border-border">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={Bold}
            label="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={Italic}
            label="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon={UnderlineIcon}
            label="Underline"
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            icon={Heading1}
            label="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            icon={Heading2}
            label="Heading 2"
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            icon={AlignLeft}
            label="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            icon={AlignCenter}
            label="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            icon={AlignRight}
            label="Align Right"
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
            label="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={ListOrdered}
            label="Ordered List"
          />
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </Card>

      {/* Variable Insertion Panel */}
      <Card className="p-4 border border-border">
        <h4 className="text-sm font-medium mb-3">Insert Variables</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Klik tombol di bawah untuk menambahkan variable ke template. Variable akan otomatis diganti dengan data saat generate surat.
        </p>
        <div className="flex flex-wrap gap-2">
          {availableVariables.map((variable) => (
            <Button
              key={variable.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable(variable.value)}
              className="text-xs"
            >
              {variable.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
