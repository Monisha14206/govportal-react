const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Service = require('../models/Service');
const Scheme = require('../models/Scheme');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      '[MongoDB] MONGODB_URI is not set. Copy backend/.env.example to backend/.env ' +
      'and set MONGODB_URI to your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[MongoDB] Connected to Atlas.');
}

async function seedServices() {
  const count = await Service.countDocuments();
  if (count > 0) return;

  const services = [
    {
      name: 'Integrated Certificate',
      category: 'Certificates',
      description: 'Combined income, community, and nativity certificate issued by revenue department.',
      required_documents: 'Aadhaar Card, Address Proof, Passport Photo',
      form_fields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'father_name', label: "Father's / Guardian's Name", type: 'text', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'purpose', label: 'Purpose of Certificate', type: 'text', required: true }
      ],
      fee: 30,
      processing_days: 7
    },
    {
      name: 'Birth Certificate',
      category: 'Certificates',
      description: 'Official registration record of birth for an individual.',
      required_documents: 'Hospital Discharge Summary, Parents ID Proof, Address Proof',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name (Parent/Guardian)', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'child_name', label: 'Child Name', type: 'text', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'place_of_birth', label: 'Place of Birth', type: 'text', required: true },
        { name: 'father_name', label: "Father's Name", type: 'text', required: true },
        { name: 'mother_name', label: "Mother's Name", type: 'text', required: true },
        { name: 'address', label: 'Permanent Address', type: 'textarea', required: true }
      ],
      fee: 20,
      processing_days: 5
    },
    {
      name: 'Death Certificate',
      category: 'Certificates',
      description: 'Official registration record confirming the death of an individual.',
      required_documents: 'Hospital/Medical Certificate of Death, ID Proof of Deceased, Applicant ID Proof',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'deceased_name', label: 'Name of Deceased', type: 'text', required: true },
        { name: 'date_of_death', label: 'Date of Death', type: 'date', required: true },
        { name: 'place_of_death', label: 'Place of Death', type: 'text', required: true },
        { name: 'applicant_relation', label: 'Relation to Deceased', type: 'text', required: true },
        { name: 'address', label: 'Address', type: 'textarea', required: true }
      ],
      fee: 20,
      processing_days: 5
    },
    {
      name: 'Ration Card',
      category: 'Public Distribution',
      description: 'Application for new ration card under the public distribution system.',
      required_documents: 'Aadhaar Card, Address Proof, Family Photo, Income Certificate',
      form_fields: [
        { name: 'head_of_family', label: 'Head of Family Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'family_members', label: 'Number of Family Members', type: 'number', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'card_type', label: 'Card Type', type: 'select', options: ['BPL', 'APL', 'AAY'], required: true }
      ],
      fee: 0,
      processing_days: 14
    },
    {
      name: 'Residence / Nativity Certificate',
      category: 'Certificates',
      description: 'Proof of permanent residence in Andhra Pradesh, required for school admissions, employment, and other official purposes.',
      required_documents: 'Aadhaar Card, Address Proof, Ration Card (if available)',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'years_of_residence', label: 'Years of Continuous Residence', type: 'number', required: true },
        { name: 'purpose', label: 'Purpose of Certificate', type: 'text', required: true }
      ],
      fee: 20,
      processing_days: 5
    },
    {
      name: 'Pension Application (Old Age / Widow / Disability)',
      category: 'Social Welfare',
      description: 'Apply for a monthly pension under the Old Age, Widow, or Disability welfare schemes administered through the secretariat.',
      required_documents: 'Aadhaar Card, Age/Disability Proof, Bank Passbook, Passport-size Photo',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'pension_type', label: 'Pension Type', type: 'select', options: ['Old Age', 'Widow', 'Disability'], required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ],
      fee: 0,
      processing_days: 15
    },
    {
      name: 'Land Pass Book / Adangal (1-B) Certificate',
      category: 'Land Records',
      description: 'Certified extract of land ownership and cultivation details (1-B / Adangal) for agricultural land parcels.',
      required_documents: 'Aadhaar Card, Land Survey Number Proof, Patta Document',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'survey_number', label: 'Land Survey Number', type: 'text', required: true },
        { name: 'village_mandal', label: 'Village / Mandal', type: 'text', required: true }
      ],
      fee: 25,
      processing_days: 10
    },
    {
      name: 'Marriage Certificate Registration',
      category: 'Certificates',
      description: 'Official registration and certificate of marriage for legal, identity, and administrative purposes.',
      required_documents: 'Aadhaar Cards of Both Spouses, Marriage Invitation/Photographs, Address Proof',
      form_fields: [
        { name: 'spouse1_name', label: 'Spouse 1 Name', type: 'text', required: true },
        { name: 'spouse2_name', label: 'Spouse 2 Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'marriage_date', label: 'Date of Marriage', type: 'date', required: true },
        { name: 'marriage_place', label: 'Place of Marriage', type: 'text', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true }
      ],
      fee: 50,
      processing_days: 7
    }
  ];

  await Service.insertMany(services);
  console.log(`[seed] Inserted ${services.length} services.`);
}

async function seedSchemes() {
  const count = await Scheme.countDocuments();
  if (count > 0) return;

  const schemes = [
    {
      name: 'Old Age Pension Scheme',
      category: 'Social Welfare',
      description: 'Monthly financial assistance for senior citizens to support a dignified life.',
      eligibility: 'Age 60 years or above; family income below the prescribed limit; resident of the local Sachivalayam jurisdiction.',
      benefits: 'Monthly pension credited directly to the beneficiary\u2019s bank account.',
      required_documents: 'Aadhaar Card, Age Proof, Bank Passbook, Passport-size Photo',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    },
    {
      name: 'Widow Pension Scheme',
      category: 'Social Welfare',
      description: 'Monthly pension support for widows to ensure financial security.',
      eligibility: 'Widowed women aged 18 years and above meeting the income criteria.',
      benefits: 'Monthly pension and access to skill-development programs.',
      required_documents: 'Aadhaar Card, Husband\u2019s Death Certificate, Bank Passbook, Passport-size Photo',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    },
    {
      name: 'Disability Pension Scheme',
      category: 'Social Welfare',
      description: 'Financial support for persons with 40% or more disability.',
      eligibility: 'Valid disability certificate with 40% or above disability; income criteria as applicable.',
      benefits: 'Monthly pension and priority access to assistive devices.',
      required_documents: 'Aadhaar Card, Disability Certificate, Bank Passbook, Passport-size Photo',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'disability_percentage', label: 'Disability Percentage', type: 'number', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    },
    {
      name: 'Health Insurance Scheme (Aarogyasri)',
      category: 'Health',
      description: 'Cashless treatment for major illnesses at network hospitals.',
      eligibility: 'Below Poverty Line (BPL) families holding a valid white/health card.',
      benefits: 'Free treatment up to the scheme\u2019s coverage limit for listed medical procedures.',
      required_documents: 'Aadhaar Card, White/Health Card, Address Proof',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'family_members', label: 'Number of Family Members', type: 'number', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true }
      ]
    },
    {
      name: 'Educational Scholarship Scheme',
      category: 'Education',
      description: 'Scholarship support for school and college students from eligible families.',
      eligibility: 'Students enrolled in recognized institutions; family income within prescribed limits.',
      benefits: 'Reimbursement of tuition fees and/or maintenance allowance.',
      required_documents: 'Aadhaar Card, Institution ID Card, Income Certificate, Bank Passbook',
      form_fields: [
        { name: 'student_name', label: 'Student Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'institution_name', label: 'Institution Name', type: 'text', required: true },
        { name: 'course', label: 'Course / Class', type: 'text', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    },
    {
      name: 'Housing Scheme',
      category: 'Housing',
      description: 'Assistance for construction of houses for houseless and landless poor families.',
      eligibility: 'Houseless families with own land or allotted house-site; income criteria as applicable.',
      benefits: 'Financial assistance released in installments linked to construction stages.',
      required_documents: 'Aadhaar Card, House-site/Land Document, Income Certificate, Bank Passbook',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'site_survey_number', label: 'House-site Survey Number', type: 'text', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    },
    {
      name: 'Agriculture Input Subsidy Scheme',
      category: 'Agriculture',
      description: 'Subsidy support to farmers for seeds, fertilizers, and crop inputs.',
      eligibility: 'Registered farmers with valid land records / tenant farmer certificate.',
      benefits: 'Direct subsidy credited to the farmer\u2019s bank account each crop season.',
      required_documents: 'Aadhaar Card, Land Record / Tenant Farmer Certificate, Bank Passbook',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'survey_number', label: 'Land Survey Number', type: 'text', required: true },
        { name: 'crop_type', label: 'Crop Type', type: 'text', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    },
    {
      name: 'Unemployment Stipend Scheme',
      category: 'Employment',
      description: 'Monthly stipend support for eligible unemployed youth while they seek jobs or training.',
      eligibility: 'Educated unemployed youth within the prescribed age group and income limits.',
      benefits: 'Monthly stipend along with access to skill-training and job-placement assistance.',
      required_documents: 'Aadhaar Card, Educational Certificates, Income Certificate, Bank Passbook',
      form_fields: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'applicant_phone', label: 'Contact Phone Number', type: 'tel', required: true },
        { name: 'highest_qualification', label: 'Highest Qualification', type: 'text', required: true },
        { name: 'address', label: 'Residential Address', type: 'textarea', required: true },
        { name: 'bank_account_number', label: 'Bank Account Number', type: 'text', required: true }
      ]
    }
  ];

  await Scheme.insertMany(schemes);
  console.log(`[seed] Inserted ${schemes.length} schemes.`);
}

async function seedAdmin() {
  const existing = await User.countDocuments({ role: 'admin' });
  if (existing > 0) return;

  const name = process.env.ADMIN_NAME || 'Portal Admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@govportal.local').toLowerCase();
  const phone = process.env.ADMIN_PHONE || '9999999999';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const password_hash = await bcrypt.hash(password, 10);

  await User.create({ name, email, phone, password_hash, role: 'admin' });

  console.log(`[seed] Admin account created -> email: ${email} | password: ${password}`);
}

async function init() {
  await connectDB();
  await seedServices();
  await seedSchemes();
  await seedAdmin();
}

module.exports = { init, connectDB };
