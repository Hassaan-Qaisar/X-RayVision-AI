import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const generatePdfReport = async (patientData, analysisResult) => {
  // Create a new PDF document
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Add the header with logo and title
  doc.setFillColor(41, 82, 163); // Blue header background
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("X-Ray Analysis Report", pageWidth / 2, 20, { align: "center" });

  // Reset text color for the main content
  doc.setTextColor(0, 0, 0);

  // Add date
  doc.setFontSize(10);
  doc.text(`Report Date: ${format(new Date(), "MMMM dd, yyyy")}`, margin, 40);

  // Patient information section
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Patient Information", margin, 50);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  const patientInfo = [
    ["Name", patientData.name],
    ["Age", `${patientData.age} years`],
    [
      "Gender",
      patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1),
    ],
    ["Patient ID", patientData._id],
  ];

  if (patientData.description) {
    patientInfo.push(["Medical Notes", patientData.description]);
  }

  // Use autoTable as a function with the doc as first parameter
  let finalY = 55;
  autoTable(doc, {
    startY: 55,
    head: [],
    body: patientInfo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    didDrawPage: (data) => {
      finalY = data.cursor.y;
    },
  });

  // Analysis Results section
  const tableEndY = finalY + 10;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Analysis Results", margin, tableEndY);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  // Diagnosis and description
  const diagnosisInfo = [
    ["Diagnosis", analysisResult.disease],
    ["Description", analysisResult.description],
  ];

  // Use autoTable as a function with the doc as first parameter
  autoTable(doc, {
    startY: tableEndY + 5,
    head: [],
    body: diagnosisInfo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
  });

  // Add a new page for images
  doc.addPage();

  // Images section title
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("X-Ray Images", margin, 20);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  // Function to load image and add to PDF
  const addImageToPdf = (imgPath, title, x, y, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      if (!imgPath) {
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imgPath;

      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        let imgWidth = img.width;
        let imgHeight = img.height;

        if (imgWidth > maxWidth) {
          const ratio = maxWidth / imgWidth;
          imgWidth = maxWidth;
          imgHeight = imgHeight * ratio;
        }

        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          imgWidth = imgWidth * ratio;
        }

        // Add title
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(title, x, y - 5);

        // Add image
        doc.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
        resolve();
      };

      img.onerror = () => {
        // Handle image loading errors
        doc.text(`[${title} - Image not available]`, x, y);
        resolve();
      };
    });
  };

  // Calculate image positions (3 images in a grid)
  const imageWidth = contentWidth / 2;
  const imageHeight = imageWidth;

  // Load and add images
  try {
    // Original X-ray
    await addImageToPdf(
      analysisResult.xrayPath1,
      "Original X-ray",
      margin,
      30,
      imageWidth - 10,
      imageHeight - 10
    );

    // YOLO detection
    await addImageToPdf(
      analysisResult.yoloResultPath1,
      "Bounding Boxes",
      margin + imageWidth,
      30,
      imageWidth - 10,
      imageHeight - 10
    );

    // Heatmap
    await addImageToPdf(
      analysisResult.heatmapResultPath1,
      "Heatmap Analysis",
      margin,
      30 + imageHeight + 10,
      imageWidth - 10,
      imageHeight - 10
    );
  } catch (error) {
    console.error("Error adding images to PDF:", error);
  }

  // Add disclaimer
  const disclaimerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
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

  // Save the PDF
  doc.save(
    `X-Ray_Report_${patientData.name.replace(/\s+/g, "_")}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.pdf`
  );
};

export default generatePdfReport;
