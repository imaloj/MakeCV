import * as docx from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import FileUtils from '../utils/fileUtils.js';
import { OUTPUT_FORMATS, TEMP_FILE_PATH } from '../config/constants.js';
import { FileError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Packer
} = docx;

export default class OutputGenerator {
  /**
   * Generate output file in specified format
   */
  static async generate(cvData, format, requestId) {
    logger.info(`Generating output: ${format} for request ${requestId}`);

    switch (format.toLowerCase()) {
      case OUTPUT_FORMATS.DOCX:
        return this.generateDOCX(cvData, requestId);
      case OUTPUT_FORMATS.PDF:
        return this.generatePDF(cvData, requestId);
      case OUTPUT_FORMATS.TXT:
        return this.generateTXT(cvData, requestId);
      default:
        throw new FileError(`Unsupported output format: ${format}`);
    }
  }

  /**
   * Generate DOCX file
   */
  static async generateDOCX(cvData, requestId) {
    const children = [];

    // Header section
    children.push(
      new Paragraph({
        text: cvData.header?.name || 'Name',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );

    // Contact info
    if (cvData.header?.contact) {
      const contactParts = Object.entries(cvData.header.contact)
        .filter(([, val]) => val)
        .map(([key, val]) => `${key}: ${val}`)
        .join(' | ');

      children.push(new Paragraph({
        text: contactParts,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }));
    }

    // Summary
    if (cvData.summary) {
      children.push(
        new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }),
        new Paragraph({ text: cvData.summary, spacing: { after: 200 } })
      );
    }

    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
      children.push(
        new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } })
      );

      for (const exp of cvData.experience) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: exp.title || 'Position', bold: true }),
            new TextRun({ text: ` | ${exp.company || ''}` }),
            new TextRun({ text: ` | ${exp.duration || ''}`, italics: true })
          ],
          spacing: { after: 50 }
        }));

        if (exp.description) {
          children.push(new Paragraph({
            text: exp.description,
            spacing: { after: 150 }
          }));
        }
      }
    }

    // Skills
    if (cvData.skills && cvData.skills.length > 0) {
      children.push(
        new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }),
        new Paragraph({
          text: Array.isArray(cvData.skills) ? cvData.skills.join(', ') : cvData.skills,
          spacing: { after: 200 }
        })
      );
    }

    // Education
    if (cvData.education && cvData.education.length > 0) {
      children.push(
        new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } })
      );
      for (const edu of cvData.education) {
        const eduText = typeof edu === 'string' ? edu : `${edu.degree || ''} - ${edu.institution || ''} (${edu.year || ''})`;
        children.push(new Paragraph({ text: eduText, spacing: { after: 50 } }));
      }
    }

    // Certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      children.push(
        new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } })
      );
      for (const cert of cvData.certifications) {
        const certText = typeof cert === 'string' ? cert : `${cert.name || ''} - ${cert.issuer || ''}`;
        children.push(new Paragraph({ text: certText, spacing: { after: 50 } }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `customized_cv_${requestId}.docx`;
    const filePath = path.join(TEMP_FILE_PATH, filename);
    await fs.writeFile(filePath, buffer);

    return { path: filePath, filename, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }

  /**
   * Generate PDF file
   */
  static async generatePDF(cvData, requestId) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;
    const lineHeight = 16;
    const maxWidth = width - 2 * margin;

    const drawText = (text, options = {}) => {
      const {
        size = 11,
        isBold = false,
        color = rgb(0, 0, 0),
        align = 'left'
      } = options;

      const currentFont = isBold ? boldFont : font;
      const textWidth = currentFont.widthOfTextAtSize(text, size);

      let x = margin;
      if (align === 'center') x = (width - textWidth) / 2;

      page.drawText(text, { x, y, size, font: currentFont, color, maxWidth: maxWidth });
      y -= lineHeight * (size / 11);
    };

    const drawSection = (title, content) => {
      if (y < 100) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = newPage.getSize().height - 50;
      }
      y -= 10;
      drawText(title, { size: 14, isBold: true });
      y -= 5;
      if (typeof content === 'string') {
        drawText(content, { size: 10 });
      }
      y -= 5;
    };

    // Header
    drawText(cvData.header?.name || 'Name', { size: 20, isBold: true, align: 'center' });

    if (cvData.header?.contact) {
      const contactStr = Object.entries(cvData.header.contact)
        .filter(([, val]) => val)
        .map(([, val]) => val)
        .join(' | ');
      drawText(contactStr, { size: 9, align: 'center' });
    }
    y -= 15;

    // Summary
    if (cvData.summary) drawSection('PROFESSIONAL SUMMARY', cvData.summary);

    // Experience
    if (cvData.experience?.length > 0) {
      drawSection('EXPERIENCE', '');
      for (const exp of cvData.experience) {
        const title = `${exp.title || 'Position'} | ${exp.company || ''} | ${exp.duration || ''}`;
        drawText(title, { size: 11, isBold: true });
        if (exp.description) drawText(exp.description, { size: 10 });
        y -= 5;
      }
    }

    // Skills
    if (cvData.skills?.length > 0) {
      const skillsText = Array.isArray(cvData.skills) ? cvData.skills.join(', ') : cvData.skills;
      drawSection('SKILLS', skillsText);
    }

    // Education
    if (cvData.education?.length > 0) {
      drawSection('EDUCATION', '');
      for (const edu of cvData.education) {
        const text = typeof edu === 'string' ? edu : `${edu.degree || ''} - ${edu.institution || ''}`;
        drawText(text, { size: 10 });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `customized_cv_${requestId}.pdf`;
    const filePath = path.join(TEMP_FILE_PATH, filename);
    await fs.writeFile(filePath, pdfBytes);

    return { path: filePath, filename, mimeType: 'application/pdf' };
  }

  /**
   * Generate plain text file
   */
  static async generateTXT(cvData, requestId) {
    let text = '';

    text += `${cvData.header?.name || 'Name'}\n`;
    text += `${Object.values(cvData.header?.contact || {}).filter(Boolean).join(' | ')}\n\n`;

    if (cvData.summary) text += `PROFESSIONAL SUMMARY\n${cvData.summary}\n\n`;

    if (cvData.experience?.length > 0) {
      text += `EXPERIENCE\n`;
      for (const exp of cvData.experience) {
        text += `${exp.title || ''} | ${exp.company || ''} | ${exp.duration || ''}\n`;
        text += `${exp.description || ''}\n\n`;
      }
    }

    if (cvData.skills?.length > 0) {
      text += `SKILLS\n${Array.isArray(cvData.skills) ? cvData.skills.join(', ') : cvData.skills}\n\n`;
    }

    if (cvData.education?.length > 0) {
      text += `EDUCATION\n`;
      for (const edu of cvData.education) {
        text += `${typeof edu === 'string' ? edu : `${edu.degree || ''} - ${edu.institution || ''}`}\n`;
      }
    }

    const filename = `customized_cv_${requestId}.txt`;
    const filePath = path.join(TEMP_FILE_PATH, filename);
    await fs.writeFile(filePath, text);

    return { path: filePath, filename, mimeType: 'text/plain' };
  }
}
