const fs = require('fs');

const mdFile = 'chapter_3_methodology.md';
let markdown = fs.readFileSync(mdFile, 'utf8');

// Fix 1: Use Case Diagram
const useCaseOld = `usecaseDiagram
    actor "Unregistered User" as Unreg
    actor "Registered User (Creator)" as Creator
    actor "Invited Party (Signer)" as Signer
    actor "System Administrator" as Admin

    package "Anchored Seal System" {
        usecase "Register/Login" as UC1
        usecase "Manage Profile" as UC2
        usecase "Create Agreement" as UC3
        usecase "Manage Templates" as UC4
        usecase "Send Invitations" as UC5
        usecase "View Agreement" as UC6
        usecase "Sign Agreement" as UC7
        usecase "Reject Agreement" as UC8
        usecase "Generate PDF" as UC9
        usecase "View Audit Trail" as UC10
        usecase "Manage Users" as UC11
    }

    Unreg --> UC1
    Creator --> UC1
    Creator --> UC2
    Creator --> UC3
    Creator --> UC4
    Creator --> UC5
    Creator --> UC6
    Creator --> UC9
    Creator --> UC10

    Signer --> UC6
    Signer --> UC7
    Signer --> UC8

    Admin --> UC1
    Admin --> UC4
    Admin --> UC11
    
    UC3 ..> UC4 : <<includes>>
    UC7 ..> UC9 : <<triggers>>`;

const useCaseNew = `flowchart LR
    Unreg["👤 Unregistered User"]
    Creator["👤 Registered User (Creator)"]
    Signer["👤 Invited Party (Signer)"]
    Admin["👤 System Administrator"]

    subgraph System ["Anchored Seal System"]
        UC1(["Register/Login"])
        UC2(["Manage Profile"])
        UC3(["Create Agreement"])
        UC4(["Manage Templates"])
        UC5(["Send Invitations"])
        UC6(["View Agreement"])
        UC7(["Sign Agreement"])
        UC8(["Reject Agreement"])
        UC9(["Generate PDF"])
        UC10(["View Audit Trail"])
        UC11(["Manage Users"])
    end

    Unreg --> UC1
    Creator --> UC1
    Creator --> UC2
    Creator --> UC3
    Creator --> UC4
    Creator --> UC5
    Creator --> UC6
    Creator --> UC9
    Creator --> UC10

    Signer --> UC6
    Signer --> UC7
    Signer --> UC8

    Admin --> UC1
    Admin --> UC4
    Admin --> UC11
    
    UC3 -. "<<includes>>" .-> UC4
    UC7 -. "<<triggers>>" .-> UC9`;

markdown = markdown.replace(useCaseOld, useCaseNew);

// Fix 2: System Architecture Diagram
const archOld = `graph TD
    Client[Web Browser (React/Next.js)]
    
    subgraph "Backend Server Infrastructure"
        API[Node.js / Express API Gateway]
        AuthService[Authentication Service]
        AgreementService[Agreement Management Service]
        SignatureService[Signature & PDF Engine]
        FileStorage[AWS S3 / Cloud Storage]
    end
    
    subgraph "Database Tier"
        DB[(MongoDB - Primary Database)]
        Cache[(Redis - Caching/Sessions)]
    end
    
    Client -- "HTTPS / REST API Calls" --> API
    API --> AuthService
    API --> AgreementService
    API --> SignatureService
    
    AuthService -- "Read/Write" --> DB
    AuthService -- "Session Data" --> Cache
    
    AgreementService -- "CRUD Operations" --> DB
    SignatureService -- "Store/Retrieve Pdfs" --> FileStorage
    SignatureService -- "Verify Data" --> DB`;

const archNew = `flowchart TD
    Client["Web Browser (React/Next.js)"]
    
    subgraph Backend ["Backend Server Infrastructure"]
        API["Node.js / Express API Gateway"]
        AuthService["Authentication Service"]
        AgreementService["Agreement Management Service"]
        SignatureService["Signature & PDF Engine"]
        FileStorage["AWS S3 / Cloud Storage"]
    end
    
    subgraph DatabaseTier ["Database Tier"]
        DB[("MongoDB - Primary Database")]
        Cache[("Redis - Caching/Sessions")]
    end
    
    Client -- "HTTPS / REST API Calls" --> API
    API --> AuthService
    API --> AgreementService
    API --> SignatureService
    
    AuthService -- "Read/Write" --> DB
    AuthService -- "Session Data" --> Cache
    
    AgreementService -- "CRUD Operations" --> DB
    SignatureService -- "Store/Retrieve Pdfs" --> FileStorage
    SignatureService -- "Verify Data" --> DB`;

markdown = markdown.replace(archOld, archNew);

// Fix 3: Image Paths
// Convert C:\Users\... to file:///C:/Users/...
markdown = markdown.replace(/C:\\Users\\USER\\\.gemini\\[^\)]+/g, (match) => {
    return 'file:///' + match.replace(/\\/g, '/');
});

fs.writeFileSync(mdFile, markdown);
console.log('Markdown fixed!');

// Fix 4: build_html.js
let buildScript = fs.readFileSync('build_html.js', 'utf8');
buildScript = buildScript.replace('<html lang="en">', '<html lang="en" data-theme="light">');
buildScript = buildScript.replace(
    'box-sizing: border-box;', 
    'box-sizing: border-box;\n            background-color: #ffffff !important;\n            color: #24292f !important;'
);
fs.writeFileSync('build_html.js', buildScript);
console.log('build_html.js fixed!');
