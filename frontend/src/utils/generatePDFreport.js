import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const generatePdfReport = async (patientData, analysisResult) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Header Section
  doc.setFillColor(41, 82, 163);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("X-Ray Analysis Report", pageWidth / 2, 20, { align: "center" });

  // Report Date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Report Date: ${format(new Date(), "MMMM dd, yyyy")}`, margin, 40);

  // Patient Information
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Patient Information", margin, 50);
  doc.setFont(undefined, "normal");

  const patientInfo = [
    ["Name", patientData.name],
    ["Age", `${patientData.age} years`],
    [
      "Gender",
      patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1),
    ],
    // ["Patient ID", patientData._id],
  ];

  if (patientData.description) {
    patientInfo.push(["Medical Notes", patientData.description]);
  }

  let finalY = 55;
  autoTable(doc, {
    startY: 55,
    head: [],
    body: patientInfo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    didDrawPage: (data) => (finalY = data.cursor.y),
  });

  // Analysis Results Section
  doc.addPage();
  let currentY = margin;

  // Global Disease
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Global Disease", margin, currentY);
  doc.setFont(undefined, "normal");
  doc.setFontSize(12);
  currentY += 8;
  doc.text(analysisResult.disease, margin + 5, currentY);
  currentY += 10;

  // Local Analysis
  if (analysisResult.disease_names && analysisResult.disease_names.length > 0) {
    doc.setFont(undefined, "bold");
    doc.setFontSize(14);
    doc.text("Local Analysis", margin, currentY);
    doc.setFont(undefined, "normal");
    doc.setFontSize(12);
    currentY += 8;

    analysisResult.disease_names.forEach((disease, index) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(`• ${disease}`, margin + 5, currentY);
      currentY += 8;
    });
    currentY += 10;
  }

  // AI Analysis Description - Improved markdown rendering
  doc.addPage();
  currentY = margin;
  doc.setFont(undefined, "bold");
  doc.setFontSize(16);
  doc.text("AI Analysis", margin, currentY);
  doc.setFont(undefined, "normal");
  currentY += 10;

  // Parse and render markdown content properly
  const renderMarkdown = (text) => {
    // Normalize line breaks and clean up the text
    const cleanText = text
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\n\n+/g, "\n\n");

    // Split into paragraphs
    const paragraphs = cleanText.split(/\n\n+/);
    let y = currentY;
    const listLevel = 0;
    let inCodeBlock = false;
    let codeBlockContent = "";

    // Process each paragraph
    paragraphs.forEach((paragraph) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return;

      // Check if we need a new page
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      // Handle code blocks
      if (paragraph.trim().startsWith("```") && !inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = "";
        return;
      } else if (paragraph.trim().startsWith("```") && inCodeBlock) {
        // End of code block
        inCodeBlock = false;

        // Draw code block background
        doc.setFillColor(240, 240, 240);
        const codeLines = codeBlockContent.split("\n");
        const codeHeight = codeLines.length * 5 + 10; // Height based on number of lines
        doc.rect(margin, y, contentWidth, codeHeight, "F");

        // Add code content
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        codeLines.forEach((line, index) => {
          doc.text(line, margin + 5, y + 8 + index * 5);
        });

        y += codeHeight + 5;
        doc.setTextColor(0, 0, 0);
        return;
      }

      if (inCodeBlock) {
        codeBlockContent += paragraph + "\n";
        return;
      }

      // Handle different paragraph types
      const lines = paragraph.split("\n");
      lines.forEach((line) => {
        // Check if we need a new page
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }

        // Handle headings
        if (line.startsWith("# ")) {
          doc.setFont(undefined, "bold");
          doc.setFontSize(14);
          doc.text(line.substring(2), margin, y);
          doc.setFont(undefined, "normal");
          y += 10;
        } else if (line.startsWith("## ")) {
          doc.setFont(undefined, "bold");
          doc.setFontSize(12);
          doc.text(line.substring(3), margin, y);
          doc.setFont(undefined, "normal");
          y += 8;
        } else if (line.startsWith("### ")) {
          doc.setFont(undefined, "bold");
          doc.setFontSize(11);
          doc.text(line.substring(4), margin, y);
          doc.setFont(undefined, "normal");
          y += 7;
        }
        // Handle lists
        else if (line.match(/^\s*[-*+]\s/)) {
          const indentMatch = line.match(/^\s*/)[0].length;
          const listLevel = Math.floor(indentMatch / 2);
          const bulletText = line.trim().substring(2);

          doc.setFontSize(10);
          doc.text("•", margin + listLevel * 5, y);

          // Handle text wrapping for bullet points
          const textWidth = contentWidth - (margin + listLevel * 5 + 5);
          const splitText = doc.splitTextToSize(bulletText, textWidth);

          splitText.forEach((textLine, index) => {
            if (index === 0) {
              doc.text(textLine, margin + listLevel * 5 + 5, y);
            } else {
              y += 5;
              doc.text(textLine, margin + listLevel * 5 + 5, y);
            }
          });

          y += 6;
        }
        // Handle numbered lists
        else if (line.match(/^\s*\d+\.\s/)) {
          const indentMatch = line.match(/^\s*/)[0].length;
          const listLevel = Math.floor(indentMatch / 2);
          const numberMatch = line.match(/^\s*(\d+)\.\s/);
          const number = numberMatch ? numberMatch[1] : "1";
          const listText = line.replace(/^\s*\d+\.\s/, "");

          doc.setFontSize(10);
          doc.text(`${number}.`, margin + listLevel * 5, y);

          // Handle text wrapping for numbered list items
          const textWidth = contentWidth - (margin + listLevel * 5 + 8);
          const splitText = doc.splitTextToSize(listText, textWidth);

          splitText.forEach((textLine, index) => {
            if (index === 0) {
              doc.text(textLine, margin + listLevel * 5 + 8, y);
            } else {
              y += 5;
              doc.text(textLine, margin + listLevel * 5 + 8, y);
            }
          });

          y += 6;
        }
        // Handle bold text
        else if (line.includes("**")) {
          const segments = [];
          let currentIndex = 0;
          let boldStart = line.indexOf("**", currentIndex);

          while (boldStart !== -1) {
            // Add text before bold
            if (boldStart > currentIndex) {
              segments.push({
                text: line.substring(currentIndex, boldStart),
                bold: false,
              });
            }

            const boldEnd = line.indexOf("**", boldStart + 2);
            if (boldEnd === -1) break;

            // Add bold text
            segments.push({
              text: line.substring(boldStart + 2, boldEnd),
              bold: true,
            });

            currentIndex = boldEnd + 2;
            boldStart = line.indexOf("**", currentIndex);
          }

          // Add remaining text
          if (currentIndex < line.length) {
            segments.push({
              text: line.substring(currentIndex),
              bold: false,
            });
          }

          // Render segments
          let xPos = margin;
          doc.setFontSize(10);

          segments.forEach((segment) => {
            if (segment.bold) {
              doc.setFont(undefined, "bold");
            } else {
              doc.setFont(undefined, "normal");
            }

            doc.text(segment.text, xPos, y);
            xPos += doc.getTextWidth(segment.text);
          });

          doc.setFont(undefined, "normal");
          y += 6;
        }
        // Handle horizontal rule
        else if (line.startsWith("---")) {
          doc.setDrawColor(200);
          doc.line(margin, y - 1, pageWidth - margin, y - 1);
          y += 5;
        }
        // Regular paragraph text
        else {
          doc.setFontSize(10);

          // Handle text wrapping
          const splitText = doc.splitTextToSize(line, contentWidth);
          splitText.forEach((textLine, index) => {
            doc.text(textLine, margin, y);
            if (index < splitText.length - 1) {
              y += 5;
            }
          });

          y += 6;
        }
      });

      // Add space between paragraphs
      y += 4;
    });

    return y;
  };

  // Render the markdown content
  try {
    const finalY = renderMarkdown(analysisResult.description);
    currentY = finalY;
  } catch (error) {
    console.error("Error rendering markdown:", error);
    // Fallback to simple text rendering
    doc.setFontSize(10);
    doc.text(
      "Analysis description could not be rendered properly.",
      margin,
      currentY
    );
    currentY += 10;

    // Split the text into lines to avoid overflow
    const splitText = doc.splitTextToSize(
      analysisResult.description,
      contentWidth
    );
    splitText.forEach((line) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(line, margin, currentY);
      currentY += 5;
    });
  }

  // Images Section
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("X-Ray Images", margin, 20);
  doc.setFont(undefined, "normal");

  const addImageToPdf = (imgPath, title, x, y, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      if (!imgPath) {
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgPath;

      img.onload = () => {
        let [imgWidth, imgHeight] = [img.width, img.height];
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        [imgWidth, imgHeight] = [imgWidth * ratio, imgHeight * ratio];

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(title, x, y - 5);

        try {
          doc.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
        } catch (error) {
          console.error(`Error adding image ${title}:`, error);
          // Draw placeholder for failed image
          doc.setDrawColor(200);
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(x, y, maxWidth, maxHeight, 2, 2, "FD");
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("Image not available", x + maxWidth / 2, y + maxHeight / 2, {
            align: "center",
          });
          doc.setTextColor(0);
        }

        resolve();
      };

      img.onerror = () => {
        // Draw placeholder for failed image
        doc.setDrawColor(200);
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x, y, maxWidth, maxHeight, 2, 2, "FD");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Image not available", x + maxWidth / 2, y + maxHeight / 2, {
          align: "center",
        });
        doc.setTextColor(0);
        resolve();
      };
    });
  };

  const imageWidth = contentWidth / 2;
  const imageHeight = imageWidth;

  try {
    await addImageToPdf(
      analysisResult.xrayPath1,
      "Original X-ray",
      margin,
      30,
      imageWidth - 10,
      imageHeight - 10
    );

    await addImageToPdf(
      analysisResult.yoloResultPath1,
      "Bounding Boxes",
      margin + imageWidth,
      30,
      imageWidth - 10,
      imageHeight - 10
    );

    await addImageToPdf(
      analysisResult.heatmapResultPath1,
      "Heatmap Analysis",
      margin,
      30 + imageHeight + 10,
      imageWidth - 10,
      imageHeight - 10
    );
  } catch (error) {
    console.error("Error adding images:", error);
  }

  // Footer with logo and disclaimer
  const addFooterToAllPages = () => {
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Add page number
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10
      );

      // Add disclaimer on last page
      if (i === totalPages) {
        const disclaimerY = pageHeight - 20;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          "Disclaimer: This analysis is provided as a diagnostic aid only. Final interpretation should be",
          margin,
          disclaimerY
        );
        doc.text(
          "performed by a qualified healthcare professional. Not a substitute for professional medical advice.",
          margin,
          disclaimerY + 5
        );
      }
    }
  };

  addFooterToAllPages();

  // Save PDF
  doc.save(
    `X-Ray_Report_${patientData.name.replace(/\s+/g, "_")}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.pdf`
  );
};

export default generatePdfReport;
