interface LetterPreviewProps {
  kopSuratUrl?: string | null;
  content: string;
  className?: string;
}

export default function LetterPreview({
  kopSuratUrl,
  content,
  className = "",
}: LetterPreviewProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {kopSuratUrl && (
        <div className="flex justify-center border-b pb-4">
          <img
            src={kopSuratUrl}
            alt="Kop Surat"
            className="max-w-full h-auto"
            style={{ maxHeight: "150px" }}
          />
        </div>
      )}
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
