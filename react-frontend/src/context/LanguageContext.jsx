import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦', dir: 'rtl' },
];

export const translations = {
  en: {
    // Navigation
    navHome: "Home",
    navSocialStream: "Live Stream",
    navAnalyzer: "AI Analyzer",
    navDossiers: "Verification History",
    navAbout: "About",
    navAdmin: "Admin Dashboard",
    navSignIn: "Sign In",
    navRegister: "Register",
    navProfile: "My Profile",
    navLogout: "Sign Out",

    // Hero Section
    heroTitlePrefix: "Multimodal Fake News",
    heroTitleHighlighted: "Classifier",
    heroTitleSuffix: "",
    heroSubtitle: "Empowering users to instantly detect cross-modal disinformation across 7 languages using state-of-the-art deep neural networks.",
    verifyNow: "Verify a Claim Now",
    compareModels: "Compare AI Models",

    // Feature Cards
    multilingualTitle: "Multilingual Support",
    multilingualDesc: "Supports multiple languages (including Arabic, French, and English) for global disinformation detection.",
    multiDomainTitle: "Multi-Domain Analysis",
    multiDomainDesc: "Classifies news across Politics, Health, Science, Technology, Entertainment, Sports, and Economy.",
    multiModalTitle: "Multi-Modal Processing",
    multiModalDesc: "Investigates text articles and images simultaneously for comprehensive cross-modal cross-verification.",

    // How It Works
    howItWorks: "How It Works",
    step1Title: "Upload Content",
    step1Desc: "Paste article text and/or upload image.",
    step2Title: "Select Parameters",
    step2Desc: "Choose your AI model and target language.",
    step3Title: "AI Analysis",
    step3Desc: "Our multimodal engine processes content through advanced neural networks.",
    step4Title: "Get Results",
    step4Desc: "Receive confidence scores and clear Real/Fake verdicts.",

    // Stats
    languagesLabel: "Languages",
    countriesLabel: "Countries",

    // Footer
    footerDesc: "An intelligent AI platform designed to instantly detect multimodal fake news across texts, images, and languages using state-of-the-art deep learning models.",
    footerLocation: "Faculty of Sciences, Moulay Ismail University, Meknès, Morocco",
    footerThesisProject: "Master's Thesis Project.",
    rightsReserved: "All rights reserved.",
    quickNav: "Quick Links",
    termsPrivacyHeader: "Community & Support",
    termsPrivacy: "Terms & Privacy Policy",
    academicNode: "Academic Affiliation",
    homeDashboard: "Home",
    services: "Claim Analyzer",
    modelsLibrary: "AI Models",
    team: "About",
    peerReviews: "User Reviews",
    support: "Contact Us",
    language: "Language",

    // About Page
    aboutAcademicInitiative: "Academic Research Project",
    aboutHeroTitle: "Fighting Disinformation",
    aboutHeroTitleHighlight: "with Multimodal AI",
    aboutHeroSubtitle: "Instantly verify the authenticity of news claims across text and image evidence using state-of-the-art AI.",
    aboutStoryTitle: "Who We Are & Our Story",
    aboutStoryP1: "In an era defined by the relentless acceleration of social media and digital news, the boundary between truth and fabrication has never been more fragile. Fake news no longer travels on words alone — modern disinformation is a sophisticated craft, weaving together text, images, and video to manufacture credibility and amplify reach. Traditional detection methods, confined to a single modality, are ill-equipped for this challenge: unimodal classifiers miss the subtle, cross-modal contradictions that reveal a story's deception.",
    aboutStoryP2: "FakeNewsHunter was born from this urgent need. Developed as a Master's thesis at the Faculty of Sciences, Université Moulay Ismail, Meknès, Morocco, by Safae ERAJI under the supervision of Pr. Ed-Drissiya EL-ALLALY, this platform is built on a single conviction: that truth requires looking at the full picture. By simultaneously analyzing both the textual claims and visual evidence within a publication, FakeNewsHunter surfaces the inconsistencies that deceive at a glance but betray under detailed AI analysis.",
    aboutStoryP3: "At its core, FakeNewsHunter combines Natural Language Processing, Computer Vision, and Deep Learning into a unified intelligence engine. The result is an intuitive, accessible tool that empowers anyone to verify the authenticity of digital news.",
    aboutTeamTitle: "The People Behind It",
    aboutSafaeRole: "AI & Data Science M2 Student",
    aboutSafaeBio: "Master 2 candidate at the Faculty of Sciences, Moulay Ismail University, Meknès. Engineered the end-to-end multimodal deep learning pipeline, neural feature extraction models, and modern web architecture for this platform.",
    aboutSupervisorRole: "Thesis Supervisor & Academic Advisor",
    aboutSupervisorBio: "Professor of Computer Science & AI Researcher at the Faculty of Sciences, Moulay Ismail University, Meknès. Specializes in Natural Language Processing (NLP), Information Extraction, and Machine Learning. Provided continuous academic supervision, research direction, and guidance from the inception to completion of this Master's thesis project.",
    aboutObjectivesTitle: "Research Objectives",
    aboutUserReviewsPrefix: "User Reviews & Ratings",
    aboutSubmitReview: "Submit a Review",
    aboutYourName: "Your Full Name",
    aboutNamePlaceholder: "e.g. Dr. Alex Vance",
    aboutNamePlaceholderNormal: "e.g. Alex Vance",
    aboutInstitution: "Institution / Affiliation",
    aboutInstitutionPlaceholder: "e.g. Moulay Ismail University",
    aboutRatingScore: "Rating Score",
    rating5: "5 Stars - Excellent",
    rating4: "4 Stars - Good",
    rating3: "3 Stars - Average",
    rating2: "2 Stars - Poor",
    rating1: "1 Star - Terrible",
    aboutYourComments: "Your Comments / Review",
    aboutCommentsPlaceholder: "Share your feedback on model accuracy, speed, or interface usability...",
    aboutPostReview: "Post Review",
    aboutReviewSuccess: "Thank you for your feedback! Your review has been saved.",
    aboutContactInfo: "Contact Information",
    aboutContactSubtitle: "Have questions or wish to collaborate? Feel free to write to us.",
    aboutInstLocation: "INSTITUTION LOCATION",
    aboutInstLocationValue: "Faculty of Sciences - Moulay Ismail University, Meknès, Morocco",
    aboutWebsiteLink: "WEBSITE LINK",
    aboutSendInquiry: "Send Academic Inquiry",
    aboutEmailAddress: "Email Address",
    aboutSubject: "Subject / Topic",
    aboutSubjectPlaceholder: "e.g. Research Collaboration Inquiry",
    aboutMessageBody: "Message Body",
    aboutMessagePlaceholder: "Write your detailed message or collaboration request here...",
    aboutSendMessage: "Send Message",
    aboutContactSuccess: "Your message has been sent successfully! Our research team will respond shortly.",
    aboutAuthRequired: "Authentication Required",
    aboutAuthRequiredDesc: "Please sign in in order to use the platform services and be able to rate it.",
    aboutInquiryAuthDesc: "Please sign in or register to submit academic inquiries and send messages directly to our research team.",
    aboutSignInRegister: "Sign In / Register",
    aboutSupportTitle: "Support This Project",
    aboutSupportSubtitle: "If this platform helps your work, sponsorship keeps benchmarks, infrastructure, and documentation moving forward.",
    aboutImpactItem1: "Dataset maintenance and multilingual curation",
    aboutImpactItem2: "GPU compute for model training and comparisons",
    aboutImpactItem3: "Backend and frontend hosting reliability",
    aboutImpactItem4: "Ongoing maintenance, quality assurance, and docs",
    aboutTryDemo: "Try Live Demo",
    aboutQuickstartGuide: "Open Quickstart Guide",
    aboutRoadmapTitle: "Public Roadmap",
    aboutRoadmapSubtitle: "Sponsor-backed milestones currently prioritized:",
    aboutRoadmapItem1: "Expanded multilingual benchmarking and error analysis",
    aboutRoadmapItem2: "Reproducible experiment pipelines and model cards",
    aboutRoadmapItem3: "Better explainability outputs and confidence calibration",
    aboutRoadmapItem4: "Deployment guides for cloud and edge environments",
    aboutVisibilityText: "Follow project updates on GitHub, LinkedIn, Reddit, and Hugging Face communities, and engage through issues, PRs, and in-app reviews.",
    aboutRecognitionTitle: "Sponsor Recognition",
    aboutRecognitionItem1: "README acknowledgments",
    aboutRecognitionItem2: "Release-note shoutouts",
    aboutRecognitionItem3: "Milestone update mentions",

    // Login Form Keys
    loginWelcome: "Welcome Back",
    loginSubtitle: "Sign in to analyze and verify claims.",
    loginUsername: "USERNAME",
    loginPassword: "PASSWORD",
    loginForgot: "Forgot Password?",
    loginSubmit: "Sign In",
    loginNoAccount: "Don't have an account?",
    loginRegisterHere: "Register here",
    loginVerifying: "Verifying...",
    loginRecoverTitle: "Recover Password",
    loginRecoverSub: "Enter your account email to receive a password reset code.",
    loginResetTitle: "Reset Password",
    loginResetSub: "Enter the 6-digit verification code and your new password.",
    loginEmail: "EMAIL ADDRESS",
    loginCancel: "Cancel",
    loginSendCode: "Send Reset Code",
    loginVerifyCode: "VERIFICATION CODE",
    loginNewPassword: "NEW PASSWORD",
    loginConfirmNewPassword: "CONFIRM NEW PASSWORD",
    loginResetSubmit: "Reset Password",
    loginBack: "Back to Sign In",

    // Register Form Keys
    regTitle: "Create Account",
    regSubtitle: "Create an account to start analyzing and verifying news claims with AI",
    regUsername: "USERNAME",
    regEmail: "EMAIL ADDRESS",
    regFirstName: "FIRST NAME",
    regLastName: "LAST NAME",
    regPassword: "PASSWORD",
    regConfirmPassword: "CONFIRM PASSWORD",
    regSubmit: "Register",
    regCreating: "Creating Account...",
    regHasAccount: "Already have an account?",
    regSignIn: "Sign In",
    regCodeSent: "We sent a 6-digit verification code to",
    regEnterCode: "VERIFICATION CODE",
    regVerifying: "Verifying...",
    regVerifyBtn: "Verify Email",
    regBack: "Back to Registration",

    // Global Alerts & Modals
    logoutConfirmMsg: "Are you sure you want to sign out of your account?",
    logoutSuccessMsg: "You have successfully signed out.",
    langChangedMsg: "Language updated successfully!",

    // Profile Page
    msgEmailRequired: "Email address is required.",
    msgPassMismatch: "Passwords do not match.",
    msgPassLength: "Password must be at least 6 characters long.",
    msgFailedUpdate: "Failed to update profile.",
    msgSuccessSave: "Profile updated successfully!",
    msgSuccessUpdate: "Profile settings updated!",
    msgUpdateFailed: "Failed to update profile.",
    msgErrorUpdate: "Error updating profile settings.",
    msgFailedUpdateProfile: "Failed to update profile.",
    msgImgSize: "Image size must be less than 5MB.",
    msgPhotoLoadedSubmit: "Photo selected! Click 'Save Changes' to update your avatar.",
    msgPhotoLoadedClick: "Photo loaded! Click Save Changes below.",
    msgUrlLoadedSubmit: "Avatar URL updated! Click 'Save Changes' to apply.",
    msgUrlLoadedSuccess: "Avatar URL updated! Click Save Changes.",
    msgValidUrl: "Please enter a valid image URL starting with http:// or https://",
    msgInvalidUrl: "Invalid image URL.",
    msgAccentChanged: "Accent theme changed to",
    profileThemeIndigo: "Indigo Cyberpunk",
    profileThemeEmerald: "Emerald Matrix",
    profileThemeRose: "Rose Crimson",
    profileThemeAmber: "Amber Sunset",
    profileTitle: "User Profile Settings",
    profileSubtitle: "Manage your identity, security credentials, and platform preferences.",
    adminProfileTitle: "System Administrator Profile Settings",
    adminProfileSubtitle: "Manage your administrator identity, security credentials, system-wide access, and platform preferences.",
    profileRoleAdmin: "System Administrator",
    profileRoleUser: "",
    profileModifyPic: "Change Profile Picture",
    profileTabSeed: "Avatar Generator",
    profileTabUpload: "Upload Image",
    profileTabUrl: "Image URL",
    profilePlaceholderSeed: "Enter seed name...",
    profileSeedDesc: "Generates a unique avatar based on the seed name.",
    profileChooseFile: "Choose an image file",
    profileMaxSize: "PNG, JPG, or WEBP up to 5MB",
    profilePlaceholderUrl: "https://example.com/avatar.jpg",
    profileApply: "Apply URL",
    profileUrlDesc: "Provide a direct web link to your profile picture.",
    profileFirstName: "First Name",
    msgJohn: "Safae",
    profileLastName: "Last Name",
    msgDoe: "Eraji",
    profileEmail: "Email Address",
    profileSecPassword: "Security & Password",
    profileNewPassword: "New Password (Optional)",
    profileConfirmPassword: "Confirm New Password",
    profileSaving: "Saving Changes...",
    profileUpdateBtn: "Save Changes",
    profileCustomizerTitle: "Theme Customizer",
    profileCustomizerDesc: "Select your preferred accent color scheme for the application interface.",

    // Analyzer & Dossiers Page
    modelsParadigm1Title: "State of the Art Multimodal Fusion",
    modelsParadigm2Title: "Foundational Cross-Modal Architectures",
    modelsParadigm3Title: "Adversarial & Contrastive Learning",
    modelsParadigm4Title: "Attention-Driven Multimodal Alignment",
    modelsParadigm5Title: "Variational & Graph Fusion",
    modelsParadigm6Title: "PEFT & Distilled Neural Frameworks",
    analyzerVerdictFake: "Fake News Detected",
    analyzerVerdictReal: "Authentic Content Verified",
    analyzerVerdictFakeSub: "High probability of deceptive or manipulated information.",
    analyzerVerdictRealSub: "High probability of verified truthful content.",
    analyzerTitle: "Detect Fake News Instantly",
    analyzerSubtitle: "Paste an article and/or upload an image — our AI analyzes text and visuals together to tell you if it's real or fake.",
    analyzerNewsText: "Article / Claim Text",
    analyzerTextPlaceholder: "Paste news article text or claim details here...",
    analyzerWords: "words",
    analyzerExtractClaim: "Extract Key Claims",
    analyzerScrape: "Fetch from URL",
    analyzerScrapeSuccess: "Content Fetched",
    analyzerVisualEvidence: "Visual Evidence (Image)",
    analyzerRemoveImage: "Remove Image",
    analyzerDragDrop: "Drag and drop image here or click to browse",
    analyzerSupportedFormats: "PNG, JPG, WEBP up to 10MB",
    analyzerRunning: "Running AI Analysis...",
    analyzerBtn: "Analyze Content",
    analyzerResultsTitle: "Verification Analysis",
    analyzerConfidence: "Confidence Score",
    analyzerModalityBreakdown: "Verification Weight Breakdown",
    analyzerLinguistic: "Text Analysis",
    analyzerVisual: "Image Analysis",
    analyzerMetadataWeight: "Context Analysis",
    analyzerForensicExplanations: "AI Explanations & Insights",
    analyzerAwaitingTarget: "Awaiting Claim Input",
    analyzerAwaitingSub: "Enter news text and/or upload an image to begin automated claim verification.",
    analyzerHistoryTitle: "Verification History",
    analyzerHistorySub: "Access your past claim verification scans.",
    analyzerNoDossiers: "No saved verification history found.",

    // Cookie Consent Banner
    cookieTitle: "Cookie Privacy Settings",
    cookieDesc: "We use necessary session cookies to maintain secure authentication and analyze claims accurately.",
    cookieAccept: "Accept All",
    cookieNecessary: "Necessary Only",
    cookieReview: "Review Privacy Terms",

    // Password Reset extra keys
    loginConfirmPassword: "CONFIRM NEW PASSWORD",
    loginResetting: "Resetting Password..."
  },
  fr: {
    navHome: "Accueil",
    navSocialStream: "Flux En Direct",
    navAnalyzer: "Analyseur IA",
    navDossiers: "Historique de Vérification",
    navAbout: "À Propos",
    navAdmin: "Tableau de Bord Admin",
    navSignIn: "Connexion",
    navRegister: "Inscription",
    navProfile: "Mon Profil",
    navLogout: "Déconnexion",

    heroTitlePrefix: "Détecteur Multimodal de",
    heroTitleHighlighted: "Fausse Information",
    heroTitleSuffix: "",
    heroSubtitle: "Détectez instantanément la désinformation multimodale à travers 7 langues grâce à nos réseaux de neurones profonds.",
    verifyNow: "Vérifier une Information",
    compareModels: "Comparer les Modèles IA",

    multilingualTitle: "Support Multilingue",
    multilingualDesc: "Prend en charge plusieurs langues (dont l'arabe, le français et l'anglais) pour la détection globale de la désinformation.",
    multiDomainTitle: "Analyse Multi-Domaines",
    multiDomainDesc: "Classifie les actualités en Politique, Santé, Science, Technologie, Divertissement, Sport et Économie.",
    multiModalTitle: "Traitement Multi-Modal",
    multiModalDesc: "Analyse simultanément les articles textuels et les images pour une vérification croisée approfondie.",

    howItWorks: "Comment Ça Marche",
    step1Title: "Soumettre le Contenu",
    step1Desc: "Collez le texte de l'article et/ou téléchargez une image.",
    step2Title: "Sélectionner les Paramètres",
    step2Desc: "Choisissez votre modèle IA et la langue cible.",
    step3Title: "Analyse IA",
    step3Desc: "Notre moteur multimodal traite le contenu via des réseaux de neurones avancés.",
    step4Title: "Obtenir le Résultat",
    step4Desc: "Recevez des scores de confiance et des verdicts Vrai/Faux clairs.",

    languagesLabel: "Langues",
    countriesLabel: "Pays",

    footerDesc: "Une plateforme d'intelligence artificielle conçue pour détecter instantanément les fausses informations multimodales.",
    footerLocation: "Faculté des Sciences, Université Moulay Ismail, Meknès, Maroc",
    footerThesisProject: "Projet de Thèse de Master.",
    rightsReserved: "Tous droits réservés.",
    quickNav: "Liens Rapides",
    termsPrivacyHeader: "Communauté & Support",
    termsPrivacy: "Conditions & Confidentialité",
    academicNode: "Affiliation Académique",
    homeDashboard: "Accueil",
    services: "Analyseur d'Informations",
    modelsLibrary: "Modèles IA",
    team: "À Propos",
    peerReviews: "Avis Utilisateurs",
    support: "Nous Contacter",
    language: "Langue",

    analyzerTitle: "Détecter les Fausses Informations Instamment",
    analyzerSubtitle: "Collez un article et/ou téléchargez une image — notre IA analyse le texte et le visuel pour vérifier l'authenticité.",
    analyzerNewsText: "Texte de l'Article / Affirmation",
    analyzerTextPlaceholder: "Collez le texte de l'article ou les détails ici...",
    analyzerWords: "mots",
    analyzerExtractClaim: "Extraire les Affirmations Clés",
    analyzerScrape: "Extraire depuis une URL",
    analyzerScrapeSuccess: "Contenu Extrait",
    analyzerVisualEvidence: "Preuve Visuelle (Image)",
    analyzerRemoveImage: "Supprimer l'Image",
    analyzerDragDrop: "Glissez et déposez l'image ici ou cliquez pour parcourir",
    analyzerSupportedFormats: "PNG, JPG, WEBP jusqu'à 10 Mo",
    analyzerRunning: "Analyse IA en cours...",
    analyzerBtn: "Analyser le Contenu",
    analyzerResultsTitle: "Analyse de Vérification",
    analyzerConfidence: "Score de Confiance",
    analyzerVerdictFake: "Fausse Information Détectée",
    analyzerVerdictReal: "Contenu Authentique Vérifié",
    analyzerVerdictFakeSub: "Forte probabilité d'information trompeuse ou manipulée.",
    analyzerVerdictRealSub: "Forte probabilité de contenu vérifié et authentique.",
    analyzerHistoryTitle: "Historique de Vérification",
    analyzerHistorySub: "Accédez à vos analyses et scans passés.",
    analyzerNoDossiers: "Aucun historique d'analyse enregistré.",

    loginWelcome: "Bienvenue",
    loginSubtitle: "Connectez-vous pour analyser et vérifier des informations.",
    loginUsername: "NOM D'UTILISATEUR",
    loginPassword: "MOT DE PASSE",
    loginForgot: "Mot de passe oublié ?",
    loginSubmit: "Se Connecter",
    loginNoAccount: "Vous n'avez pas de compte ?",
    loginRegisterHere: "S'inscrire ici",

    regTitle: "Créer un Compte",
    regSubtitle: "Créez un compte pour vérifier les actualités avec l'IA",
    regUsername: "NOM D'UTILISATEUR",
    regEmail: "ADRESSE EMAIL",
    regFirstName: "PRÉNOM",
    regLastName: "NOM",
    regPassword: "MOT DE PASSE",
    regConfirmPassword: "CONFIRMER LE MOT DE PASSE",
    regSubmit: "S'inscrire"
  },
  ar: {
    navHome: "الرئيسية",
    navSocialStream: "البث المباشر",
    navAnalyzer: "المحلل الذكي",
    navDossiers: "سجل التحققات",
    navAbout: "عن المنصة",
    navAdmin: "لوحة التحكم",
    navSignIn: "تسجيل الدخول",
    navRegister: "إنشاء حساب",
    navProfile: "ملفي الشخصي",
    navLogout: "تسجيل الخروج",

    heroTitlePrefix: "مصنف الأخبار",
    heroTitleHighlighted: "المضللة والزائفة",
    heroTitleSuffix: "متعدد الوسائط",
    heroSubtitle: "تمكين المستخدمين من كشف التضليل الإعلامي فوراً عبر 7 لغات باستخدام أحدث الشبكات العصبية العميقة.",
    verifyNow: "تحقق من خبر الآن",
    compareModels: "مقارنة نماذج الذكاء الاصطناعي",

    multilingualTitle: "دعم متعدد اللغات",
    multilingualDesc: "يدعم لغات متعددة (بما فيها العربية، الفرنسية، والإنجليزية) لكشف التضليل العالمي.",
    multiDomainTitle: "تحليل متعدد المجالات",
    multiDomainDesc: "يصنف الأخبار في مجالات السياسة، الصحة، العلوم، التكنولوجيا، الترفيه، الرياضة، والاقتصاد.",
    multiModalTitle: "معالجة متعددة الوسائط",
    multiModalDesc: "يفحص النصوص والصور المصاحبة في وقت واحد للتحقق التراكمي من صحة الخبر.",

    howItWorks: "كيف تعمل المنصة",
    step1Title: "إدخال المحتوى",
    step1Desc: "قم بلصق نص الخبر أو تحميل الصورة المصاحبة.",
    step2Title: "تحديد الخيارات",
    step2Desc: "اختر نموذج الذكاء الاصطناعي واللغة المستهدفة.",
    step3Title: "التحليل الذكي",
    step3Desc: "يعالج المحرك متعدد الوسائط الخبر عبر شبكات عصبية عميقة متقدمة.",
    step4Title: "استلام النتيجة",
    step4Desc: "احصل على نسبة الثقة وحكم دقيق (حقيقي / زائف).",

    languagesLabel: "اللغات",
    countriesLabel: "الدول",

    footerDesc: "منصة ذكاء اصطناعي متقدمة لكشف الأخبار الزائفة والتضليل الإعلامي عبر تحليل النصوص والصور.",
    footerLocation: "كلية العلوم - جامعة مولاي إسماعيل، مكناس، المغرب",
    footerThesisProject: "مشروع أطروحة الماستر.",
    rightsReserved: "جميع الحقوق محفوظة.",
    quickNav: "روابط سريعة",
    termsPrivacyHeader: "المجتمع والدعم",
    termsPrivacy: "الشروط والخصوصية",
    academicNode: "الانتساب الأكاديمي",
    homeDashboard: "الرئيسية",
    services: "محلل الادعاءات",
    modelsLibrary: "نماذج الذكاء الاصطناعي",
    team: "عن المنصة",
    peerReviews: "تقييمات المستخدمين",
    support: "اتصل بنا",
    language: "اللغة",

    analyzerTitle: "كشف الأخبار الزائفة والمضللة فوراً",
    analyzerSubtitle: "قم بلصق المقال أو تحميل الصورة — يحلل الذكاء الاصطناعي النص والصورة معاً لإظهار الحقيقة.",
    analyzerNewsText: "نص المقال / الادعاء",
    analyzerTextPlaceholder: "ضع نص الخبر أو تفاصيل الادعاء هنا...",
    analyzerWords: "كلمات",
    analyzerExtractClaim: "استخراج الادعاءات الرئيسية",
    analyzerScrape: "جلب من الرابط",
    analyzerScrapeSuccess: "تم جلب المحتوى",
    analyzerVisualEvidence: "الدليل البصري (الصورة)",
    analyzerRemoveImage: "إزالة الصورة",
    analyzerDragDrop: "اسحب الصورة هنا أو اضغط للتصفح",
    analyzerSupportedFormats: "PNG, JPG, WEBP حتى 10 ميجابايت",
    analyzerRunning: "جاري تحليل المحتوى بالذكاء الاصطناعي...",
    analyzerBtn: "تحليل المحتوى",
    analyzerResultsTitle: "نتائج التحقق والتحليل",
    analyzerConfidence: "نسبة الثقة",
    analyzerVerdictFake: "خبر زائف / مضلل",
    analyzerVerdictReal: "خبر حقيقي وموثق",
    analyzerVerdictFakeSub: "احتمالية عالية لوجود معلومات مضللة أو تزييف.",
    analyzerVerdictRealSub: "احتمالية عالية لصحة الخبر وموثوقية المصدر.",
    analyzerHistoryTitle: "سجل التحققات",
    analyzerHistorySub: "استعرض عمليات التحقق السابقة الخاصة بك.",
    analyzerNoDossiers: "لا يوجد سجل تحققات محفوظ.",

    loginWelcome: "مرحباً بعودتك",
    loginSubtitle: "قم بتسجيل الدخول لتحليل الأخبار والتحقق منها.",
    loginUsername: "اسم المستخدم",
    loginPassword: "كلمة المرور",
    loginForgot: "نسيت كلمة المرور؟",
    loginSubmit: "تسجيل الدخول",
    loginNoAccount: "ليس لديك حساب؟",
    loginRegisterHere: "أنشئ حساباً هنا",

    regTitle: "إنشاء حساب جديد",
    regSubtitle: "أنشئ حساباً للبدء في التحقق من الأخبار بالذكاء الاصطناعي",
    regUsername: "اسم المستخدم",
    regEmail: "البريد الإلكتروني",
    regFirstName: "الاسم الأول",
    regLastName: "الاسم العائلي",
    regPassword: "كلمة المرور",
    regConfirmPassword: "تأكيد كلمة المرور",
    regSubmit: "إنشاء الحساب",

    // About Page (Official Names & Accurate Translation)
    aboutAcademicInitiative: "مشروع بحث أكاديمي",
    aboutHeroTitle: "مكافحة التضليل الإعلامي",
    aboutHeroTitleHighlight: "بالذكاء الاصطناعي متعدد الوسائط",
    aboutHeroSubtitle: "التحقق الفوري من صحة الأخبار عبر فحص النص والصورة باستخدام أحدث نماذج الذكاء الاصطناعي.",
    aboutStoryTitle: "من نحن وقصتنا",
    aboutStoryP1: "في عصر التسارع الرقمي ووسائل التواصل الاجتماعي، أصبحت الحدود بين الحقيقة والتضليل أكثر هشاشة من أي وقت مضى. لم يعد الخبر الزائف يعتمد على النصوص فقط، بل أصبح يدمج بين النصوص والصور ومقاطع الفيديو لإضفاء المصداقية. الشبكات الأحادية التقليدية تفشل في كشف التناقضات الدقيقة بين الوسائط المتعددة.",
    aboutStoryP2: "ولدت منصة FakeNewsHunter من هذه الحاجة الملحة. تم تطويرها كأطروحة لنيل شهادة الماستر بكلية العلوم، جامعة مولاي إسماعيل بمكناس، المغرب، من طرف الطالبة صفاء الراجي تحت إشراف الأستاذة الدريسية العلالي. تقوم المنصة على قناعة واحدة: الحقيقة تتطلب رؤية الصورة كاملة من خلال تحليل النص والصورة معاً لإظهار التناقضات الخفية.",
    aboutStoryP3: "تجمع منصة FakeNewsHunter بين معالجة اللغات الطبيعية (NLP) والرؤية الحاسوبية (Computer Vision) والتعلم العميق في محرك واحد لتوفير أداة سهلة ومتاحة للجميع للتحقق من صحة الأخبار.",
    aboutTeamTitle: "فريق العمل والمشرفون",
    aboutSafaeRole: "طالبة ماستر 2 في الذكاء الاصطناعي وعلوم البيانات",
    aboutSafaeBio: "طالبة ماستر بكلية العلوم، جامعة مولاي إسماعيل، مكناس. قامت بتصميم وبناء خط معالجة التعلم العميق متعدد الوسائط، ونماذج استخراج الميزات، والمهندسة الكاملة للمنصة.",
    aboutSupervisorRole: "مشرفة الأطروحة والمستشارة الأكاديمية",
    aboutSupervisorBio: "أستاذة التعليم العالي وباحثة في الذكاء الاصطناعي بكلية العلوم، جامعة مولاي إسماعيل، مكناس. متخصصة في معالجة اللغات الطبيعية والتعلم الآلي. قامت بالإشراف الأكاديمي والتوجيه العلمي الكامل لمشروع الأطروحة.",
    aboutObjectivesTitle: "أهداف البحث العلمي"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    const validCodes = languages.map(l => l.code);
    if (saved && validCodes.includes(saved)) {
      return saved;
    }
    localStorage.setItem('app_language', 'en');
    return 'en';
  });

  const [dynamicTranslations, setDynamicTranslations] = useState(() => {
    const cached = localStorage.getItem('app_gemini_dynamic_translations_v42');
    return cached ? JSON.parse(cached) : {};
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);

  useEffect(() => {
    localStorage.setItem('app_language', language);
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  // Fetch missing translation dictionary keys via Gemini API when language changes
  useEffect(() => {
    if (language === 'en') return;

    const totalKeys = Object.keys(translations.en);
    const existingDict = {
      ...(translations[language] || {}),
      ...(dynamicTranslations[language] || {})
    };
    const missingKeys = totalKeys.filter(k => existingDict[k] === undefined);

    if (missingKeys.length === 0) return;

    const fetchTranslation = async () => {
      setIsTranslating(true);
      setTranslationProgress(0);
      try {
        const chunkSize = 50;
        const chunks = [];
        for (let i = 0; i < missingKeys.length; i += chunkSize) {
          chunks.push(missingKeys.slice(i, i + chunkSize));
        }

        for (let i = 0; i < chunks.length; i++) {
          const chunkKeys = chunks[i];
          const chunkDict = {};
          chunkKeys.forEach(k => {
            chunkDict[k] = translations.en[k];
          });

          try {
            const response = await fetch('/api/translate-dictionary', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dictionary: chunkDict,
                target_lang: language
              })
            });

            if (response.ok) {
              const resData = await response.json();
              if (resData.success && resData.translated) {
                const filtered = {};
                Object.keys(resData.translated).forEach(k => {
                  const val = resData.translated[k];
                  if (val && typeof val === 'string' && val.trim() !== '') {
                    filtered[k] = val;
                  }
                });

                if (Object.keys(filtered).length > 0) {
                  setDynamicTranslations(prev => {
                    const updated = {
                      ...prev,
                      [language]: {
                        ...(prev[language] || {}),
                        ...filtered
                      }
                    };
                    localStorage.setItem('app_gemini_dynamic_translations_v40', JSON.stringify(updated));
                    return updated;
                  });
                }
              }
            }
          } catch (chunkErr) {
            console.error(`Error translating chunk ${i}:`, chunkErr);
          }
        }
      } catch (error) {
        console.error("Translation API error:", error);
      } finally {
        setIsTranslating(false);
        setTranslationProgress(0);
      }
    };

    fetchTranslation();
  }, [language]);

  const t = (key) => {
    // 1. Check dynamic translations first (fetched via Gemini API)
    if (dynamicTranslations[language] && dynamicTranslations[language][key] !== undefined) {
      return dynamicTranslations[language][key];
    }
    // 2. Check built-in translations if available
    if (translations[language] && translations[language][key] !== undefined) {
      return translations[language][key];
    }
    // 3. Fallback to English
    if (translations['en'] && translations['en'][key] !== undefined) {
      return translations['en'][key];
    }
    return key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const handleSetLanguage = (langCode) => {
    const validCodes = languages.map(l => l.code);
    if (validCodes.includes(langCode)) {
      setLanguage(langCode);
    } else {
      setLanguage('en');
    }
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      dir,
      isTranslating,
      translationProgress,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}