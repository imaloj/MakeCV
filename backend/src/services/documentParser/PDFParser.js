import * as PdfParse from 'pdf-parse-new';
import fs from 'fs-extra';
import {ParseError} from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';

export default class PDFParser{
    static async extract(filePath){
        try {
            const buffer = await fs.readFile(filePath);
            const data = await PdfParse.default(buffer);

            const fullText = data.text||''
            const sections = this.parseSections(fullText);
            
            return{
                fullText,
                sections,
                metadata:{
                    pages:data.numpages,
                    info: data.info,
                    source: 'pdf'
                }
            };
        } catch(error){
            logger.error(`PDF parsing failed for ${filePath}:${error.message}`,error.stack);
            throw new ParseError(
                'Failed to parse PDF file',
                {fileName: filePath, 
                reason: error.message, 
                stact:error.stack}
            );
        }
    }
    static parseSections(text){
        const sections={
            header:{},
            summary:'',
            experience:[],
            skills: [],
            education:[],
            certifications:[],
            raw: text
        };
        const lines= text.split('\n').map(l => l.trim()).filter(Boolean);
// try to extract name (first non-empty line)
        if (lines.length>0){
            sections.header.name=lines[0];
        }
        const contactPatterns={
              email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/g,
      linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/g,
      website: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g
    };
    const contactBlock = lines.slice(0,5).join('');
    sections.header.contact={};
    for (const[key,pattern]of Object.entries(contactPatterns)){
        const matches = contactBlock.match(pattern);
        if(matches) sections.header.contact[key]=
        matches[0];
    }
    const skillsMatch = text.match(/(?:technical skills|core competencies|skills)[\s\S]*?(?=(?:experience|education|projects|certifications|awards|$))/i);
    if(skillsMatch){
        const skillsText = skillsMatch[0];
        sections.skills= skillsText.split(/[,;|\n•\-]+/).map(s=> s.replace(/skills|technicalskills|core competencies/i,'').trim()).filter(s => s.length>1 &&s.length<50);
    }
     const expMatch =text.match(/(?:experience|work experience| professional experience)[\s\S]*?(?=(?:education|skills|projects|certifications|$))/i);
     if(expMatch){
        const expText =expMatch[0];
        //split by likely job entry boundaries(dates and company pattern)
        const entries = expText.split(/(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2}|\b(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present|current))/i);
      sections.experience = entries
        .slice(1, 6) // Limit entries
        .map(entry => ({
          title: '',
          company: '',
          duration: '',
          description: entry.trim().substring(0, 500)
        }))
        .filter(e => e.description.length > 20);
     }
     // Extract education
    const eduMatch = text.match(/(?:education|academic background)[\s\S]*?(?=(?:experience|skills|projects|certifications|$))/i);
    if (eduMatch) {
      sections.education = [{
        degree: '',
        institution: '',
        year: '',
        description: eduMatch[0].substring(0, 300).trim()
      }];
    }

    return sections;
     
        }
    }
