import { createContext, createElement, useContext, useEffect, useState } from 'react'

export const dict = {
  en: {
    appName: 'Tender Package Builder',
    tagline: 'Check, order and merge tender documents into one PDF',
    langToggle: 'বাংলা',
    langLabel: 'Switch language',
    themeLabel: 'Switch theme',
    privacy: 'Frontend only · your files never leave this browser',
    step1: 'Tender',
    step2: 'Files',
    step3: 'Match & Check',
    step4: 'Generate',
    step1Hint: 'Load requirements.json',
    step2Hint: 'Add PDF files',
    step3Hint: 'Link files and enter expiry dates',
    step4Hint: 'Download one ready package',
    comingSoon: 'Coming next',
    // tender
    loadJson: 'Load requirements.json',
    dropJson: 'Drop requirements.json here or click to choose',
    trySample: 'Try sample',
    changeTender: 'Change',
    tenderId: 'Tender ID',
    title: 'Title',
    entity: 'Procuring entity',
    bidder: 'Bidder',
    deadline: 'Submission deadline',
    daysLeft: '{n} days left',
    dueToday: 'Due today',
    overdue: 'Deadline passed',
    requirements: 'Required documents',
    mandatory: 'Mandatory',
    optional: 'Optional',
    hasExpiry: 'Expiry',
    errJson: 'This is not a valid requirements.json file.',
    errJsonFields: 'requirements.json is missing tender details or the requirements list.',
    tenderLoaded: 'Tender loaded',
    // files
    files: 'Uploaded files',
    dropPdf: 'Drop PDF files here or click to choose',
    pdfOnly: 'PDF only · up to 30 files · 50 MB total',
    pages: '{n} pages',
    page1: '1 page',
    remove: 'Remove',
    notPdf: '"{name}" is not a PDF and was rejected.',
    tooMany: 'Maximum 30 files. Some files were not added.',
    tooBig: 'Total size is over 50 MB. Some files were not added.',
    damaged: '"{name}" is damaged or cannot be read.',
    passwordPdf: '"{name}" is password-protected and cannot be used.',
    duplicate: 'Duplicate',
    sameAs: 'Same as {name}',
    noFiles: 'No files yet',
    reading: 'Reading…',
    filesAdded: '{n} files added',
    usedFor: 'Used for',
    // match
    chooseFile: 'Choose a file…',
    clear: 'Clear match',
    expiryDate: 'Expiry date',
    usedElsewhere: 'already used',
    dupUsed: 'duplicate already used',
    loadTenderFirst: 'Load a tender first',
    ready: 'ready',
    // statuses
    st_MISSING: 'Missing',
    st_EXPIRY_NEEDED: 'Expiry date needed',
    st_EXPIRED: 'Expired',
    st_NOT_PROVIDED: 'Not provided',
    st_OK: 'OK',
    // generate
    generate: 'Generate package',
    generating: 'Creating PDF…',
    download: 'Download',
    blockedBy: 'Fix these first:',
    allGood: 'All checks passed. Ready to generate.',
    generated: 'Package ready: {n} pages',
    genError: 'Could not create the package.',
    // bonus
    autoMatch: 'Auto-match',
    autoMatched: '{n} matches suggested',
    autoMatchHint: 'Suggest matches from file names. Please check them.',
    undo: 'Undo',
    preview: 'Preview',
    datesFound: '{n} expiry dates found',
    autoDate: 'Read from PDF',
    autoDateHint: 'Smart Read found this date inside the PDF. Please check it.',
    useFound: 'Use {date}',
    guessHint: 'Smart Read: this looks like this document',
    close: 'Close',
    withIndex: 'Add index page after cover',
    looksLike: 'This file name looks like "{doc}". Please check.',
    exportCsv: 'Export checklist (CSV)',
    saveProject: 'Save project',
    openProject: 'Open project',
    projectSaved: 'Project saved',
    projectOpened: 'Project opened. Re-add files if needed.',
    seal: 'Seal / signature',
    sealUpload: 'Upload PNG',
    sealPages: 'Place on',
    sealAll: 'All pages',
    sealLast: 'Last page of each document',
    sealNone: 'None',
    sealNotPng: '"{name}" is not a PNG image.',
    reset: 'Start over',
  },
  bn: {
    appName: 'টেন্ডার প্যাকেজ বিল্ডার',
    tagline: 'টেন্ডারের কাগজপত্র যাচাই, সাজানো ও একটি PDF-এ যুক্ত করুন',
    langToggle: 'English',
    langLabel: 'ভাষা পরিবর্তন',
    themeLabel: 'থিম পরিবর্তন',
    privacy: 'শুধু ব্রাউজারে চলে · আপনার ফাইল কোথাও যায় না',
    step1: 'টেন্ডার',
    step2: 'ফাইল',
    step3: 'মিলান ও যাচাই',
    step4: 'তৈরি করুন',
    step1Hint: 'requirements.json খুলুন',
    step2Hint: 'PDF ফাইল যোগ করুন',
    step3Hint: 'ফাইল মিলান ও মেয়াদের তারিখ দিন',
    step4Hint: 'একটি প্রস্তুত প্যাকেজ ডাউনলোড করুন',
    comingSoon: 'আসছে',
    loadJson: 'requirements.json খুলুন',
    dropJson: 'requirements.json এখানে ছাড়ুন বা ক্লিক করে বাছুন',
    trySample: 'নমুনা দেখুন',
    changeTender: 'বদলান',
    tenderId: 'টেন্ডার আইডি',
    title: 'শিরোনাম',
    entity: 'ক্রয়কারী প্রতিষ্ঠান',
    bidder: 'দরদাতা',
    deadline: 'জমার শেষ তারিখ',
    daysLeft: '{n} দিন বাকি',
    dueToday: 'আজই শেষ দিন',
    overdue: 'শেষ তারিখ পার হয়েছে',
    requirements: 'প্রয়োজনীয় কাগজপত্র',
    mandatory: 'বাধ্যতামূলক',
    optional: 'ঐচ্ছিক',
    hasExpiry: 'মেয়াদ',
    errJson: 'এটি সঠিক requirements.json ফাইল নয়।',
    errJsonFields: 'requirements.json-এ টেন্ডারের তথ্য বা কাগজের তালিকা নেই।',
    tenderLoaded: 'টেন্ডার লোড হয়েছে',
    files: 'আপলোড করা ফাইল',
    dropPdf: 'PDF ফাইল এখানে ছাড়ুন বা ক্লিক করে বাছুন',
    pdfOnly: 'শুধু PDF · সর্বোচ্চ ৩০টি ফাইল · মোট ৫০ MB',
    pages: '{n} পৃষ্ঠা',
    page1: '১ পৃষ্ঠা',
    remove: 'মুছুন',
    notPdf: '"{name}" PDF নয়, তাই বাতিল করা হয়েছে।',
    tooMany: 'সর্বোচ্চ ৩০টি ফাইল। কিছু ফাইল যোগ হয়নি।',
    tooBig: 'মোট আকার ৫০ MB-এর বেশি। কিছু ফাইল যোগ হয়নি।',
    damaged: '"{name}" নষ্ট বা পড়া যাচ্ছে না।',
    passwordPdf: '"{name}" পাসওয়ার্ড দিয়ে সুরক্ষিত, ব্যবহার করা যাবে না।',
    duplicate: 'ডুপ্লিকেট',
    sameAs: '{name}-এর মতো একই',
    noFiles: 'এখনও কোনো ফাইল নেই',
    reading: 'পড়া হচ্ছে…',
    filesAdded: '{n}টি ফাইল যোগ হয়েছে',
    usedFor: 'ব্যবহৃত',
    chooseFile: 'ফাইল বাছুন…',
    clear: 'মিল মুছুন',
    expiryDate: 'মেয়াদ শেষের তারিখ',
    usedElsewhere: 'ইতিমধ্যে ব্যবহৃত',
    dupUsed: 'ডুপ্লিকেট ইতিমধ্যে ব্যবহৃত',
    loadTenderFirst: 'আগে টেন্ডার লোড করুন',
    ready: 'প্রস্তুত',
    st_MISSING: 'নেই',
    st_EXPIRY_NEEDED: 'মেয়াদের তারিখ দিন',
    st_EXPIRED: 'মেয়াদোত্তীর্ণ',
    st_NOT_PROVIDED: 'দেওয়া হয়নি',
    st_OK: 'ঠিক আছে',
    generate: 'প্যাকেজ তৈরি করুন',
    generating: 'PDF তৈরি হচ্ছে…',
    download: 'ডাউনলোড',
    blockedBy: 'আগে এগুলো ঠিক করুন:',
    allGood: 'সব যাচাই সম্পন্ন। তৈরি করার জন্য প্রস্তুত।',
    generated: 'প্যাকেজ প্রস্তুত: {n} পৃষ্ঠা',
    genError: 'প্যাকেজ তৈরি করা যায়নি।',
    autoMatch: 'স্বয়ংক্রিয় মিলান',
    autoMatched: '{n}টি মিল প্রস্তাব করা হয়েছে',
    autoMatchHint: 'ফাইলের নাম দেখে মিল প্রস্তাব করে। একবার যাচাই করে নিন।',
    undo: 'ফিরিয়ে নিন',
    preview: 'প্রিভিউ',
    datesFound: '{n}টি মেয়াদের তারিখ পাওয়া গেছে',
    autoDate: 'PDF থেকে পড়া',
    autoDateHint: 'স্মার্ট রিড PDF-এর ভেতরে এই তারিখ পেয়েছে। একবার যাচাই করুন।',
    useFound: '{date} ব্যবহার করুন',
    guessHint: 'স্মার্ট রিড: এটি এই কাগজ মনে হচ্ছে',
    close: 'বন্ধ করুন',
    withIndex: 'কভারের পরে সূচিপত্র যোগ করুন',
    looksLike: 'ফাইলের নাম দেখে "{doc}" মনে হচ্ছে। একবার যাচাই করুন।',
    exportCsv: 'চেকলিস্ট এক্সপোর্ট (CSV)',
    saveProject: 'প্রজেক্ট সংরক্ষণ',
    openProject: 'প্রজেক্ট খুলুন',
    projectSaved: 'প্রজেক্ট সংরক্ষিত হয়েছে',
    projectOpened: 'প্রজেক্ট খোলা হয়েছে। প্রয়োজনে ফাইল আবার যোগ করুন।',
    seal: 'সিল / স্বাক্ষর',
    sealUpload: 'PNG আপলোড',
    sealPages: 'কোথায় বসবে',
    sealAll: 'সব পৃষ্ঠায়',
    sealLast: 'প্রতিটি কাগজের শেষ পৃষ্ঠায়',
    sealNone: 'কোথাও না',
    sealNotPng: '"{name}" PNG ছবি নয়।',
    reset: 'নতুন করে শুরু',
  },
}

const bnDigits = '০১২৩৪৫৬৭৮৯'
export const toBnDigits = (s) => String(s).replace(/\d/g, (d) => bnDigits[d])

function initial(key, allowed, fallback) {
  const url = new URLSearchParams(location.search).get(key)
  if (allowed.includes(url)) return url
  try {
    const saved = localStorage.getItem(key)
    if (allowed.includes(saved)) return saved
  } catch {}
  return fallback
}

const Ctx = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => initial('lang', ['en', 'bn'], 'en'))
  const [theme, setTheme] = useState(() => initial('theme', ['light', 'dark'], 'light'))

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = dict[lang].appName
    try { localStorage.setItem('lang', lang) } catch {}
  }, [lang])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  const t = (key, vars = {}) => {
    let s = dict[lang][key] ?? dict.en[key] ?? key
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, lang === 'bn' && typeof v === 'number' ? toBnDigits(v) : v)
    return s
  }
  const num = (n) => (lang === 'bn' ? toBnDigits(n) : String(n))

  return createElement(Ctx.Provider, { value: { lang, setLang, theme, setTheme, t, num } }, children)
}

export const useT = () => useContext(Ctx)
