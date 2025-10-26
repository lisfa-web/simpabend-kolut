export const generatePDF = (content: string, kopSuratUrl?: string | null, filename: string = "surat") => {
  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    alert("Pop-up diblokir. Izinkan pop-up untuk print PDF.");
    return;
  }

  const kopSuratHTML = kopSuratUrl
    ? `<div style="text-align: center; margin-bottom: 20px;">
         <img src="${kopSuratUrl}" style="max-width: 100%; max-height: 150px;" alt="Kop Surat" />
       </div>`
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 20px;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: bold;
          }
          
          h1 { font-size: 16pt; }
          h2 { font-size: 14pt; }
          h3 { font-size: 12pt; }
          
          p {
            margin: 0.5em 0;
            text-align: justify;
          }
          
          ul, ol {
            margin: 0.5em 0;
            padding-left: 40px;
          }
          
          strong, b {
            font-weight: bold;
          }
          
          em, i {
            font-style: italic;
          }
          
          u {
            text-decoration: underline;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-left {
            text-align: left;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            @page {
              margin: 2cm;
            }
          }
        </style>
      </head>
      <body>
        ${kopSuratHTML}
        ${content}
        
        <script>
          window.onload = function() {
            window.print();
            // Close window after print dialog is closed (with delay for user to cancel)
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
