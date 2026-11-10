export const publicContactEmail = 'contact@getledovia.com';
export type ProfessionalProduct = 'response' | 'government';
export const professionalNames = {response:'Ledovia Response',government:'Ledovia Government'} as const;

export function inquiryEmail(product: ProfessionalProduct) {
 const subject = `${professionalNames[product]} — information, pricing and requirements`;
 const body = `Hello Ledovia,\n\nI would like to discuss the planned ${professionalNames[product]} offering.\n\nOrganization:\nOperational challenge:\nCurrent workflow:\nRequirements:\n\nPlease do not include sensitive operational or personal information.\n`;
 return `mailto:${publicContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export interface InquiryDraft {name:string;organization:string;email:string;product:string;needs:string;}
export type InquiryErrors = Partial<Record<keyof InquiryDraft,string>>;
export function validateInquiryDraft(draft: InquiryDraft): InquiryErrors {
 const errors: InquiryErrors = {};
 for(const field of ['name','organization'] as const) {
  const value=draft[field].trim();
  if(value.length<2 || value.length>100) errors[field]=`Enter ${field==='name'?'your name':'your organization'} using 2–100 characters.`;
 }
 const email=draft.email.trim();
 if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email='Enter a valid email address, such as name@example.com.';
 if(draft.product!=='response' && draft.product!=='government') errors.product='Choose Ledovia Response or Ledovia Government.';
 const needs=draft.needs.trim();
 if(needs.length<20 || needs.length>2000) errors.needs='Describe your needs in 20–2,000 characters. Do not include sensitive information.';
 return errors;
}
