export interface TemplateClause {
  order: number;
  content: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "email";
  required: boolean;
}

export interface AgreementTemplate {
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  icon: string; // lucide icon name key
  isPremium: boolean;
  estimatedParties: number;
  clauses: TemplateClause[];
  variables: TemplateVariable[];
}

export const templates: AgreementTemplate[] = [
  {
    slug: "business-partnership",
    name: "Business Partnership Agreement",
    category: "Business Partnership",
    description: "Formalise a business partnership with clear roles, profit sharing, and exit terms.",
    longDescription:
      "A comprehensive partnership agreement designed for two or more parties entering a business venture together. Covers capital contributions, profit/loss distribution, management responsibilities, and dissolution procedures to protect all partners involved.",
    icon: "Handshake",
    isPremium: false,
    estimatedParties: 2,
    clauses: [
      {
        order: 1,
        content:
          "All parties agree to form a partnership under the name specified in this agreement for the purpose of conducting the business described herein. The partnership shall commence on the effective date and shall continue until terminated in accordance with the terms of this agreement.",
      },
      {
        order: 2,
        content:
          "Each partner shall contribute the agreed-upon capital, assets, or services as specified at the inception of this partnership. Additional contributions may be required upon unanimous written consent of all partners.",
      },
      {
        order: 3,
        content:
          "Net profits and losses of the partnership shall be divided among the partners in proportion to their respective ownership percentages, unless otherwise agreed in writing. Profit distributions shall occur on a quarterly basis.",
      },
      {
        order: 4,
        content:
          "Each partner shall have equal rights in the management and conduct of the partnership business, unless specific management roles are assigned herein. Major decisions including expenditures exceeding the agreed threshold require unanimous consent.",
      },
      {
        order: 5,
        content:
          "Any dispute arising from this partnership agreement shall first be submitted to mediation. If mediation fails, the dispute shall be resolved through binding arbitration in accordance with the applicable laws of the jurisdiction specified herein.",
      },
      {
        order: 6,
        content:
          "Any partner may withdraw from the partnership by providing written notice of at least 30 days. Upon dissolution, the partnership's assets shall be liquidated and distributed to the partners in proportion to their capital accounts after settling all outstanding obligations.",
      },
    ],
    variables: [
      { key: "partnership_name", label: "Partnership Name", type: "text", required: true },
      { key: "business_purpose", label: "Business Purpose", type: "text", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "capital_amount", label: "Total Capital Contribution", type: "text", required: false },
    ],
  },
  {
    slug: "freelance-contract",
    name: "Freelance Service Contract",
    category: "Freelance Contract",
    description: "Define scope of work, deliverables, payment terms, and intellectual property for freelance engagements.",
    longDescription:
      "A professional contract tailored for freelancers and their clients. Clearly outlines the scope of work, deliverables, timelines, payment schedules, and intellectual property rights to ensure both parties are protected throughout the engagement.",
    icon: "Briefcase",
    isPremium: false,
    estimatedParties: 2,
    clauses: [
      {
        order: 1,
        content:
          "The Freelancer agrees to perform the services described in the scope of work attached to this agreement. The scope includes all deliverables, milestones, and deadlines as mutually agreed upon by both parties.",
      },
      {
        order: 2,
        content:
          "The Client shall pay the Freelancer the agreed fee upon completion of each milestone or as otherwise specified in the payment schedule. Payment shall be made within 14 business days of invoice submission. Late payments shall incur a 5% monthly surcharge.",
      },
      {
        order: 3,
        content:
          "All intellectual property, work product, and deliverables created by the Freelancer under this agreement shall be transferred to the Client upon receipt of full payment. Until payment is received in full, the Freelancer retains all rights.",
      },
      {
        order: 4,
        content:
          "Both parties agree to keep confidential all proprietary information, trade secrets, and business strategies disclosed during the course of this engagement. This obligation survives the termination of this agreement for a period of 2 years.",
      },
      {
        order: 5,
        content:
          "The Freelancer shall complete all deliverables within the timeline specified in the scope of work. If delays occur due to reasons beyond the Freelancer's control, the deadline shall be extended by a mutually agreed period.",
      },
      {
        order: 6,
        content:
          "Either party may terminate this agreement with 14 days' written notice. Upon termination, the Client shall compensate the Freelancer for all completed work up to the date of termination. Any advance payments for uncompleted work shall be refunded.",
      },
    ],
    variables: [
      { key: "project_name", label: "Project / Service Name", type: "text", required: true },
      { key: "total_fee", label: "Total Fee (₦)", type: "text", required: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "deadline", label: "Deadline", type: "date", required: true },
    ],
  },
  {
    slug: "loan-agreement",
    name: "Loan Agreement",
    category: "Loan Agreement",
    description: "Record loan terms including principal, interest rate, repayment schedule, and default provisions.",
    longDescription:
      "A formal loan agreement between a lender and borrower. Documents the principal amount, interest rate, repayment schedule, collateral (if any), and consequences of default to create a legally binding record of the financial arrangement.",
    icon: "Landmark",
    isPremium: false,
    estimatedParties: 2,
    clauses: [
      {
        order: 1,
        content:
          "The Lender agrees to lend the Borrower the principal amount specified in this agreement. The Borrower acknowledges receipt of the full principal amount and agrees to repay it in accordance with the terms set forth herein.",
      },
      {
        order: 2,
        content:
          "Interest shall accrue on the outstanding principal at the annual rate specified in this agreement. Interest shall be calculated on a simple/compound basis as agreed and shall be payable alongside each instalment.",
      },
      {
        order: 3,
        content:
          "The Borrower shall repay the loan in equal monthly instalments over the agreed repayment period. Each instalment shall include a portion of the principal and any accrued interest. The first payment is due on the date specified herein.",
      },
      {
        order: 4,
        content:
          "If the Borrower fails to make any payment within 7 days of the due date, the Borrower shall be considered in default. Upon default, the Lender may demand immediate repayment of the entire outstanding balance, including all accrued interest and applicable penalties.",
      },
      {
        order: 5,
        content:
          "The Borrower may prepay the loan in full or in part at any time without penalty, unless otherwise specified. Any prepayment shall first be applied to accrued interest, then to the outstanding principal balance.",
      },
    ],
    variables: [
      { key: "principal_amount", label: "Principal Amount (₦)", type: "text", required: true },
      { key: "interest_rate", label: "Annual Interest Rate (%)", type: "text", required: true },
      { key: "repayment_period", label: "Repayment Period (months)", type: "number", required: true },
      { key: "first_payment_date", label: "First Payment Date", type: "date", required: true },
    ],
  },
  {
    slug: "nda",
    name: "Non-Disclosure Agreement (NDA)",
    category: "NDA",
    description: "Protect confidential information shared between parties with a binding NDA.",
    longDescription:
      "A standard non-disclosure agreement to protect sensitive business information, trade secrets, and proprietary data shared between parties during negotiations, partnerships, or employment. Defines what constitutes confidential information and the obligations of the receiving party.",
    icon: "ShieldCheck",
    isPremium: false,
    estimatedParties: 2,
    clauses: [
      {
        order: 1,
        content:
          "\"Confidential Information\" shall mean all non-public information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, electronically, or by any other means. This includes but is not limited to business plans, financial data, customer lists, technical specifications, and proprietary processes.",
      },
      {
        order: 2,
        content:
          "The Receiving Party agrees to hold all Confidential Information in strict confidence and shall not disclose, publish, or otherwise disseminate it to any third party without the prior written consent of the Disclosing Party. The Receiving Party shall use the Confidential Information solely for the purpose specified in this agreement.",
      },
      {
        order: 3,
        content:
          "The obligations of confidentiality shall not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed by the Receiving Party; or (d) is required to be disclosed by law or court order.",
      },
      {
        order: 4,
        content:
          "This NDA shall remain in effect for the period specified herein from the date of execution. Upon termination or expiration, the Receiving Party shall promptly return or destroy all materials containing Confidential Information and certify in writing that it has done so.",
      },
      {
        order: 5,
        content:
          "The Receiving Party acknowledges that any breach of this agreement may cause irreparable harm to the Disclosing Party, and that monetary damages may be insufficient. The Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.",
      },
    ],
    variables: [
      { key: "purpose", label: "Purpose of Disclosure", type: "text", required: true },
      { key: "duration", label: "Duration (years)", type: "number", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
    ],
  },
  {
    slug: "personal-agreement",
    name: "Personal Agreement",
    category: "Personal Agreement",
    description: "A simple, flexible agreement for personal arrangements between individuals.",
    longDescription:
      "A lightweight and flexible agreement designed for personal arrangements such as shared expenses, informal collaborations, borrowed items, or any mutual understanding between individuals that benefits from being documented in writing.",
    icon: "Users",
    isPremium: false,
    estimatedParties: 2,
    clauses: [
      {
        order: 1,
        content:
          "Both parties acknowledge and agree to the purpose and terms described in this agreement. This agreement represents the full understanding between the parties regarding the subject matter and supersedes any prior verbal or written arrangements.",
      },
      {
        order: 2,
        content:
          "Each party shall fulfil their respective responsibilities as outlined in this agreement. Failure to meet these obligations may result in the other party being released from their commitments under this agreement.",
      },
      {
        order: 3,
        content:
          "This agreement shall remain in effect from the date of signing until the agreed-upon end date, or until both parties mutually agree in writing to terminate it. Either party may request early termination with reasonable notice.",
      },
      {
        order: 4,
        content:
          "Any modifications to this agreement must be made in writing and signed by all parties. No verbal amendment shall be considered binding. Both parties agree to act in good faith throughout the duration of this agreement.",
      },
    ],
    variables: [
      { key: "agreement_purpose", label: "Purpose of Agreement", type: "text", required: true },
      { key: "end_date", label: "End Date", type: "date", required: false },
    ],
  },
  {
    slug: "content-creation-contract",
    name: "Content Creation Contract",
    category: "Custom Agreement",
    description: "Outline deliverables, timelines, licensing, and payment for content creation projects.",
    longDescription:
      "A specialised contract for content creators and their clients — covering video production, graphic design, copywriting, social media management, and more. Clearly defines deliverables, revision policies, content licensing, and payment milestones.",
    icon: "PenTool",
    isPremium: true,
    estimatedParties: 2,
    clauses: [
      {
        order: 1,
        content:
          "The Creator agrees to produce the content deliverables described in this agreement, including format, quantity, and quality specifications. All deliverables shall meet the standards outlined in the creative brief attached hereto.",
      },
      {
        order: 2,
        content:
          "The Creator shall deliver all content according to the timeline specified in this agreement. The Client shall provide all required materials, access, and approvals within 5 business days of request to avoid delays in the production schedule.",
      },
      {
        order: 3,
        content:
          "The Client shall be entitled to up to 2 rounds of revisions per deliverable at no additional cost. Additional revisions beyond this allowance shall be charged at the Creator's standard hourly rate. Major scope changes require a separate written amendment.",
      },
      {
        order: 4,
        content:
          "Upon receipt of full payment, the Client shall receive a perpetual, non-exclusive licence to use the content for the purposes specified in this agreement. The Creator retains the right to display the work in their portfolio unless otherwise agreed.",
      },
      {
        order: 5,
        content:
          "The Client shall pay the Creator according to the payment schedule specified in this agreement. A non-refundable deposit of 50% is due before work commences. The remaining balance is due upon delivery of final content.",
      },
    ],
    variables: [
      { key: "content_type", label: "Type of Content", type: "text", required: true },
      { key: "total_fee", label: "Total Fee (₦)", type: "text", required: true },
      { key: "delivery_date", label: "Final Delivery Date", type: "date", required: true },
      { key: "revision_rounds", label: "Included Revision Rounds", type: "number", required: false },
    ],
  },
];

export function getTemplateBySlug(slug: string): AgreementTemplate | undefined {
  return templates.find((t) => t.slug === slug);
}
