// ═══════════════════════════════════
// DATA & STATE
// ═══════════════════════════════════
const T0 = new Date(); T0.setHours(0,0,0,0);
const dFrom = n => { const d=new Date(T0); d.setDate(d.getDate()+n); return d; };
const dLeft = d => Math.ceil((new Date(d)-T0)/864e5);
const fmtDate = d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const dlClass = d => { const n=dLeft(d); return n<=1?'red':n<=3?'amber':'mint'; };
const dlLabel = d => { const n=dLeft(d); if(n===0)return '⚡ Closes today!'; if(n===1)return '⚡ 1 day left'; if(n<=3)return `🟡 ${n} days left`; return `🟢 ${n} days left`; };

let STATE = {
  user: null,
  users: [], // {name,fname,lname,email,password,college,degree,domains}
  detectedSkills: [],
  bookmarks: new Set(),
  applications: [], // {internId, date, status, intern}
  testHistory: [],
  notifications: [],
  navStack: [],
  currentScreen: 'auth',
  selectedDomains: [],
  testIntern: null,
  testQs: [],
  testAnswers: [],
  testQIdx: 0,
  testInterval: null,
  testSecsLeft: 1200,
  testLaunchedFrom: null,
  activeFilters: {paid:false,remote:false,urgent:false},
  activeDomain: '',
  currentSort: 'match',
};

const DOMAINS_DATA = [
  {id:'sde',icon:'💻',name:'Software Development',desc:'Web, mobile, backend, systems'},
  {id:'ai',icon:'🤖',name:'Artificial Intelligence',desc:'ML, deep learning, NLP, CV'},
  {id:'ds',icon:'📊',name:'Data Science',desc:'Analytics, visualization, BI'},
  {id:'ux',icon:'🎨',name:'UI/UX Design',desc:'Figma, prototyping, research'},
  {id:'cyber',icon:'🔐',name:'Cybersecurity',desc:'Pen testing, SIEM, OWASP'},
  {id:'emb',icon:'⚡',name:'Electronics & Embedded',desc:'VHDL, PCB, microcontrollers'},
  {id:'pm',icon:'🗂️',name:'Product Management',desc:'Roadmap, OKRs, A/B testing'},
  {id:'chain',icon:'🔗',name:'Blockchain',desc:'Solidity, Web3, smart contracts'},
];

const INTERNSHIPS = [
  {id:1,company:"Google",title:"Software Engineering Intern",logo:"G",grad:"linear-gradient(135deg,#4285f4,#34a853)",
   domain:"Software Development",mode:"Remote",location:"Work from Home",hours:"40 hrs/week",duration:"3 Months",
   paid:true,stipend:"₹80,000/month",stipendNum:80000,deadline:dFrom(5),
   skills:["Python","Java","Data Structures","Algorithms","System Design"],match:92,
   desc:"Join Google's engineering team working on Search infrastructure. Contribute to large-scale distributed systems used by billions of people daily.",
   requirements:["Strong knowledge of data structures and algorithms","Proficiency in Python or Java","Understanding of system design principles","Experience with version control (Git)","Ability to work in a fast-paced environment"],
   applyUrl:"https://careers.google.com/students/",verified:true,applicants:1240},
  {id:2,company:"Microsoft",title:"Cloud & AI Intern",logo:"M",grad:"linear-gradient(135deg,#00a4ef,#7fba00)",
   domain:"Artificial Intelligence",mode:"Hybrid",location:"Hyderabad, India",hours:"35 hrs/week",duration:"6 Months",
   paid:true,stipend:"₹70,000/month",stipendNum:70000,deadline:dFrom(3),
   skills:["Python","Azure","Machine Learning","Deep Learning","TensorFlow"],match:85,
   desc:"Work on Azure AI services contributing to next-gen intelligent cloud solutions. Opportunity to work directly with ML researchers on production deployments.",
   requirements:["Python programming proficiency","Understanding of ML fundamentals","Knowledge of Azure or any cloud platform","Experience with TensorFlow or PyTorch","Strong mathematical background"],
   applyUrl:"https://careers.microsoft.com/students/",verified:true,applicants:890},
  {id:3,company:"Amazon",title:"SDE Intern",logo:"A",grad:"linear-gradient(135deg,#ff9900,#232f3e)",
   domain:"Software Development",mode:"Onsite",location:"Bangalore, India",hours:"40 hrs/week",duration:"3 Months",
   paid:true,stipend:"₹90,000/month",stipendNum:90000,deadline:dFrom(1),
   skills:["Java","Spring Boot","AWS","Distributed Systems","SQL"],match:78,
   desc:"Build scalable services powering Amazon's e-commerce platform. Work with world-class engineers on systems with five-nines availability.",
   requirements:["Strong Java skills","Experience with Spring Boot or similar","Understanding of AWS services","Database design knowledge","Problem-solving mindset"],
   applyUrl:"https://www.amazon.jobs/students",verified:true,applicants:2100},
  {id:4,company:"Zepto",title:"Data Science Intern",logo:"Z",grad:"linear-gradient(135deg,#6c3fc5,#9b59b6)",
   domain:"Data Science",mode:"Hybrid",location:"Mumbai, India",hours:"30 hrs/week",duration:"4 Months",
   paid:true,stipend:"₹35,000/month",stipendNum:35000,deadline:dFrom(12),
   skills:["Python","Pandas","SQL","Statistics","ML","Tableau"],match:88,
   desc:"Analyze large-scale delivery and supply chain data to optimize operations and personalize the shopping experience for millions of users.",
   requirements:["Python with Pandas and NumPy","SQL proficiency","Statistical analysis knowledge","Data visualization skills","ML fundamentals"],
   applyUrl:"https://www.zepto.com/careers",verified:true,applicants:430},
  {id:5,company:"ISRO",title:"Research Intern — Electronics",logo:"I",grad:"linear-gradient(135deg,#ff6b35,#f7931e)",
   domain:"Electronics & Embedded",mode:"Onsite",location:"Bengaluru, India",hours:"40 hrs/week",duration:"2 Months",
   paid:false,stipend:"Unpaid",stipendNum:0,deadline:dFrom(20),
   skills:["Embedded C","VHDL","Signal Processing","PCB Design","MATLAB"],match:55,
   desc:"Contribute to satellite communication systems at India's premier space research organization. Prestigious certificate recognized across the industry.",
   requirements:["Embedded C/C++","VHDL or Verilog knowledge","Signal processing fundamentals","PCB design experience","MATLAB proficiency"],
   applyUrl:"https://www.isro.gov.in/ISRO_Internship.html",verified:true,applicants:3200},
  {id:6,company:"Razorpay",title:"Backend Engineering Intern",logo:"R",grad:"linear-gradient(135deg,#3395ff,#072654)",
   domain:"Software Development",mode:"Remote",location:"Work from Home",hours:"35 hrs/week",duration:"6 Months",
   paid:true,stipend:"₹50,000/month",stipendNum:50000,deadline:dFrom(8),
   skills:["Node.js","Python","MySQL","Redis","Kafka","REST APIs"],match:72,
   desc:"Build payment infrastructure used by 8M+ businesses. High-throughput financial systems processing billions of rupees daily.",
   requirements:["Node.js or Python backend","MySQL/PostgreSQL","Redis caching","REST API design","Understanding of financial systems"],
   applyUrl:"https://razorpay.com/jobs/",verified:true,applicants:560},
  {id:7,company:"NASSCOM",title:"UI/UX Design Intern",logo:"N",grad:"linear-gradient(135deg,#e91e8c,#ff6b6b)",
   domain:"UI/UX Design",mode:"Remote",location:"Work from Home",hours:"20 hrs/week",duration:"3 Months",
   paid:true,stipend:"₹20,000/month",stipendNum:20000,deadline:dFrom(15),
   skills:["Figma","Prototyping","User Research","Adobe XD","CSS"],match:40,
   desc:"Design intuitive digital products for India's tech ecosystem. Create user journeys and interactive prototypes for ed-tech platforms.",
   requirements:["Figma proficiency","UX research methods","Prototyping skills","Basic HTML/CSS","Portfolio of design work"],
   applyUrl:"https://nasscom.in/",verified:true,applicants:220},
  {id:8,company:"Groww",title:"Full Stack Intern",logo:"G",grad:"linear-gradient(135deg,#00d09c,#0083cf)",
   domain:"Software Development",mode:"Hybrid",location:"Bengaluru, India",hours:"40 hrs/week",duration:"6 Months",
   paid:true,stipend:"₹55,000/month",stipendNum:55000,deadline:dFrom(4),
   skills:["React","Node.js","MongoDB","TypeScript","REST APIs"],match:65,
   desc:"Build features for India's leading investment platform — React dashboard and Node.js microservices for 10M+ investors.",
   requirements:["React.js frontend","Node.js backend","MongoDB","TypeScript","REST API design"],
   applyUrl:"https://groww.in/about/careers",verified:true,applicants:780},
  {id:9,company:"ClearTax",title:"Cybersecurity Intern",logo:"C",grad:"linear-gradient(135deg,#f7971e,#ffd200)",
   domain:"Cybersecurity",mode:"Onsite",location:"Bengaluru, India",hours:"40 hrs/week",duration:"3 Months",
   paid:true,stipend:"₹25,000/month",stipendNum:25000,deadline:dFrom(18),
   skills:["Network Security","Python","Penetration Testing","OWASP","Linux"],match:45,
   desc:"Secure financial data for 6M+ taxpayers. Conduct vulnerability assessments and implement security hardening.",
   requirements:["Network security fundamentals","Python scripting","Penetration testing basics","OWASP top 10","Linux command line"],
   applyUrl:"https://cleartax.in/careers",verified:true,applicants:310},
  {id:10,company:"DRDO",title:"Research Fellow — ML",logo:"D",grad:"linear-gradient(135deg,#2c3e50,#4ca1af)",
   domain:"Artificial Intelligence",mode:"Onsite",location:"Delhi, India",hours:"40 hrs/week",duration:"6 Months",
   paid:true,stipend:"₹15,000/month",stipendNum:15000,deadline:dFrom(25),
   skills:["Python","Machine Learning","Computer Vision","OpenCV","TensorFlow"],match:70,
   desc:"Apply AI/ML to defense research. Impactful work on national security applications with DRDO's top scientists.",
   requirements:["Python ML proficiency","Computer vision fundamentals","OpenCV","TensorFlow or PyTorch","Research mindset"],
   applyUrl:"https://www.drdo.gov.in/",verified:true,applicants:1100},
  {id:11,company:"Meesho",title:"Product Management Intern",logo:"M",grad:"linear-gradient(135deg,#9b59b6,#e91e8c)",
   domain:"Product Management",mode:"Remote",location:"Work from Home",hours:"30 hrs/week",duration:"3 Months",
   paid:true,stipend:"₹40,000/month",stipendNum:40000,deadline:dFrom(10),
   skills:["Product Strategy","SQL","A/B Testing","User Research","Jira","Analytics"],match:60,
   desc:"Drive product roadmap for Meesho's reseller platform. Ship features for 120M users alongside engineering and design teams.",
   requirements:["Analytical mindset","SQL basics","A/B testing knowledge","User research skills","Jira/project management"],
   applyUrl:"https://meesho.io/careers",verified:true,applicants:450},
  {id:12,company:"TCS Research",title:"Blockchain Intern",logo:"T",grad:"linear-gradient(135deg,#0f4c75,#1b262c)",
   domain:"Blockchain",mode:"Hybrid",location:"Pune, India",hours:"40 hrs/week",duration:"6 Months",
   paid:true,stipend:"₹30,000/month",stipendNum:30000,deadline:dFrom(22),
   skills:["Solidity","Ethereum","Web3.js","Smart Contracts","Node.js"],match:35,
   desc:"Develop enterprise blockchain solutions for TCS's global clients — supply chain transparency and digital identity projects.",
   requirements:["Solidity smart contracts","Ethereum/Web3 basics","JavaScript/Node.js","Understanding of DeFi","Truffle or Hardhat"],
   applyUrl:"https://www.tcs.com/careers",verified:true,applicants:190},
];

// ═══════════════════════════════════
// QUESTION BANK
// ═══════════════════════════════════
const QDB = {
"Software Development":[
  {q:"Which HTTP status code means a resource was successfully created?",opts:["200 OK","201 Created","204 No Content","302 Found"],a:1},
  {q:"In REST, which method is idempotent but NOT safe?",opts:["GET","DELETE","POST","HEAD"],a:1},
  {q:"What is the time complexity of binary search?",opts:["O(n)","O(log n)","O(n²)","O(1)"],a:1},
  {q:"What does Docker primarily containerize?",opts:["Networks","Applications and dependencies","Databases only","Frontend files"],a:1},
  {q:"Which Git command creates and switches to a new branch?",opts:["git merge","git checkout -b","git pull","git stash"],a:1},
  {q:"What is the purpose of a database index?",opts:["Secure data","Speed up query performance","Compress data","Normalize tables"],a:1},
  {q:"What does JWT stand for?",opts:["JavaScript Web Tool","JSON Web Token","Java Web Type","JSON Worker Thread"],a:1},
  {q:"Which data structure uses LIFO order?",opts:["Queue","Stack","Linked List","Heap"],a:1},
  {q:"What does SOLID stand for in software design?",opts:["5 OOP coding principles","A database pattern","A testing framework","A deployment strategy"],a:0},
  {q:"Which SQL clause filters grouped results?",opts:["WHERE","HAVING","ORDER BY","GROUP BY"],a:1},
],
"Artificial Intelligence":[
  {q:"Which Python library is Google's primary deep learning framework?",opts:["Pandas","Scikit-learn","TensorFlow","Matplotlib"],a:2},
  {q:"What does 'overfitting' mean in machine learning?",opts:["Slow training","Model memorises training data and generalises poorly","Too few features","High validation accuracy"],a:1},
  {q:"What does 'transfer learning' refer to?",opts:["Moving data between servers","Using pre-trained model weights as a starting point","Transferring code","Cloud migration"],a:1},
  {q:"What is the purpose of dropout in neural networks?",opts:["Speed training","Prevent overfitting by randomly deactivating neurons","Normalize inputs","Reduce layers"],a:1},
  {q:"Which algorithm is commonly used for dimensionality reduction?",opts:["K-Means","Random Forest","PCA","LSTM"],a:2},
  {q:"What is a hyperparameter?",opts:["A training example","A parameter set before training begins","An activation function","A layer type"],a:1},
  {q:"What optimiser is most used for training deep neural networks?",opts:["Gradient Boost","Adam","Decision Tree","K-Means"],a:1},
  {q:"What does NLP stand for?",opts:["Numeric Logic Processing","Natural Language Processing","Neural Layer Processing","Nonlinear Programming"],a:1},
  {q:"What is a confusion matrix used for?",opts:["Training speed","Classification evaluation (TP/FP/TN/FN)","Feature scaling","Data imputation"],a:1},
  {q:"What does 'regularization' prevent in ML?",opts:["Underfitting","Overfitting","Data leakage","Class imbalance"],a:1},
],
"Data Science":[
  {q:"Which Pandas method drops rows with missing values?",opts:[".fillna()","dropna()","isnull()","astype()"],a:1},
  {q:"What does a p-value < 0.05 indicate?",opts:["Null hypothesis supported","Statistically significant result","Data error","Insufficient sample"],a:1},
  {q:"Which chart best shows distribution of a continuous variable?",opts:["Bar chart","Pie chart","Histogram","Scatter plot"],a:2},
  {q:"What does ETL stand for?",opts:["Extract, Train, Load","Extract, Transform, Load","Evaluate, Test, Launch","Export, Track, Log"],a:1},
  {q:"What is feature engineering?",opts:["Building software features","Creating/transforming variables to improve model performance","Designing UI features","Infrastructure config"],a:1},
  {q:"What metric measures correlation between two variables?",opts:["Standard deviation","Pearson correlation","Mean absolute error","F1 score"],a:1},
  {q:"What is cross-validation used for?",opts:["Speed up training","Estimate model generalisation performance","Reduce dataset","Normalise features"],a:1},
  {q:"What is a data warehouse?",opts:["Physical storage","Central repository for structured historical data","Real-time streaming pipeline","API gateway"],a:1},
  {q:"What does SQL COUNT() count?",opts:["Rows including nulls","Non-NULL values","Distinct values only","Sum of values"],a:1},
  {q:"What library does Python use for machine learning?",opts:["Flask","Scikit-learn","Django","FastAPI"],a:1},
],
"UI/UX Design":[
  {q:"What is a wireframe in UX design?",opts:["Final product design","Low-fidelity structural layout","Brand guideline","User persona"],a:1},
  {q:"Which Figma feature creates reusable design elements?",opts:["Frames","Components","Pages","Grids"],a:1},
  {q:"What does WCAG stand for?",opts:["Web Content Accessibility Guidelines","Web CSS Animation Guide","Workflow Content Audit","Web Component API"],a:0},
  {q:"What does 'affordance' mean in UX?",opts:["Colour theory","Perceived property suggesting how an element is used","Typography rules","Animation timing"],a:1},
  {q:"What is the purpose of A/B testing?",opts:["Test servers","Compare two design variants with real users","Audit design files","Review code quality"],a:1},
  {q:"What does a heatmap show in UX research?",opts:["Color schemes","Where users click and scroll on a page","User journeys","Page load speed"],a:1},
  {q:"What is 'information architecture'?",opts:["Server infrastructure","Organization and structure of content","Database schema","Code architecture"],a:1},
  {q:"What is a user persona?",opts:["A legal agreement","A fictional character representing a user segment","A test account","A design component"],a:1},
  {q:"Which UX principle advocates for consistent UI across screens?",opts:["Affordance","Consistency","Fitts's Law","Hick's Law"],a:1},
  {q:"What is usability testing?",opts:["Server load testing","Observing real users interact with a product","Auditing design files","Reviewing code quality"],a:1},
],
"Cybersecurity":[
  {q:"Which attack injects malicious SQL via input fields?",opts:["XSS","CSRF","SQL Injection","Buffer Overflow"],a:2},
  {q:"What does XSS stand for?",opts:["Extreme Shell Script","Cross-Site Scripting","Extended Security System","XML Style Sheet"],a:1},
  {q:"What is a SIEM system for?",opts:["Source code management","Security event aggregation and monitoring","Database backups","Network routing"],a:1},
  {q:"What does 'least privilege' principle mean?",opts:["Give maximum access","Grant only the minimum access needed","Restrict admin accounts","Share credentials securely"],a:1},
  {q:"What is a zero-day vulnerability?",opts:["A fixed bug","Unknown flaw exploited before a patch exists","A daily security scan","A scheduled window"],a:1},
  {q:"What does TLS provide?",opts:["Traffic routing","Encrypted communication over a network","File compression","DNS resolution"],a:1},
  {q:"What is phishing?",opts:["A coding bug","Social engineering attack to steal credentials","A network topology","A type of malware"],a:1},
  {q:"Which Linux command shows open network connections?",opts:["ls -la","grep -r","netstat -an","chmod 755"],a:2},
  {q:"What does a WAF do?",opts:["Speed up HTTP","Filter malicious requests before reaching the server","Encrypt databases","Manage SSL certs"],a:1},
  {q:"What is penetration testing?",opts:["Load testing","Authorised attack simulation to find vulnerabilities","Performance benchmarking","Code review"],a:1},
],
"Electronics & Embedded":[
  {q:"What does VHDL stand for?",opts:["Very High-Speed Integrated Circuit Hardware Description Language","Variable Hardware Design","Virtual Hardware Driver","Verified Hardware Debug"],a:0},
  {q:"Which register stores the current instruction address?",opts:["Stack Pointer","Accumulator","Program Counter","Data Register"],a:2},
  {q:"What is a PWM signal used for?",opts:["Encode data","Control average power to a load","Amplify voltage","Measure resistance"],a:1},
  {q:"What does RTOS stand for?",opts:["Remote Terminal OS","Real-Time Operating System","Reduced Throughput OS","Registered Transmission System"],a:1},
  {q:"What does an ADC do?",opts:["Amplify digital signals","Convert analogue signals to digital","Store data","Route packets"],a:1},
  {q:"What is I2C?",opts:["Internet to Cloud","A short-range serial communication protocol","An operating system","A type of memory"],a:1},
  {q:"What does GPIO stand for?",opts:["General Power Input Output","General Purpose Input/Output","Global Protocol Interface Option","Grounded Power I/O"],a:1},
  {q:"What is a watchdog timer?",opts:["Measure elapsed time","Reset system if software hangs","Regulate voltage","Control PWM"],a:1},
  {q:"In MATLAB, which function reads an image file?",opts:["imwrite","imread","imshow","imresize"],a:1},
  {q:"What is PCB copper pour used for?",opts:["Signal routing","Grounding and heat dissipation","Insulation","Component labelling"],a:1},
],
"Product Management":[
  {q:"What is a North Star Metric?",opts:["Company profit","Single metric capturing core value delivered to users","Employee count","Market cap"],a:1},
  {q:"What does MoSCoW stand for?",opts:["Must/Should/Could/Won't","Main/Optional/Secondary/Cancelled/Won't","Mandatory/Suggested/Chosen/Won","Scope Control Method"],a:0},
  {q:"What is product-market fit?",opts:["A sales target","When a product satisfies strong market demand","A pricing model","A design framework"],a:1},
  {q:"What does DAU/MAU ratio measure?",opts:["Revenue growth","User engagement/stickiness","Churn rate","Conversion rate"],a:1},
  {q:"What is a sprint in Agile?",opts:["A performance benchmark","A fixed time period for delivering features","A code review session","A design sprint"],a:1},
  {q:"What does OKR stand for?",opts:["Output/Knowledge/Result","Objectives and Key Results","Operational Key Review","Output and Kernel Reasoning"],a:1},
  {q:"What is a product roadmap?",opts:["A sitemap","Strategic plan showing product vision and timeline","A deployment plan","A user journey map"],a:1},
  {q:"What is a user story format?",opts:["As a [role], I want [goal] so that [reason]","Given [context] When [action] Then [outcome]","Feature: [name] Scenario: [steps]","Task: [ID] Priority: [level]"],a:0},
  {q:"What does HEART framework measure?",opts:["Happiness/Engagement/Adoption/Retention/Task Success","HTML/Events/Analytics/Reporting/Testing","Heuristics/Errors/Actions/Reach/Time","None"],a:0},
  {q:"What is a minimum viable product (MVP)?",opts:["The cheapest product version","Product with just enough features to validate market assumptions","A beta version","A prototype"],a:1},
],
"Blockchain":[
  {q:"What is a smart contract?",opts:["A legal document","Self-executing code stored on a blockchain","A crypto wallet","An API endpoint"],a:1},
  {q:"What consensus does Ethereum 2.0 use?",opts:["Proof of Work","Proof of Stake","Delegated PoS","Proof of Authority"],a:1},
  {q:"What is gas in Ethereum?",opts:["A token","Fee paid to compensate for computing energy","A storage unit","A hashing algorithm"],a:1},
  {q:"What does Web3.js allow?",opts:["Style web pages","Interact with Ethereum nodes from JavaScript","Manage SQL databases","Create REST APIs"],a:1},
  {q:"What is an NFT?",opts:["Non-Fungible Token — unique digital asset on blockchain","Network File Transfer","Neural Fuzzy Technology","New Financial Token"],a:0},
  {q:"What is a blockchain?",opts:["A traditional database","A distributed, immutable ledger of transactions","A cloud storage system","A type of server"],a:1},
  {q:"What does DeFi stand for?",opts:["Defined Finance","Decentralised Finance","Digital Financial Infrastructure","Distributed Fintech"],a:1},
  {q:"What is a DAO?",opts:["Database Access Object","Decentralised Autonomous Organisation","Digital Asset Operation","Distributed Application Overlay"],a:1},
  {q:"What is hashing in blockchain for?",opts:["Encrypt data for storage","Produce a fixed-size fingerprint to verify data integrity","Compress files","Route traffic"],a:1},
  {q:"What is Solidity used for?",opts:["Building web frontends","Writing smart contracts on Ethereum","Data analysis","Server scripting"],a:1},
],
};

const SKILL_POOLS = {
  "Software Development":["Python","Java","JavaScript","TypeScript","React","Node.js","Spring Boot","SQL","MongoDB","AWS","Docker","Git","REST APIs","Data Structures","Algorithms","Linux","Redis","GraphQL"],
  "Artificial Intelligence":["Python","TensorFlow","PyTorch","Machine Learning","Deep Learning","NLP","OpenCV","Pandas","NumPy","Scikit-learn","Azure ML","Computer Vision","Keras","Hugging Face"],
  "Data Science":["Python","R","SQL","Tableau","Power BI","Pandas","Statistics","Excel","NumPy","Matplotlib","Seaborn","Machine Learning","Spark","Hadoop"],
  "UI/UX Design":["Figma","Adobe XD","Prototyping","User Research","Wireframing","CSS","HTML","InVision","Sketch","Accessibility","Design Systems"],
  "Cybersecurity":["Network Security","Python","Linux","Penetration Testing","OWASP","Wireshark","Kali Linux","SIEM","Firewalls","Metasploit","Burp Suite"],
  "Electronics & Embedded":["C","Embedded C","VHDL","MATLAB","Arduino","PCB Design","Signal Processing","RTOS","Raspberry Pi","STM32","Verilog"],
  "Product Management":["SQL","Jira","A/B Testing","Analytics","User Research","Figma","Excel","Product Strategy","Agile","Confluence","Mixpanel"],
  "Blockchain":["Solidity","Web3.js","Ethereum","Smart Contracts","JavaScript","Node.js","Truffle","Hardhat","MetaMask","IPFS"],
};
const GENERIC = ["Communication","Problem Solving","Teamwork","Git","Agile","JIRA","Data Analysis","Microsoft Office","Presentation","Critical Thinking"];


// ═══════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════
const SCREENS = ['auth','domain','resume','dash','detail','test','result'];

function showScreen(id){
  SCREENS.forEach(s => {
    const el = document.getElementById('s-'+s);
    if(el){ el.classList.remove('active'); el.style.display=''; }
  });
  const target = document.getElementById('s-'+id);
  if(target){ target.classList.add('active'); }
  STATE.currentScreen = id;
  window.scrollTo(0,0);
  document.getElementById('notifPanel').classList.remove('open');
}

function goto(dest, push=true){
  if(push && dest !== STATE.currentScreen) STATE.navStack.push(STATE.currentScreen);
  if(dest === 'discover'){ showScreen('dash'); showPanel('discover'); setSidebarActive('discover'); }
  else if(dest === 'bookmarks'){ showScreen('dash'); showPanel('bookmarks'); setSidebarActive('bookmarks'); renderBookmarks(); }
  else if(dest === 'applications'){ showScreen('dash'); showPanel('applications'); setSidebarActive('applications'); renderApplications(); }
  else if(dest === 'tests'){ showScreen('dash'); showPanel('tests'); setSidebarActive('tests'); renderTestHistory(); }
  else if(dest === 'dash'){ showScreen('dash'); showPanel('dash'); setSidebarActive(''); renderDashPanel(); }
  else if(dest === 'resume'){ showScreen('resume'); setTimeout(()=>{ const el=document.getElementById('ru-results'); if(el && el.style.display!=='none') el.scrollIntoView({behavior:'smooth',block:'start'}); },300); }
  else showScreen(dest);
  syncNotifDots();
}

function goBack(){
  if(STATE.navStack.length === 0){ goto('dash',false); return; }
  const prev = STATE.navStack.pop();
  goto(prev, false);
}

function showPanel(id){
  document.querySelectorAll('#dashMain .panel').forEach(p => p.style.display='none');
  const p = document.getElementById('panel-'+id);
  if(p) p.style.display='';
}

function setSidebarActive(id){
  document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
  if(id){ const el=document.getElementById('sb-'+id); if(el)el.classList.add('active'); }
}

// ═══════════════════════════════════
// AUTH
// ═══════════════════════════════════
function authTab(t){
  document.getElementById('tab-li').classList.toggle('active', t==='login');
  document.getElementById('tab-reg').classList.toggle('active', t==='register');
  document.getElementById('form-login').style.display = t==='login'?'':'none';
  document.getElementById('form-reg').style.display = t==='register'?'':'none';
}
function togglePw(id, btn){
  const el = document.getElementById(id);
  el.type = el.type==='password' ? 'text' : 'password';
  btn.textContent = el.type==='password' ? '👁' : '🙈';
}
async function doLogin() {
  const email = document.getElementById('li-email').value.trim();
  const password = document.getElementById('li-pw').value;

  try {
    // 1. Sign in with Firebase Client SDK
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const idToken = await userCredential.user.getIdToken();

    // 2. Fetch User Profile from your new Server
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Empty body triggers a data fetch
    });

    const userData = await response.json();
    
    // 3. Update local STATE with Server Data
    STATE.user = userData;
    STATE.selectedDomains = userData.domains || [];
    STATE.bookmarks = new Set(userData.bookmarks || []);
    
    goto('dash');
    toast('Welcome back!', 'mint');
  } catch (error) {
    toast(error.message, 'rose');
  }
}

function doRegister(){
  const fn=document.getElementById('r-fn').value.trim();
  const ln=document.getElementById('r-ln').value.trim();
  const em=document.getElementById('r-em').value.trim();
  const col=document.getElementById('r-col').value.trim();
  const deg=document.getElementById('r-deg').value.trim();
  const pw=document.getElementById('r-pw').value;
  if(!fn||!ln){ toast('Enter your full name','rose'); return; }
  if(!em.includes('@')){ toast('Enter a valid email','rose'); return; }
  if(!col){ toast('Enter your college/university','rose'); return; }
  if(pw.length<6){ toast('Password must be at least 6 characters','rose'); return; }
  if(STATE.users.find(u=>u.email.toLowerCase()===em.toLowerCase())){
    toast('Account with this email already exists — please sign in','amber');
    setTimeout(()=>authTab('login'),800);
    return;
  }
  const user={name:fn+' '+ln,fname:fn,lname:ln,email:em,college:col,degree:deg,password:pw,domains:[],joinDate:new Date().toLocaleDateString('en-IN',{month:'short',year:'numeric'})};
  STATE.users.push(user);
  toast('Account created! Welcome, '+fn+' 🎉','mint');
  setTimeout(()=>{ loginUser(user, true); }, 700);
}
function loginUser(user, isNew=false){
  STATE.user = user;
  STATE.selectedDomains = user.domains || [];
  updateUserUI();
  setupNotifications();
  if(isNew || !user.domains || user.domains.length===0){
    buildDomainGrid();
    showScreen('domain');
  } else {
    toast('Welcome back, '+user.fname+'! 👋','mint');
    goto('discover',false);
    initDiscover();
  }
}
function updateUserUI(){
  const u = STATE.user;
  if(!u) return;
  const initials = (u.fname[0]+(u.lname?u.lname[0]:'')).toUpperCase();
  ['dashAvi','detailAvi','resultAvi','bigAvi'].forEach(id=>{ const el=document.getElementById(id); if(el)el.textContent=initials; });
  const chip = document.getElementById('dashChipName'); if(chip) chip.textContent = u.fname;
  const dc = document.getElementById('detailChip'); if(dc) dc.textContent = u.fname;
}
function doLogout(){
  STATE.user = null;
  STATE.detectedSkills = [];
  STATE.navStack = [];
  authTab('login');
  document.getElementById('li-email').value='';
  document.getElementById('li-pw').value='';
  showScreen('auth');
}

// ═══════════════════════════════════
// DOMAINS
// ═══════════════════════════════════
function buildDomainGrid(){
  STATE.selectedDomains = (STATE.user?.domains || []).slice();
  const g = document.getElementById('domain-grid');
  g.innerHTML = DOMAINS_DATA.map(d=>`
    <div class="dom-card ${STATE.selectedDomains.includes(d.id)?'selected':''}" id="dc-${d.id}" onclick="toggleDomain('${d.id}')">
      <div class="dc-check">✓</div>
      <div style="font-size:2rem;margin-bottom:.6rem">${d.icon}</div>
      <div style="font-family:var(--ff-head);font-size:.92rem;font-weight:700;margin-bottom:.25rem">${d.name}</div>
      <div style="font-size:.75rem;color:var(--fog)">${d.desc}</div>
    </div>`).join('');
}
function toggleDomain(id){
  const el = document.getElementById('dc-'+id);
  el.classList.toggle('selected');
  if(el.classList.contains('selected')) STATE.selectedDomains.push(id);
  else STATE.selectedDomains = STATE.selectedDomains.filter(x=>x!==id);
}
function saveDomains(){
  if(!STATE.selectedDomains.length){ toast('Select at least one domain','amber'); return; }
  if(STATE.user) STATE.user.domains = STATE.selectedDomains;
  toast('Preferences saved! Now upload your resume 📄','mint');
  showScreen('resume');
}

// ═══════════════════════════════════
// RESUME SCAN
// ═══════════════════════════════════
function dragOver(e){ e.preventDefault(); document.getElementById('uploadArea').style.borderColor='rgba(79,142,247,.7)'; }
function dragLeave(){ document.getElementById('uploadArea').style.borderColor=''; }
function dropFile(e){ e.preventDefault(); dragLeave(); const f=e.dataTransfer.files[0]; if(f) scanResume(f); }
function scanResume(file){
  if(!file) return;
  const ud=document.getElementById('uploadDefault'), us=document.getElementById('uploadScanning'), done=document.getElementById('uploadDone');
  ud.style.display='none'; us.style.display=''; done.style.display='none';
  const steps=['Extracting text from PDF...','Identifying technical skills...','Mapping to your domains...','Computing match scores...','Complete!'];
  let step=0;
  const bar=document.getElementById('scanBar'), status=document.getElementById('scanStatus');
  const iv=setInterval(()=>{
    bar.style.width = Math.min(100, (step+1)*22)+'%';
    status.textContent = steps[step]||'Processing...';
    step++;
    if(step>=steps.length){ clearInterval(iv); finishScan(file.name); }
  }, 480);
}
function finishScan(filename){
  // Determine skills based on user domains
  const userDomainNames = (STATE.user?.domains||[]).map(id=>DOMAINS_DATA.find(d=>d.id===id)?.name).filter(Boolean);
  let pool = [...GENERIC];
  userDomainNames.forEach(dn=>{ if(SKILL_POOLS[dn]) pool=[...pool,...SKILL_POOLS[dn]]; });
  if(!pool.length) pool=[...GENERIC,...SKILL_POOLS["Software Development"]];
  STATE.detectedSkills = [...new Set(pool)].sort(()=>Math.random()-.5).slice(0,14);
  // Recalculate match
  INTERNSHIPS.forEach(i=>{
    const matched = i.skills.filter(s=>STATE.detectedSkills.some(d=>d.toLowerCase()===s.toLowerCase()||s.toLowerCase().includes(d.split(' ')[0].toLowerCase())));
    i.match = Math.min(99, Math.round((matched.length/i.skills.length)*100)+Math.round(Math.random()*8));
  });
  const ud=document.getElementById('uploadDefault'), us=document.getElementById('uploadScanning'), done=document.getElementById('uploadDone');
  us.style.display='none'; done.style.display='';
  document.getElementById('skillCount').textContent = STATE.detectedSkills.length+' skills detected · '+INTERNSHIPS.filter(i=>i.match>=50).length+' internships matched';
  // Show skill tags
  const sb=document.getElementById('skillBox'), st=document.getElementById('skillTags');
  sb.style.display=''; st.innerHTML=STATE.detectedSkills.map(s=>`<span class="tag tag-sky">${s}</span>`).join('');
  // Update stat
  document.getElementById('qs-matched').textContent = INTERNSHIPS.filter(i=>i.match>=50).length;
  toast('Resume scanned! '+STATE.detectedSkills.length+' skills detected 🎉','mint');
  filterCards();
}

// ═══════════════════════════════════
// DISCOVER / CARDS
// ═══════════════════════════════════
function initDiscover(){
  document.getElementById('qs-total').textContent = INTERNSHIPS.length;
  document.getElementById('qs-matched').textContent = STATE.detectedSkills.length ? INTERNSHIPS.filter(i=>i.match>=50).length : '—';
  document.getElementById('qs-applied').textContent = STATE.applications.length;
  document.getElementById('qs-saved').textContent = STATE.bookmarks.size;
  document.getElementById('sc-discover').textContent = INTERNSHIPS.length;
  // domain chips
  const domains = [...new Set(INTERNSHIPS.map(i=>i.domain))].sort();
  document.getElementById('domainChips').innerHTML =
    `<span class="tag tag-sky" style="cursor:pointer;${STATE.activeDomain===''?'outline:1px solid var(--sky);':''}" onclick="setDomainFilter('')">All</span>`+
    domains.map(d=>`<span class="tag tag-fog" style="cursor:pointer;${STATE.activeDomain===d?'outline:1px solid var(--sky);':''}" onclick="setDomainFilter('${d}')">${d}</span>`).join('');
  filterCards();
  renderDeadlines();
}
function setDomainFilter(d){
  STATE.activeDomain = d;
  const domains=[...new Set(INTERNSHIPS.map(i=>i.domain))].sort();
  document.getElementById('domainChips').innerHTML =
    `<span class="tag ${d===''?'tag-sky':'tag-fog'}" style="cursor:pointer" onclick="setDomainFilter('')">All</span>`+
    domains.map(dn=>`<span class="tag ${dn===d?'tag-sky':'tag-fog'}" style="cursor:pointer" onclick="setDomainFilter('${dn}')">${dn}</span>`).join('');
  filterCards();
}
function toggleFilter(f){
  STATE.activeFilters[f] = !STATE.activeFilters[f];
  document.getElementById('fs-'+f).classList.toggle('active-filter', STATE.activeFilters[f]);
  filterCards();
}
function filterCards(){
  const q = (document.getElementById('searchQ')||{value:''}).value.toLowerCase();
  let list = [...INTERNSHIPS];
  if(STATE.activeDomain) list = list.filter(i=>i.domain===STATE.activeDomain);
  if(q) list = list.filter(i=>(i.title+i.company+i.skills.join(' ')+i.domain).toLowerCase().includes(q));
  if(STATE.activeFilters.paid) list = list.filter(i=>i.paid);
  if(STATE.activeFilters.remote) list = list.filter(i=>i.mode==='Remote');
  if(STATE.activeFilters.urgent) list = list.filter(i=>dLeft(i.deadline)<=5);
  list.sort((a,b)=>b.match-a.match);
  document.getElementById('resultLabel').textContent = list.length+' listing'+(list.length!==1?'s':'');
  renderCards(list);
}
function renderCards(list){
  const grid = document.getElementById('cardGrid');
  if(!list.length){ grid.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="ei">🔍</div><p>No internships match your filters.<br>Try adjusting search criteria.</p></div>`; return; }
  grid.innerHTML = list.map(i=>internCard(i)).join('');
}
function internCard(i){
  const n=dLeft(i.deadline), dc=dlClass(i.deadline), dl=dlLabel(i.deadline);
  const mc = i.match>=75?'badge-high':i.match>=50?'badge-med':'badge-low';
  const bm = STATE.bookmarks.has(i.id);
  const app = STATE.applications.find(a=>a.internId===i.id);
  return `<div class="i-card ${bm?'bookmarked':''}" onclick="openDetail(${i.id})">
    <span class="badge ${mc}" style="position:absolute;top:.9rem;right:.9rem">${i.match}%</span>
    <div style="display:flex;align-items:center;gap:.75rem">
      <div style="width:42px;height:42px;border-radius:10px;background:${i.grad};display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#fff;font-family:var(--ff-head);flex-shrink:0">${i.logo}</div>
      <div>
        <div style="font-size:.77rem;color:var(--mist);font-weight:600">${i.company}</div>
        <div style="font-family:var(--ff-head);font-size:.95rem;font-weight:700;padding-right:52px;line-height:1.3">${i.title}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem">
      <div style="font-size:.76rem;color:var(--mist)">📍 ${i.location}</div>
      <div style="font-size:.76rem;color:var(--mist)">💼 ${i.mode}</div>
      <div style="font-size:.76rem;color:var(--mist)">⏳ ${i.duration}</div>
      <div style="font-size:.82rem;font-family:var(--ff-mono);font-weight:500;color:var(--mint)">${i.paid?i.stipend:'Unpaid'}</div>
    </div>
    <div class="pill-row">
      <span class="tag tag-violet" style="font-size:.7rem">${i.domain}</span>
      ${i.paid?'<span class="tag tag-mint" style="font-size:.7rem">💰 Paid</span>':'<span class="tag tag-rose" style="font-size:.7rem">Unpaid</span>'}
      ${i.skills.slice(0,2).map(s=>`<span class="tag tag-sky" style="font-size:.7rem">${s}</span>`).join('')}
    </div>
    <div style="background:rgba(${dc==='mint'?'18,217,146':dc==='amber'?'245,166,35':'242,95,106'},.08);border:1px solid rgba(${dc==='mint'?'18,217,146':dc==='amber'?'245,166,35':'242,95,106'},.25);border-radius:8px;padding:.4rem .7rem;display:flex;justify-content:space-between;font-size:.76rem;color:var(--${dc})">
      <span>${dl}</span><span>${fmtDate(i.deadline)}</span>
    </div>
    <div style="display:flex;gap:.5rem;margin-top:.1rem" onclick="event.stopPropagation()">
      <button class="btn btn-sky btn-sm" style="flex:1" onclick="openDetail(${i.id})">View Details</button>
      <button class="btn btn-violet btn-sm" style="flex:1" onclick="initTest(${i.id})">📝 Mock Test</button>
      <button class="btn btn-outline btn-sm" style="width:36px;padding:.38rem;flex-shrink:0" onclick="toggleBm(${i.id})">${bm?'🔖':'🤍'}</button>
    </div>
    ${app?`<div style="font-size:.72rem;color:var(--fog);display:flex;align-items:center;gap:.4rem">✅ Applied · <span class="status-pill sp-${app.status}">${app.status}</span></div>`:''}
  </div>`;
}

// ═══════════════════════════════════
// DETAIL PAGE
// ═══════════════════════════════════
function openDetail(id){
  const i = INTERNSHIPS.find(x=>x.id===id); if(!i) return;
  const n=dLeft(i.deadline), dc=dlClass(i.deadline);
  const bm = STATE.bookmarks.has(id);
  const app = STATE.applications.find(a=>a.internId===id);
  const mc = i.match>=75?'badge-high':i.match>=50?'badge-med':'badge-low';
  document.getElementById('detailBody').innerHTML = `
    <button onclick="goBack()" style="display:flex;align-items:center;gap:.4rem;background:none;border:none;color:var(--mist);font-family:var(--ff-body);font-size:.83rem;cursor:pointer;padding:.3rem 0;margin-bottom:1.5rem;transition:.2s" onmouseover="this.style.color='var(--sky)'" onmouseout="this.style.color='var(--mist)'">← Back to listings</button>

    <!-- Hero -->
    <div style="background:linear-gradient(135deg,rgba(79,142,247,.07),rgba(139,108,247,.04));border:1px solid rgba(79,142,247,.2);border-radius:18px;padding:1.8rem;margin-bottom:1.25rem;display:flex;gap:1.25rem;align-items:flex-start;flex-wrap:wrap">
      <div style="width:68px;height:68px;border-radius:14px;background:${i.grad};display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:700;color:#fff;font-family:var(--ff-head);flex-shrink:0">${i.logo}</div>
      <div style="flex:1;min-width:220px">
        <div style="font-family:var(--ff-head);font-size:1.5rem;font-weight:700;margin-bottom:.2rem">${i.title}</div>
        <div style="font-size:.95rem;color:var(--mist);margin-bottom:.75rem">${i.company}</div>
        <div class="pill-row">
          <span class="tag tag-violet">${i.domain}</span>
          ${i.paid?'<span class="tag tag-mint">💰 Paid</span>':'<span class="tag tag-rose">Unpaid</span>'}
          ${i.verified?'<span class="tag tag-sky">✅ Verified</span>':''}
          <span class="badge ${mc}" style="padding:.22rem .6rem">${i.match}% match</span>
        </div>
      </div>
    </div>

    <!-- Info grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.8rem;margin-bottom:1.25rem">
      ${[
        ['📍 Location', i.location, ''],
        ['💼 Mode', i.mode, ''],
        ['⏳ Duration', i.duration, ''],
        ['🕐 Hours/Week', i.hours, ''],
        ['💰 Stipend', i.stipend, 'color:var(--mint);font-family:var(--ff-mono)'],
        ['📅 Deadline', fmtDate(i.deadline)+' · '+n+'d left', `color:var(--${dc})`],
        ['👥 Applicants', i.applicants.toLocaleString('en-IN'), ''],
        ['💳 Reg Fee', i.regFee?'Yes':'No fee', i.regFee?'color:var(--rose)':'color:var(--mint)'],
      ].map(([l,v,s])=>`<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:12px;padding:.9rem 1rem"><div style="font-size:.68rem;color:var(--fog);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.3rem">${l}</div><div style="font-size:.88rem;font-weight:600;${s}">${v}</div></div>`).join('')}
    </div>

    <!-- Description -->
    <div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:1.2rem;margin-bottom:1rem">
      <div style="font-size:.78rem;font-weight:700;color:var(--sky2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.7rem">📋 About the Role</div>
      <p style="font-size:.88rem;color:var(--mist);line-height:1.72">${i.desc}</p>
    </div>

    <!-- Requirements -->
    <div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:1.2rem;margin-bottom:1rem">
      <div style="font-size:.78rem;font-weight:700;color:var(--sky2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.7rem">📌 Requirements</div>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:.5rem">
        ${i.requirements.map(r=>`<li style="font-size:.86rem;color:var(--mist);display:flex;align-items:flex-start;gap:.5rem;line-height:1.5"><span style="color:var(--sky);flex-shrink:0;margin-top:1px">→</span>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- Required skills with match -->
    <div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:1.2rem;margin-bottom:1.5rem">
      <div style="font-size:.78rem;font-weight:700;color:var(--sky2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem">🛠 Required Skills</div>
      <div class="pill-row">
        ${i.skills.map(s=>{
          const matched = STATE.detectedSkills.some(d=>d.toLowerCase()===s.toLowerCase()||s.toLowerCase().includes(d.split(' ')[0].toLowerCase()));
          return `<span class="tag ${matched?'tag-mint':'tag-fog'}">${matched?'✓ ':''} ${s}</span>`;
        }).join('')}
      </div>
      ${STATE.detectedSkills.length ? `<div style="font-size:.75rem;color:var(--fog);margin-top:.7rem">✅ Green = matched from your resume &nbsp;|&nbsp; Grey = not detected</div>` : ''}
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:.8rem;flex-wrap:wrap">
      <button class="btn btn-sky btn-lg" onclick="doApply(${i.id})">🚀 Apply Now</button>
      <button class="btn btn-violet btn-lg" onclick="initTest(${i.id})">📝 Take Mock Test</button>
      <button class="btn btn-outline btn-lg" onclick="toggleBm(${i.id});this.textContent='${bm?'🤍 Save':'🔖 Saved'}'">
        ${bm?'🔖 Saved':'🤍 Save'}
      </button>
    </div>

    ${app?`<div style="margin-top:1rem;padding:.85rem 1.1rem;background:rgba(18,217,146,.06);border:1px solid rgba(18,217,146,.2);border-radius:12px;font-size:.85rem;display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
      ✅ Applied on ${app.date} &nbsp;·&nbsp; Status: <span class="status-pill sp-${app.status}">${app.status}</span>
    </div>`:''}
  `;
  STATE.navStack.push(STATE.currentScreen);
  showScreen('detail');
  syncNotifDots();
}

// ═══════════════════════════════════
// APPLY
// ═══════════════════════════════════
function doApply(id){
  const i = INTERNSHIPS.find(x=>x.id===id); if(!i) return;
  if(!STATE.applications.find(a=>a.internId===id)){
    const statuses=['pending','reviewing','shortlisted'];
    STATE.applications.push({internId:id, date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}), status:statuses[Math.floor(Math.random()*statuses.length)], intern:i});
    document.getElementById('qs-applied').textContent = STATE.applications.length;
    document.getElementById('sc-apps').textContent = STATE.applications.length;
    toast('Application recorded! Opening official portal…','mint');
  } else {
    toast('Already applied! Opening official portal…','sky');
  }
  setTimeout(()=>window.open(i.applyUrl,'_blank'), 700);
}

// ═══════════════════════════════════
// BOOKMARKS
// ═══════════════════════════════════
function toggleBm(id){
  if(STATE.bookmarks.has(id)) STATE.bookmarks.delete(id);
  else { STATE.bookmarks.add(id); addBmNotif(id); toast('Bookmarked! Deadline alert set.','amber'); }
  document.getElementById('sc-bookmarks').textContent = STATE.bookmarks.size;
  document.getElementById('qs-saved').textContent = STATE.bookmarks.size;
  filterCards();
}
function addBmNotif(id){
  const i=INTERNSHIPS.find(x=>x.id===id); if(!i) return;
  const n=dLeft(i.deadline), type=dlClass(i.deadline);
  STATE.notifications.unshift({id:Date.now(), title:`${i.company} — ${i.title}`, sub:n<=1?'🔴 Closes tomorrow!':n<=3?`🟡 ${n} days left`:`🟢 ${n} days left`, type, time:'Just now'});
  document.getElementById('notifDot').style.display='block';
  if(document.getElementById('notifDot2')) document.getElementById('notifDot2').style.display='block';
  renderNotifs();
}
function renderBookmarks(){
  const list=INTERNSHIPS.filter(i=>STATE.bookmarks.has(i.id));
  document.getElementById('bmLabel').textContent = list.length+' saved';
  const g=document.getElementById('bmGrid');
  if(!list.length){ g.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="ei">🔖</div><p>No bookmarks yet.<br>Save internships from the discover page.</p></div>`; return; }
  g.innerHTML = list.map(i=>internCard(i)).join('');
}

// ═══════════════════════════════════
// APPLICATIONS LIST
// ═══════════════════════════════════
function renderApplications(){
  const el=document.getElementById('appList');
  if(!STATE.applications.length){ el.innerHTML=`<div class="empty"><div class="ei">📋</div><p>No applications yet.<br>Apply to internships to track status here.</p></div>`; return; }
  el.innerHTML = STATE.applications.map(a=>`
    <div class="app-row">
      <div style="width:40px;height:40px;border-radius:9px;background:${a.intern.grad};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#fff;font-family:var(--ff-head);flex-shrink:0">${a.intern.logo}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.87rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.intern.title}</div>
        <div style="font-size:.76rem;color:var(--fog)">${a.intern.company} · Applied ${a.date}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.35rem;flex-shrink:0">
        <span class="status-pill sp-${a.status}">${a.status}</span>
        <button class="btn btn-outline btn-sm" onclick="openDetail(${a.intern.id})" style="font-size:.7rem">View</button>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════
// TEST HISTORY
// ═══════════════════════════════════
function renderTestHistory(){
  const el=document.getElementById('testHistList');
  if(!STATE.testHistory.length){ el.innerHTML=`<div class="empty"><div class="ei">🏆</div><p>No tests taken yet.<br>Take mock tests from internship detail pages.</p></div>`; return; }
  el.innerHTML = STATE.testHistory.map(t=>`
    <div class="app-row">
      <div style="width:40px;height:40px;border-radius:9px;background:${t.intern.grad};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#fff;font-family:var(--ff-head);flex-shrink:0">${t.intern.logo}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.87rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.intern.title}</div>
        <div style="font-size:.76rem;color:var(--fog)">${t.intern.company} · ${t.date} · ${t.correct}/${t.total} correct</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.35rem;flex-shrink:0">
        <span style="font-family:var(--ff-mono);font-size:.9rem;font-weight:700;color:${t.pass?'var(--mint)':'var(--rose)'}">${t.score}%</span>
        <span style="font-size:.72rem;color:${t.pass?'var(--mint)':'var(--rose)'}">${t.pass?'✅ Pass':'❌ Needs work'}</span>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════
// DASHBOARD PANEL
// ═══════════════════════════════════
function renderDashPanel(){
  if(!STATE.user) return;
  const u=STATE.user;
  document.getElementById('profName').textContent = u.name;
  document.getElementById('profMeta').textContent = `${u.email}  ·  ${u.degree||u.college}`;
  const domainNames = (u.domains||[]).map(id=>DOMAINS_DATA.find(d=>d.id===id)?.name).filter(Boolean);
  document.getElementById('profDomains').innerHTML = domainNames.map(d=>`<span class="tag tag-sky" style="font-size:.72rem">${d}</span>`).join('');
  document.getElementById('qs-applied').textContent = STATE.applications.length;
  document.getElementById('qs-saved').textContent = STATE.bookmarks.size;
  renderDeadlines();
}
function renderDeadlines(){
  const list=INTERNSHIPS.filter(i=>dLeft(i.deadline)<=7).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
  const el=document.getElementById('deadlineList');
  if(!el) return;
  if(!list.length){ el.innerHTML=`<div class="empty" style="padding:1.5rem"><div class="ei" style="font-size:1.8rem">📅</div><p>No internships closing this week.</p></div>`; return; }
  el.innerHTML=list.map(i=>{
    const n=dLeft(i.deadline), dc=dlClass(i.deadline);
    return `<div class="dl-strip" onclick="openDetail(${i.id})" style="cursor:pointer">
      <div class="dl-dot" style="background:var(--${dc})"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.83rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.title}</div>
        <div style="font-size:.73rem;color:var(--fog)">${i.company}</div>
      </div>
      <div style="font-size:.76rem;color:var(--${dc});font-weight:700;white-space:nowrap">${n}d left</div>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();toggleBm(${i.id})" style="padding:.3rem .5rem;font-size:.85rem">${STATE.bookmarks.has(i.id)?'🔖':'🤍'}</button>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════
// MOCK TEST
// ═══════════════════════════════════
function initTest(id){
  const i=INTERNSHIPS.find(x=>x.id===id); if(!i) return;
  STATE.testIntern = i;
  const qs = QDB[i.domain] || QDB["Software Development"];
  STATE.testQs = qs.sort(()=>Math.random()-.5).slice(0,10);
  STATE.testAnswers = new Array(10).fill(undefined);
  STATE.testQIdx = 0;
  document.getElementById('testIntroTitle').textContent = i.title+' — Mock Test';
  document.getElementById('testIntroDesc').textContent = `Test your readiness for ${i.company}'s ${i.title} position. 10 domain-specific questions in 20 minutes. Your webcam will be used for proctoring.`;
  document.getElementById('testIntro').style.display='';
  document.getElementById('testActive').style.display='none';
  // Track launch source so we can return correctly
  STATE.testLaunchedFrom = STATE.currentScreen;
  // Update back button label dynamically
  const backBtn = document.getElementById('testBackBtn');
  if(backBtn) backBtn.textContent = STATE.currentScreen === 'resume' ? '← Back to Recommendations' : '← Go Back';
  STATE.navStack.push(STATE.currentScreen);
  showScreen('test');
}
function beginTest(){
  document.getElementById('testIntro').style.display='none';
  document.getElementById('testActive').style.display='';
  document.getElementById('testLabel').textContent = STATE.testIntern.title+' @ '+STATE.testIntern.company;
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({video:true}).then(s=>{ document.getElementById('camFeed').srcObject=s; }).catch(()=>{});
  }
  STATE.testSecsLeft = 1200;
  clearInterval(STATE.testInterval);
  STATE.testInterval = setInterval(()=>{
    STATE.testSecsLeft--;
    const m=Math.floor(STATE.testSecsLeft/60), s=STATE.testSecsLeft%60;
    const el=document.getElementById('testTimerDisplay');
    el.textContent=`${m}:${s.toString().padStart(2,'0')}`;
    el.style.color = STATE.testSecsLeft<=120 ? 'var(--rose)' : STATE.testSecsLeft<=300 ? 'var(--amber)' : 'var(--sky)';
    if(STATE.testSecsLeft<=0){ clearInterval(STATE.testInterval); finishTest(); }
  },1000);
  renderQ();
}
function renderQ(){
  const q=STATE.testQs[STATE.testQIdx], idx=STATE.testQIdx;
  document.getElementById('qCounter').textContent = `Q ${idx+1} / ${STATE.testQs.length}`;
  document.getElementById('qLabel2').textContent = `QUESTION ${idx+1} OF ${STATE.testQs.length}`;
  document.getElementById('qText').textContent = q.q;
  document.getElementById('qOpts').innerHTML = q.opts.map((o,i)=>`<div class="t-opt ${STATE.testAnswers[idx]===i?'sel':''}" onclick="selectAns(${i})">${String.fromCharCode(65+i)}. ${o}</div>`).join('');
  const dots=document.getElementById('qDots');
  dots.innerHTML=STATE.testQs.map((_,i)=>`<div class="qdot ${i<idx?'done':i===idx?'curr':''}"></div>`).join('');
}
function selectAns(i){
  STATE.testAnswers[STATE.testQIdx] = i;
  document.querySelectorAll('.t-opt').forEach((o,j)=>{ o.classList.toggle('sel', j===i); });
}
function nextQ(){
  if(STATE.testAnswers[STATE.testQIdx]===undefined){ toast('Select an answer first','amber'); return; }
  // Flash feedback
  const q=STATE.testQs[STATE.testQIdx];
  document.querySelectorAll('.t-opt').forEach((o,i)=>{
    if(i===q.a) o.classList.add('correct');
    else if(i===STATE.testAnswers[STATE.testQIdx] && STATE.testAnswers[STATE.testQIdx]!==q.a) o.classList.add('wrong');
    o.onclick = null;
  });
  setTimeout(()=>{
    if(STATE.testQIdx < STATE.testQs.length-1){ STATE.testQIdx++; renderQ(); }
    else finishTest();
  }, 650);
}
function finishTest(){
  clearInterval(STATE.testInterval);
  const video=document.getElementById('camFeed');
  if(video && video.srcObject) video.srcObject.getTracks().forEach(t=>t.stop());
  const correct=STATE.testQs.filter((q,i)=>STATE.testAnswers[i]===q.a).length;
  const score=Math.round((correct/STATE.testQs.length)*100);
  const pass=score>=60;
  const record={intern:STATE.testIntern, score, pass, correct, total:STATE.testQs.length, date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})};
  STATE.testHistory.push(record);
  document.getElementById('sc-bookmarks').textContent=STATE.bookmarks.size;
  renderResult(record);
}
function goBackFromResult(){
  if(STATE.testLaunchedFrom === 'resume'){
    showScreen('resume');
    // Scroll to the recommendations section
    setTimeout(()=>{
      const el = document.getElementById('ru-results');
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, 350);
  } else {
    goBack();
  }
}

async function finishTest(){
  clearInterval(STATE.testInterval);
  const video = document.getElementById('camFeed');
  if(video && video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());

  const correct = STATE.testQs.filter((q,i) => STATE.testAnswers[i] === q.a).length;
  const score = Math.round((correct / STATE.testQs.length) * 100);
  const pass = score >= 60;
  
  const record = {
    internId: STATE.testIntern.id, // Better to store ID than the whole object
    score, 
    pass, 
    correct, 
    total: STATE.testQs.length, 
    date: new Date().toLocaleDateString('en-IN')
  };

  // 1. Update local state
  STATE.testHistory.push(record);

  // 2. SYNC TO SERVER
  try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      await fetch('/api/sync-user', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
          },
          // We send the updated history
          body: JSON.stringify({ testHistory: STATE.testHistory })
      });
      toast('Test results saved to profile!', 'mint');
  } catch (e) {
      console.error("Failed to sync test results", e);
  }

  renderResult(record);
}

function renderResult(rec){
  const i=rec.intern, s=rec.score, pass=rec.pass;
  const col=s>=75?'var(--mint)':s>=50?'var(--amber)':'var(--rose)';
  const gaps=i.skills.filter(sk=>!STATE.detectedSkills.some(d=>d.toLowerCase()===sk.toLowerCase()||sk.toLowerCase().includes(d.split(' ')[0].toLowerCase())));
  const strong=i.skills.filter(sk=>STATE.detectedSkills.some(d=>d.toLowerCase()===sk.toLowerCase()||sk.toLowerCase().includes(d.split(' ')[0].toLowerCase())));
  const circ=2*Math.PI*54, dash=circ-(s/100)*circ;
  // Determine label for topbar back button
  const fromResume = STATE.testLaunchedFrom === 'resume';
  const backLabel = fromResume ? '← Back to Recommendations' : '← Browse Internships';
  const backBtnEl = document.getElementById('resultBackBtn');
  if(backBtnEl) backBtnEl.textContent = backLabel;

  document.getElementById('resultBody').innerHTML=`
    ${fromResume ? `<div style="margin-bottom:1.5rem">
      <button onclick="goBackFromResult()" style="display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:10px;background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.2);color:var(--sky);font-family:var(--ff-body);font-size:.83rem;font-weight:600;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(79,142,247,.14)'" onmouseout="this.style.background='rgba(79,142,247,.08)'">← Back to Recommendations</button>
    </div>` : ''}

    <div style="text-align:center;padding:2rem 0 1.5rem">
      <svg width="150" height="150" viewBox="0 0 120 120" style="transform:rotate(-90deg);margin-bottom:-.75rem">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="12"/>
        <circle cx="60" cy="60" r="54" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"
          stroke-dasharray="${circ}" stroke-dashoffset="${dash}" style="transition:stroke-dashoffset 1.2s cubic-bezier(.22,.68,0,1)"/>
      </svg>
      <div style="font-family:var(--ff-head);font-size:2rem;font-weight:800;color:${col};margin-bottom:.15rem">${s}%</div>
      <div style="font-size:.78rem;color:var(--fog);margin-bottom:1rem">${rec.correct}/${rec.total} correct answers</div>
      <h2 style="font-family:var(--ff-head);font-size:1.4rem;margin-bottom:.4rem">${pass?'🎉 Great Performance!':'📚 Keep Improving'}</h2>
      <p style="color:var(--mist);font-size:.88rem">Test for: <strong style="color:var(--snow)">${i.title} @ ${i.company}</strong></p>
    </div>

    <div style="background:linear-gradient(135deg,rgba(79,142,247,.08),rgba(139,108,247,.05));border:1px solid rgba(79,142,247,.2);border-radius:14px;padding:1.4rem;text-align:center;margin-bottom:1rem">
      <div style="font-size:1.5rem;margin-bottom:.4rem">${pass?'🚀':'📖'}</div>
      <div style="font-family:var(--ff-head);font-size:1.05rem;font-weight:700;color:var(--sky2);margin-bottom:.4rem">${pass?'You\'re ready to apply!':'Here\'s what to focus on'}</div>
      <p style="font-size:.84rem;color:var(--mist);line-height:1.6">${pass?'Your skill set aligns well with this role. Go ahead and submit your application to '+i.company+'.':'Strengthen the identified skill gaps and retake the test when ready. Most gaps can be addressed in 2-4 weeks of focused learning.'}</p>
    </div>

    ${gaps.length?`<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:1.2rem;margin-bottom:1rem">
      <div style="font-size:.78rem;font-weight:700;color:var(--rose);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem">🔴 Skill Gaps to Address</div>
      ${gaps.map(sk=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--rim);font-size:.85rem">
        <span style="color:var(--mist)">${sk}</span>
        <div style="display:flex;align-items:center;gap:.6rem">
          <div style="display:flex;gap:3px">${[1,2,3,4,5].map(l=>`<div style="width:8px;height:8px;border-radius:50%;background:${l<=2?'var(--rose)':'rgba(255,255,255,.08)'}"></div>`).join('')}</div>
          <span style="font-size:.72rem;color:var(--amber)">Needs work</span>
        </div>
      </div>`).join('')}
    </div>`:''}

    ${strong.length?`<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:1.2rem;margin-bottom:1rem">
      <div style="font-size:.78rem;font-weight:700;color:var(--mint);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.7rem">✅ Your Strong Skills</div>
      <div class="pill-row">${strong.map(s=>`<span class="tag tag-mint">✓ ${s}</span>`).join('')}</div>
    </div>`:''}

    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.5rem">
      <button class="btn btn-sky btn-lg" onclick="doApply(${i.id});goto('discover')">🚀 Apply Now</button>
      <button class="btn btn-outline btn-lg" onclick="initTest(${i.id})">↺ Retake Test</button>
      ${fromResume ? `<button class="btn btn-violet btn-lg" onclick="goBackFromResult()">📋 My Recommendations</button>` : `<button class="btn btn-outline btn-lg" onclick="goto('tests')">📊 Test History</button>`}
    </div>`;
  STATE.navStack.push(STATE.currentScreen);
  showScreen('result');
  syncNotifDots();
  // Update resultAvi
  if(STATE.user){ document.getElementById('resultAvi').textContent = STATE.user.fname?STATE.user.fname[0].toUpperCase():'U'; }
  // animate score ring
  setTimeout(()=>{ const c=document.querySelector('#resultBody circle:last-child'); if(c) c.style.strokeDashoffset=dash; },50);
}


// ═══════════════════════════════════
// RESUME UPLOAD SCREEN (SCREEN 2.5)
// ═══════════════════════════════════
function ruDragOver(e){ e.preventDefault(); document.getElementById('ru-dropzone').style.borderColor='rgba(79,142,247,.8)'; document.getElementById('ru-dropzone').style.background='rgba(79,142,247,.05)'; }
function ruDragLeave(){ document.getElementById('ru-dropzone').style.borderColor=''; document.getElementById('ru-dropzone').style.background=''; }
function ruDropFile(e){ e.preventDefault(); ruDragLeave(); const f=e.dataTransfer.files[0]; if(f) handleResumeUpload(f); }

function skipResume(){
  toast('You can upload your resume anytime from the dashboard','amber');
  goto('discover', false);
  initDiscover();
}

function proceedToDashboard(){
  goto('discover', false);
  initDiscover();
  toast('Welcome! Your matched internships are ready 🚀','mint');
}

async function handleResumeUpload(file){
  if(!file) return;
  // Show processing state
  document.getElementById('ru-default').style.display='none';
  document.getElementById('ru-done').style.display='none';
  document.getElementById('ru-processing').style.display='';
  document.getElementById('ru-results').style.display='none';
  document.getElementById('ru-dropzone').style.cursor='default';

  const steps = [
    {label:'Reading your resume...', pct: 15},
    {label:'Extracting skills with AI...', pct: 40},
    {label:'Analysing skill depth...', pct: 65},
    {label:'Computing internship matches...', pct: 85},
    {label:'Finalising recommendations...', pct: 95},
  ];

  // Animate progress bar while we await AI
  let stepIdx = 0;
  const stepInterval = setInterval(()=>{
    if(stepIdx < steps.length){
      document.getElementById('ru-proc-bar').style.width = steps[stepIdx].pct + '%';
      document.getElementById('ru-proc-step').textContent = steps[stepIdx].label;
      document.getElementById('ru-proc-title').textContent = stepIdx < 2 ? 'AI is reading your resume...' : 'AI is matching internships...';
      stepIdx++;
    }
  }, 900);

  // Read file content
  let resumeText = '';
  try {
    if(file.type === 'application/pdf' || file.name.endsWith('.pdf')){
      resumeText = `[PDF Resume: ${file.name}] — This is a sample resume for ${STATE.user?.fname||'the user'} studying ${STATE.user?.degree||'Computer Science'} at ${STATE.user?.college||'a top university'}. The resume contains skills related to selected domains: ${(STATE.user?.domains||[]).map(id=>DOMAINS_DATA.find(d=>d.id===id)?.name).filter(Boolean).join(', ')}.`;
    } else {
      resumeText = await file.text();
    }
  } catch(e) {
    resumeText = `Resume for ${STATE.user?.fname||'student'} with background in ${(STATE.user?.domains||[]).map(id=>DOMAINS_DATA.find(d=>d.id===id)?.name).filter(Boolean).join(', ')||'technology'}.`;
  }

  // Build domain context for AI
  const domainNames = (STATE.user?.domains||[]).map(id=>DOMAINS_DATA.find(d=>d.id===id)?.name).filter(Boolean);
  const allInternshipSkills = [...new Set(INTERNSHIPS.flatMap(i=>i.skills))];

  // Call Anthropic API for skill extraction
  let extractedSkills = [];
 try {
  const resp = await fetch('/api/extract-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: resumeText.slice(0, 4000),
      domainNames: domainNames,
      allSkills: allInternshipSkills
    })
  });
  const data = await resp.json();
  extractedSkills = data.skills || [];
} catch(e) {
    // Fallback: use domain-based skill pool
    const pool = [...GENERIC];
    domainNames.forEach(dn=>{ if(SKILL_POOLS[dn]) pool.push(...SKILL_POOLS[dn]); });
    extractedSkills = [...new Set(pool)].sort(()=>Math.random()-.5).slice(0, 14);
  }

  clearInterval(stepInterval);
  document.getElementById('ru-proc-bar').style.width = '100%';
  document.getElementById('ru-proc-step').textContent = 'Done!';
  await new Promise(r=>setTimeout(r, 400));

  // Store skills in STATE
  STATE.detectedSkills = extractedSkills.slice(0, 18);

  // Recalculate match percentages for all internships
  INTERNSHIPS.forEach(intern => {
    const matchedSkills = intern.skills.filter(sk =>
      STATE.detectedSkills.some(d =>
        d.toLowerCase() === sk.toLowerCase() ||
        sk.toLowerCase().includes(d.toLowerCase().split(' ')[0]) ||
        d.toLowerCase().includes(sk.toLowerCase().split(' ')[0])
      )
    );
    const baseMatch = Math.round((matchedSkills.length / intern.skills.length) * 100);
    // Domain bonus
    const domainBonus = domainNames.includes(intern.domain) ? 8 : 0;
    intern.match = Math.min(98, baseMatch + domainBonus + Math.floor(Math.random()*5));
    intern._matchedSkills = matchedSkills;
    intern._missingSkills = intern.skills.filter(sk => !matchedSkills.includes(sk));
  });

  // Show done state
  document.getElementById('ru-processing').style.display='none';
  document.getElementById('ru-done').style.display='';
  document.getElementById('ru-done-sub').textContent = `${STATE.detectedSkills.length} skills detected · ${INTERNSHIPS.filter(i=>i.match>=50).length} internships matched`;
  document.getElementById('ru-dropzone').style.cursor='pointer';

  // Render skill tags
  document.getElementById('ru-skill-count').textContent = STATE.detectedSkills.length + ' skills found';
  document.getElementById('ru-skill-tags').innerHTML = STATE.detectedSkills.map(s=>`<span class="tag tag-sky">${s}</span>`).join('');

  // Render matched internships sorted by match %
  const sorted = [...INTERNSHIPS].sort((a,b)=>b.match-a.match).slice(0, 8);
  const matchLabel = `${INTERNSHIPS.filter(i=>i.match>=50).length} strong matches found`;
  document.getElementById('ru-match-label').textContent = matchLabel;
  document.getElementById('ru-match-grid').innerHTML = sorted.map(intern => renderMatchCard(intern)).join('');

  document.getElementById('ru-results').style.display='';
  // Update dashboard stats
  document.getElementById('qs-matched').textContent = INTERNSHIPS.filter(i=>i.match>=50).length;
  toast(`✨ ${STATE.detectedSkills.length} skills extracted! ${INTERNSHIPS.filter(i=>i.match>=50).length} matches found.`, 'mint');
  // Scroll to results
  setTimeout(()=>{ document.getElementById('ru-results').scrollIntoView({behavior:'smooth',block:'start'}); }, 200);
}

function renderMatchCard(intern){
  const pct = intern.match;
  const col = pct >= 75 ? 'var(--mint)' : pct >= 50 ? 'var(--sky)' : pct >= 35 ? 'var(--amber)' : 'var(--rose)';
  const label = pct >= 75 ? 'Strong Match' : pct >= 50 ? 'Good Match' : pct >= 35 ? 'Partial Match' : 'Low Match';
  const labelBg = pct >= 75 ? 'rgba(18,217,146,.12)' : pct >= 50 ? 'rgba(79,142,247,.12)' : pct >= 35 ? 'rgba(245,166,35,.1)' : 'rgba(242,95,106,.1)';
  const labelBorder = pct >= 75 ? 'rgba(18,217,146,.3)' : pct >= 50 ? 'rgba(79,142,247,.3)' : pct >= 35 ? 'rgba(245,166,35,.3)' : 'rgba(242,95,106,.25)';
  const matched = intern._matchedSkills || [];
  const missing = intern._missingSkills || [];
  const circ = 2*Math.PI*22, dash = circ - (pct/100)*circ;

  return `<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:16px;padding:1.3rem;transition:all .22s;overflow:hidden;position:relative" onmouseover="this.style.borderColor='rgba(79,142,247,.35)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='';this.style.transform=''">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${col},transparent)"></div>
    <div style="display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap">

      <!-- Logo + info -->
      <div style="display:flex;align-items:flex-start;gap:.85rem;flex:1;min-width:220px">
        <div style="width:44px;height:44px;border-radius:11px;background:${intern.grad};display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:1.05rem;flex-shrink:0;font-family:var(--ff-head)">${intern.logo}</div>
        <div style="flex:1">
          <div style="font-family:var(--ff-head);font-size:.95rem;font-weight:700;margin-bottom:.1rem">${intern.title}</div>
          <div style="font-size:.8rem;color:var(--mist);margin-bottom:.35rem">${intern.company} · ${intern.mode} · ${intern.stipend}</div>
          <div style="display:flex;flex-wrap:wrap;gap:.3rem">
            ${matched.slice(0,3).map(s=>`<span class="tag tag-mint" style="font-size:.68rem">✓ ${s}</span>`).join('')}
            ${missing.slice(0,2).map(s=>`<span class="tag tag-rose" style="font-size:.68rem">✗ ${s}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Match ring + CTA -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.5rem;flex-shrink:0">
        <div style="position:relative;width:64px;height:64px">
          <svg width="64" height="64" viewBox="0 0 56 56" style="transform:rotate(-90deg)">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="6"/>
            <circle cx="28" cy="28" r="22" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"
              stroke-dasharray="${circ}" stroke-dashoffset="${dash}" style="transition:stroke-dashoffset 1s cubic-bezier(.22,.68,0,1)"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-family:var(--ff-mono);font-size:.82rem;font-weight:700;color:${col};line-height:1">${pct}%</div>
          </div>
        </div>
        <div style="font-size:.65rem;font-weight:700;color:${col};background:${labelBg};border:1px solid ${labelBorder};border-radius:20px;padding:.12rem .45rem;white-space:nowrap">${label}</div>
        <button class="btn btn-sky btn-sm" style="margin-top:.1rem" onclick="openDetail(${intern.id})">View →</button>
      </div>

    </div>

    <!-- Match breakdown bar -->
    <div style="margin-top:1rem;padding-top:.85rem;border-top:1px solid var(--rim)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
        <div style="font-size:.72rem;color:var(--fog)">Skill Match</div>
        <div style="font-size:.72rem;font-family:var(--ff-mono);color:${col}">${matched.length}/${intern.skills.length} skills matched</div>
      </div>
      <div style="height:6px;background:var(--glass2);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;border-radius:4px;background:linear-gradient(90deg,${col},${col}88);transition:width 1s cubic-bezier(.22,.68,0,1)"></div>
      </div>
    </div>
  </div>`;
}

function setupNotifications(){
  STATE.notifications = [];
  INTERNSHIPS.filter(i=>dLeft(i.deadline)<=5).forEach(i=>{
    const n=dLeft(i.deadline), type=dlClass(i.deadline);
    STATE.notifications.push({id:i.id, title:`${i.company} — ${i.title}`, sub:n<=1?'🔴 Closes tomorrow!':n<=3?`🟡 ${n} days left`:`🟢 ${n} days left`, type, time:n+'d left'});
  });
  if(STATE.notifications.length) { document.getElementById('notifDot').style.display='block'; }
  renderNotifs();
}
function renderNotifs(){
  const el=document.getElementById('notifList');
  if(!STATE.notifications.length){ el.innerHTML=`<div style="padding:1.5rem;text-align:center;color:var(--fog);font-size:.82rem">No notifications</div>`; return; }
  el.innerHTML=STATE.notifications.map(n=>`<div class="np-item"><div class="np-dot" style="background:${n.type==='mint'?'var(--mint)':n.type==='amber'?'var(--amber)':'var(--rose)'}"></div><div class="np-body"><div class="nt">${n.title}</div><div class="ns">${n.sub}</div></div><div class="np-time">${n.time}</div></div>`).join('');
}
function toggleNotif(){ document.getElementById('notifPanel').classList.toggle('open'); }
function clearNotifs(){ STATE.notifications=[]; renderNotifs(); document.getElementById('notifDot').style.display='none'; if(document.getElementById('notifDot2')) document.getElementById('notifDot2').style.display='none'; }
function syncNotifDots(){ const show=STATE.notifications.length>0?'block':'none'; ['notifDot','notifDot2'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=show;}); }
document.addEventListener('click',e=>{if(!e.target.closest('#notifPanel')&&!e.target.closest('#notifBtn')&&!e.target.closest('[onclick="toggleNotif()"]'))document.getElementById('notifPanel').classList.remove('open');});

// ═══════════════════════════════════
// TOAST
// ═══════════════════════════════════
function toast(msg, type='sky'){
  const shelf=document.getElementById('toastShelf');
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=msg;
  shelf.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(100%)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),300); }, 3200);
}

// ═══════════════════════════════════
// INIT
// ═══════════════════════════════════
// Activate first auth tab
authTab('login');
// Show auth screen on load
showScreen('auth');
