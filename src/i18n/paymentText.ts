import { Language } from '../types';

export interface PaymentTranslation {
  // Wallet & Balance
  driverWallet: string;
  currentBalance: string;
  minBalanceRequired: string;
  minBalanceWarning: string;
  walletTopUp: string;
  topUpNow: string;
  ledgerHistory: string;
  noLedgerEntries: string;
  commissionBreakdown: string;

  // Ledger Entry Types
  typeCommission: string;
  typeTopUp: string;
  typeAdjustment: string;
  typePromoCredit: string;
  typeOnlineFare: string;
  typePayout: string;
  typeRefund: string;

  // Ride Completion & Receipt
  rideReceipt: string;
  cashFare: string;
  platformCommission: string;
  driverNetEarning: string;
  promoDiscount: string;
  platformSubsidy: string;
  shareReceipt: string;
  receiptCopied: string;
  cashToCollect: string;
  fareCollectedCash: string;
  completedTripDetails: string;

  // Top-Up Process
  choosePaymentMethod: string;
  companyAccounts: string;
  accountTitle: string;
  accountNumber: string;
  bankName: string;
  copyDetails: string;
  copied: string;
  step1Transfer: string;
  step2SubmitDetails: string;
  senderPhone: string;
  transactionId: string;
  tidPlaceholder: string;
  uploadScreenshot: string;
  screenshotHelp: string;
  submitTopUp: string;
  submittingTopUp: string;
  topUpSubmittedSuccess: string;
  pendingReview: string;
  approved: string;
  rejected: string;

  // Anti-fraud & Validation
  duplicateTidError: string;
  rateLimitTopUpError: string;
  invalidAmountError: string;
  screenshotRequiredError: string;

  // Admin Payments
  adminPaymentsTitle: string;
  pendingTopUps: string;
  noPendingTopUps: string;
  approveTopUp: string;
  rejectTopUp: string;
  enterRejectionReason: string;
  driverBalances: string;
  adjustBalance: string;
  adjustmentAmount: string;
  adjustmentReason: string;
  reasonRequired: string;
  dailyMonthlyMetrics: string;
  grossFares: string;
  commissionEarned: string;
  topUpsReceived: string;
  totalCompletedRides: string;
  exportLedgerCSV: string;
  paymentSettingsTitle: string;
  minDriverBalanceLabel: string;
  savePaymentSettings: string;
  accountsConfigured: string;

  // Disputes
  reportFareProblem: string;
  disputeTitle: string;
  reasonChargedMore: string;
  reasonNotToDestination: string;
  reasonOther: string;
  additionalNotes: string;
  submitDispute: string;
  disputeSubmitted: string;
  disputesList: string;
  noDisputes: string;
  disputeStatusOpen: string;
  disputeStatusResolved: string;

  // Online Payments (Phase 2)
  onlinePaymentComingSoon: string;
  payWithEasypaisa: string;
  payWithJazzCash: string;
  payOnline: string;
  switchToCash: string;
  paymentPending: string;
  paymentSuccess: string;
  paymentFailed: string;
}

export const PAYMENT_TEXT: Record<Language, PaymentTranslation> = {
  en: {
    driverWallet: 'Driver Wallet',
    currentBalance: 'Current Balance',
    minBalanceRequired: 'Minimum Balance Required',
    minBalanceWarning: 'Top up your wallet to continue. Your balance is below the minimum limit.',
    walletTopUp: 'Top Up Wallet',
    topUpNow: 'Top Up Now',
    ledgerHistory: 'Ledger History',
    noLedgerEntries: 'No transactions recorded yet in ledger.',
    commissionBreakdown: 'Commission Breakdown',

    typeCommission: 'Platform Commission',
    typeTopUp: 'Wallet Top-Up',
    typeAdjustment: 'Manual Adjustment',
    typePromoCredit: 'Promo Subsidy Credit',
    typeOnlineFare: 'Online Fare Credit',
    typePayout: 'Wallet Payout',
    typeRefund: 'Payment Refund',

    rideReceipt: 'Trip Fare Receipt',
    cashFare: 'Cash Collected from Passenger',
    platformCommission: 'Platform Commission',
    driverNetEarning: 'Your Net Earning',
    promoDiscount: 'Passenger Promo Discount',
    platformSubsidy: 'Platform Funded Reimbursement',
    shareReceipt: 'Share Receipt',
    receiptCopied: 'Receipt copied to clipboard!',
    cashToCollect: 'Collect Cash',
    fareCollectedCash: 'Paid in Cash',
    completedTripDetails: 'Completed Trip Breakdown',

    choosePaymentMethod: 'Select Transfer Method',
    companyAccounts: 'Official Company Deposit Accounts',
    accountTitle: 'Account Title',
    accountNumber: 'Account / IBAN Number',
    bankName: 'Bank Name',
    copyDetails: 'Copy',
    copied: 'Copied!',
    step1Transfer: '1. Send payment using your mobile wallet / bank app to the official account below:',
    step2SubmitDetails: '2. Enter the transaction details & attach payment receipt screenshot:',
    senderPhone: 'Sender Mobile Number / Account',
    transactionId: 'Transaction ID (TID)',
    tidPlaceholder: 'e.g. 12948192841',
    uploadScreenshot: 'Upload Payment Screenshot',
    screenshotHelp: 'Attach clear proof of transfer (Max 3 MB)',
    submitTopUp: 'Submit Top-Up for Verification',
    submittingTopUp: 'Submitting...',
    topUpSubmittedSuccess: 'Top-up submitted! Admin will verify and credit your balance shortly.',
    pendingReview: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',

    duplicateTidError: 'This Transaction ID (TID) has already been submitted or approved.',
    rateLimitTopUpError: 'You have 5 pending top-ups. Please wait for admin approval before submitting more.',
    invalidAmountError: 'Please enter a valid amount (minimum Rs. 100).',
    screenshotRequiredError: 'Please attach a payment screenshot.',

    adminPaymentsTitle: 'Financial Operations & Payments',
    pendingTopUps: 'Driver Top-Up Queue',
    noPendingTopUps: 'No pending driver top-ups at this time.',
    approveTopUp: 'Approve & Credit Balance',
    rejectTopUp: 'Reject Request',
    enterRejectionReason: 'Reason for rejection (e.g. Invalid TID or unconfirmed funds)',
    driverBalances: 'Driver Balances & Ledger Audit',
    adjustBalance: 'Adjust Balance',
    adjustmentAmount: 'Adjustment PKR (positive or negative)',
    adjustmentReason: 'Mandatory Audit Reason',
    reasonRequired: 'A clear audit reason is required for any manual adjustment.',
    dailyMonthlyMetrics: 'Financial Performance Summary',
    grossFares: 'Total Gross Fares',
    commissionEarned: 'Net Commission Revenue',
    topUpsReceived: 'Top-Ups Approved',
    totalCompletedRides: 'Completed Rides',
    exportLedgerCSV: 'Download Ledger CSV',
    paymentSettingsTitle: 'Company Accounts & Balance Rules',
    minDriverBalanceLabel: 'Minimum Allowed Driver Balance (PKR)',
    savePaymentSettings: 'Save Payment Configurations',
    accountsConfigured: 'Active Deposit Channels',

    reportFareProblem: 'Report a problem with this fare',
    disputeTitle: 'Report Fare Dispute',
    reasonChargedMore: 'Driver charged more than the agreed app fare',
    reasonNotToDestination: 'Driver did not take me to the agreed destination',
    reasonOther: 'Other dispute / issue with the ride',
    additionalNotes: 'Describe what happened...',
    submitDispute: 'Submit Dispute to Support',
    disputeSubmitted: 'Your report has been received. SafarSindh support will audit the ride record.',
    disputesList: 'Passenger Fare Disputes',
    noDisputes: 'No fare disputes submitted.',
    disputeStatusOpen: 'Open Dispute',
    disputeStatusResolved: 'Resolved',

    onlinePaymentComingSoon: 'Coming Soon in Phase 2',
    payWithEasypaisa: 'Pay via Easypaisa',
    payWithJazzCash: 'Pay via JazzCash',
    payOnline: 'Pay Online',
    switchToCash: 'Switch to Cash Payment',
    paymentPending: 'Processing payment...',
    paymentSuccess: 'Payment completed successfully!',
    paymentFailed: 'Payment was not completed. Please try again or switch to cash.',
  },

  ur: {
    driverWallet: 'ڈرائیور والٹ',
    currentBalance: 'موجودہ بیلنس',
    minBalanceRequired: 'کم از کم درکار بیلنس',
    minBalanceWarning: 'سواری جاری رکھنے کے لیے اپنے والٹ میں رقم جمع کروائیں۔ آپ کا بیلنس مقررہ حد سے کم ہے۔',
    walletTopUp: 'بیلنس ریچارج (ٹاپ اپ)',
    topUpNow: 'ابھی ریچارج کریں',
    ledgerHistory: 'مالی کھاتہ (لیجر)',
    noLedgerEntries: 'ابھی تک کوئی مالی اندراج موجود نہیں ہے۔',
    commissionBreakdown: 'کمیشن کی تفصیل',

    typeCommission: 'سفر سنڌ کمیشن فیس',
    typeTopUp: 'والٹ ٹاپ اپ (رقم جمع)',
    typeAdjustment: 'ایڈمن ایڈجسٹمنٹ',
    typePromoCredit: 'پرومو ڈسکاؤنٹ ری ایمبرسمنٹ',
    typeOnlineFare: 'آن لائن کرایہ وصولی',
    typePayout: 'والٹ رقم واپسی',
    typeRefund: 'رقم واپسی (ریفنڈ)',

    rideReceipt: 'سواری کی رسید',
    cashFare: 'مسافر سے وصول کردہ نقد کرایہ',
    platformCommission: 'کمپنی کا کمیشن',
    driverNetEarning: 'آپ کی خالص آمدن',
    promoDiscount: 'پرومو کوڈ رعایت',
    platformSubsidy: 'سفر سنڌ کی طرف سے رعایت کی ادائیگی',
    shareReceipt: 'رسید شیئر کریں',
    receiptCopied: 'رسید کاپی ہو گئی!',
    cashToCollect: 'نقد رقم وصول کریں',
    fareCollectedCash: 'نقد ادائیگی ہو گئی',
    completedTripDetails: 'مکمل سفر کی تفصیلات',

    choosePaymentMethod: 'ادائیگی کا طریقہ منتخب کریں',
    companyAccounts: 'سفر سنڌ کے آفیشل بینک اور والٹ اکاؤنٹس',
    accountTitle: 'اکاؤنٹ کا نام',
    accountNumber: 'اکاؤنٹ / IBAN نمبر',
    bankName: 'بینک کا نام',
    copyDetails: 'کاپی کریں',
    copied: 'کاپی ہو گیا!',
    step1Transfer: '1. اپنے ایزی پیسہ، جاز کیش یا بینک ایپ سے نیچے دیے گئے اکاؤنٹ میں رقم بھیجیں:',
    step2SubmitDetails: '2. رقم بھیجنے کے بعد ٹرانزیکشن کی تفصیلات اور رسید کی تصویر اپ لوڈ کریں:',
    senderPhone: 'بھیجنے والے کا فون نمبر',
    transactionId: 'ٹرانزیکشن آئی ڈی (TID)',
    tidPlaceholder: 'مثلاً 12948192841',
    uploadScreenshot: 'رسید کا اسکرین شاٹ',
    screenshotHelp: 'واضح تصویر منسلک کریں (زیادہ سے زیادہ 3MB)',
    submitTopUp: 'تصدیق کے لیے جمع کروائیں',
    submittingTopUp: 'جمع ہو رہا ہے...',
    topUpSubmittedSuccess: 'درخواست موصول ہو گئی! ایڈمن تصدیق کے بعد فوری رقم آپ کے والٹ میں شامل کر دے گا۔',
    pendingReview: 'زیرِ جائزہ',
    approved: 'منظور شدہ',
    rejected: 'مسترد',

    duplicateTidError: 'یہ ٹرانزیکشن آئی ڈی پہلے سے جمع شدہ یا منظور شدہ ہے۔',
    rateLimitTopUpError: 'آپ کی پہلے سے 5 درخواستیں زیرِ جائزہ ہیں۔ برائے مہربانی ان کی منظوری کا انتظار کریں۔',
    invalidAmountError: 'برائے مہربانی درست رقم درج کریں (کم از کم 100 روپے)۔',
    screenshotRequiredError: 'ٹرانزیکشن کا اسکرین شاٹ منسلک کرنا لازمی ہے۔',

    adminPaymentsTitle: 'مالی امور اور والٹ مینجمنٹ',
    pendingTopUps: 'زیرِ التواء ٹاپ اپس',
    noPendingTopUps: 'اس وقت کوئی درخواست زیرِ التواء نہیں ہے۔',
    approveTopUp: 'منظور کریں اور بیلنس شامل کریں',
    rejectTopUp: 'درخواست مسترد کریں',
    enterRejectionReason: 'مسترد کرنے کی وجہ (مثلاً غلط TID یا رقم موصول نہیں ہوئی)',
    driverBalances: 'ڈرائیورز کا بیلنس اور لیجر آڈٹ',
    adjustBalance: 'بیلنس ایڈجسٹ کریں',
    adjustmentAmount: 'رقم (روپے، جمع یا منفی)',
    adjustmentReason: 'ایڈجسٹمنٹ کی لازمی وجہ',
    reasonRequired: 'آڈٹ کے لیے وجہ درج کرنا لازمی ہے۔',
    dailyMonthlyMetrics: 'مالیاتی اعداد و شمار کا جائزہ',
    grossFares: 'کل سفری کرایہ',
    commissionEarned: 'خالص کمیشن آمدن',
    topUpsReceived: 'منظور شدہ ٹاپ اپس',
    totalCompletedRides: 'مکمل شدہ سواریاں',
    exportLedgerCSV: 'لیجر CSV ڈاؤن لوڈ کریں',
    paymentSettingsTitle: 'کمپنی اکاؤنٹس اور بیلنس کے اصول',
    minDriverBalanceLabel: 'ڈرائیور کے لیے کم از کم اجازت شدہ بیلنس (روپے)',
    savePaymentSettings: 'ترتیبات محفوظ کریں',
    accountsConfigured: 'فعال جمع کھاتے',

    reportFareProblem: 'کرایہ کے متعلق شکایت درج کریں',
    disputeTitle: 'کرایہ پر تنازعہ / شکایت',
    reasonChargedMore: 'ڈرائیور نے طے شدہ کرایہ سے زیادہ وصول کیا',
    reasonNotToDestination: 'ڈرائیور نے طے شدہ مقام تک نہیں پہنچایا',
    reasonOther: 'دیگر مسئلہ',
    additionalNotes: 'تفصیل بیان کریں...',
    submitDispute: 'شکایت جمع کروائیں',
    disputeSubmitted: 'شکایت موصول ہو گئی، انتظامیہ جانچ پڑتال کرے گی۔',
    disputesList: 'کرایہ کے تنازعات',
    noDisputes: 'کوئی شکایت موجود نہیں ہے۔',
    disputeStatusOpen: 'زیرِ جائزہ شکایت',
    disputeStatusResolved: 'حل شدہ',

    onlinePaymentComingSoon: 'فیز 2 میں جلد دستیاب ہوگا',
    payWithEasypaisa: 'ایزی پیسہ سے ادائیگی',
    payWithJazzCash: 'جاز کیش سے ادائیگی',
    payOnline: 'آن لائن ادائیگی',
    switchToCash: 'نقد ادائیگی پر منتقل ہوں',
    paymentPending: 'ادائیگی کی توثیق جاری ہے...',
    paymentSuccess: 'ادائیگی کامیابی سے مکمل ہو گئی!',
    paymentFailed: 'ادائیگی ناکام ہو گئی۔ دوبارہ کوشش کریں یا نقد ادائیگی کریں۔',
  },

  sd: {
    driverWallet: 'ڊرائيور والٽ',
    currentBalance: 'موجوده بيلنس',
    minBalanceRequired: 'گهٽ ۾ گهٽ گهربل بيلنس',
    minBalanceWarning: 'سواريون جاري رکڻ لاءِ پنھنجي والٽ ۾ رقم جمع ڪرايو. اوھان جو بيلنس حد کان گهٽ آهي.',
    walletTopUp: 'بيلنس ريچارج (ٽاپ اپ)',
    topUpNow: 'هاڻي ريچارج ڪريو',
    ledgerHistory: 'کاتو (ليجر هسٽري)',
    noLedgerEntries: 'في الحال ڪو به مالي رڪارڊ موجود ناهي.',
    commissionBreakdown: 'ڪميشن جي تفصيل',

    typeCommission: 'سفر سنڌ ڪميشن فيس',
    typeTopUp: 'والٽ ٽاپ اپ (رقم جمع)',
    typeAdjustment: 'ايڊمن ايڊجسٽمينٽ',
    typePromoCredit: 'پرومو ڪوڊ رعايت جي ادائيگي',
    typeOnlineFare: 'آن لائن ڀاڙو وصولي',
    typePayout: 'والٽ رقم واپسي',
    typeRefund: 'رقم واپسي (ري فنڊ)',

    rideReceipt: 'سواري جي رسيد',
    cashFare: 'مسافر کان ورتل نقد ڀاڙو',
    platformCommission: 'ڪمپني جو ڪميشن',
    driverNetEarning: 'اوھان جي حقيقي ڪمائي',
    promoDiscount: 'پرومو ڪوڊ رعايت',
    platformSubsidy: 'سفر سنڌ پاران ادا ڪيل رعايت',
    shareReceipt: 'رسيد شيئر ڪريو',
    receiptCopied: 'رسيد ڪاپي ٿي وئي!',
    cashToCollect: 'نقد رقم وٺو',
    fareCollectedCash: 'نقد ادائيگي ٿي وئي',
    completedTripDetails: 'مڪمل سواري جا تفصيل',

    choosePaymentMethod: 'ادائيگي جو طريقو چونڊيو',
    companyAccounts: 'سفر سنڌ جا سرڪاري بينڪ ۽ والٽ اڪائونٽس',
    accountTitle: 'اڪائونٽ جو نالو',
    accountNumber: 'اڪائونٽ / IBAN نمبر',
    bankName: 'بينڪ جو نالو',
    copyDetails: 'ڪاپي ڪريو',
    copied: 'ڪاپي ٿي ويو!',
    step1Transfer: '1. پنھنجي ايزي پئسا، جاز ڪيش يا بينڪ ايپ مان هيٺ ڏنل اڪائونٽ ۾ رقم موڪليو:',
    step2SubmitDetails: '2. رقم موڪلڻ بعد تفصيل ۽ رسيد جي تصوير اپلوڊ ڪريو:',
    senderPhone: 'موڪليندڙ جو فون نمبر',
    transactionId: 'ٽرانزيڪشن آئي ڊي (TID)',
    tidPlaceholder: 'مثال طور 12948192841',
    uploadScreenshot: 'رسيد جو اسڪرين شاٽ',
    screenshotHelp: 'صاف تصوير شامل ڪريو (وڌ ۾ وڌ 3MB)',
    submitTopUp: 'تصديق لاءِ موڪليو',
    submittingTopUp: 'موڪلجي پيو...',
    topUpSubmittedSuccess: 'درخواست ملي وئي! ايڊمن جي تصديق کانپوءِ رقم اوهان جي کاتي ۾ وڌي ويندي.',
    pendingReview: 'جاچ هيٺ',
    approved: 'منظور ٿيل',
    rejected: 'رد ٿيل',

    duplicateTidError: 'هي ٽرانزيڪشن آئي ڊي اڳ ۾ جمع ٿيل يا منظور ٿيل آهي.',
    rateLimitTopUpError: 'اوهان جون اڳ ۾ ئي 5 درخواستون جاچ هيٺ آهن، مهرباني ڪري انتظار ڪريو.',
    invalidAmountError: 'مهرباني ڪري درست رقم لکو (گهٽ ۾ گهٽ 100 روپيا).',
    screenshotRequiredError: 'ٽرانزيڪشن جي تصوير اپلوڊ ڪرڻ لازمي آهي.',

    adminPaymentsTitle: 'مالي انتظام ۽ والٽ مئنيجمينٽ',
    pendingTopUps: 'جاچ هيٺ ٽاپ اپس',
    noPendingTopUps: 'هن وقت ڪا به درخواست جاچ هيٺ ناهي.',
    approveTopUp: 'منظور ڪريو ۽ کاتي ۾ رقم وڌايو',
    rejectTopUp: 'درخواست رد ڪريو',
    enterRejectionReason: 'رد ڪرڻ جو سبب (مثال: غلط TID يا اڪائونٽ ۾ پئسا نه پهتا)',
    driverBalances: 'ڊرائيورن جا بيلنس ۽ آڊٽ',
    adjustBalance: 'بيلنس تبديل ڪريو',
    adjustmentAmount: 'رقم (روپيا، واڌ يا ڪٽوتي)',
    adjustmentReason: 'آڊٽ سبب لکو',
    reasonRequired: 'آڊٽ لاءِ سبب لکڻ لازمي آهي.',
    dailyMonthlyMetrics: 'مالي انگ اکرن جو جائزو',
    grossFares: 'ڪل گڏيل ڀاڙو',
    commissionEarned: 'ڪمپني جو ڪل ڪميشن',
    topUpsReceived: 'منظور ٿيل ٽاپ اپس',
    totalCompletedRides: 'مڪمل ٿيل سواريون',
    exportLedgerCSV: 'ليجر CSV فائل ڊائون لوڊ ڪريو',
    paymentSettingsTitle: 'ڪمپني اڪائونٽس ۽ قاعدا',
    minDriverBalanceLabel: 'ڊرائيور لاءِ گهٽ ۾ گهٽ اجازت ڏنل بيلنس (روپيا)',
    savePaymentSettings: 'سيٽنگون محفوظ ڪريو',
    accountsConfigured: 'موجود اڪائونٽس',

    reportFareProblem: 'ڀاڙي بابت شڪايت داخل ڪريو',
    disputeTitle: 'ڀاڙي بابت مسئلو',
    reasonChargedMore: 'ڊرائيور مقرر ڪيل ڀاڙي کان وڌيڪ پئسا ورتا',
    reasonNotToDestination: 'ڊرائيور آخري منزل تائين نه پهچايو',
    reasonOther: 'ٻيو ڪو سبب',
    additionalNotes: 'وضاحت سان لکو...',
    submitDispute: 'شڪايت موڪليو',
    disputeSubmitted: 'شڪايت ملي وئي، عملو جلد جاچ ڪندو.',
    disputesList: 'ڀاڙي بابت شڪايتون',
    noDisputes: 'ڪا به شڪايت موجود ناهي.',
    disputeStatusOpen: 'جاچ هيٺ',
    disputeStatusResolved: 'حل ٿيل',

    onlinePaymentComingSoon: 'فيز 2 ۾ جلد پيش ڪيو ويندو',
    payWithEasypaisa: 'ايزي پئسا ذريعي ادائيگي',
    payWithJazzCash: 'جاز ڪيش ذريعي ادائيگي',
    payOnline: 'آن لائن ادائيگي',
    switchToCash: 'نقد ادائيگي تي وڃو',
    paymentPending: 'ادائيگي جاچي پئي وڃي...',
    paymentSuccess: 'ادائيگي مڪمل ٿي وئي!',
    paymentFailed: 'ادائيگي ناڪام ٿي. مهرباني ڪري ٻيهر ڪوشش ڪريو يا نقد پئسا ڏيو.',
  },
};
