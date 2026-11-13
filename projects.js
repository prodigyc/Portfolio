const projects = [
      {
        id: "aurix", title: "AURIX — Android forensics", type: "Capstone", category: "forensics", year: "2026", status: "In progress",
        image: "assets/projects/aurix.svg",
        summary: "A unified Android extraction and investigation workflow spanning 13 artifact categories.",
        description: "Co-designed an Android forensic extraction and reporting system covering device and system information, calls, SMS, app activity, installed apps, browser history, Wi-Fi configuration, photo/GPS metadata, and messaging artifacts. The workflow emphasizes hashing, read-only working copies, timestamp normalization, and provenance.",
        tools: ["ALEAPP", "SHA-256", "Android artifacts"],
        outcomes: ["Defined an investigator-focused report with a technical appendix.", "Designed a unified timeline with rule-based correlation while preserving evidence IDs.", "Specified modular parsers and explicit handling for unavailable or unsupported artifacts."]
      },
      {
        id: "red-team", title: "Penetration testing & red-team lab", type: "Offensive security", category: "security", year: "2026", status: "Lab exercise",
        image: "assets/projects/red-team.svg",
        summary: "Controlled exploitation and Active Directory security exercises in an authorized lab.",
        description: "Built a controlled stack-based buffer-overflow exploit and worked through an Active Directory lab using enumeration, Kerberoasting, password testing, BloodHound path analysis, credential discovery, and privilege escalation. Also explored web-application race conditions with Burp Suite and Turbo Intruder.",
        tools: ["Kali Linux", "Burp Suite", "BloodHound", "Nmap"],
        outcomes: ["Practiced a structured discovery-to-impact workflow in isolated lab environments.", "Analyzed Active Directory relationships and attack paths.", "Tested web race conditions and completed additional CTF exercises."]
      },
      {
        id: "forensics-case", title: "Confidential data leak investigation", type: "Digital forensics", category: "forensics", year: "2026", status: "Case study",
        image: "assets/projects/forensics-case.svg",
        summary: "Reconstructed artifacts and recovered files from PC and USB forensic images.",
        description: "Analyzed computer and USB forensic images using hex, imaging, file-carving, browser-history, and JumpList tools. Preserved original evidence, worked from analysis copies, and verified recovered evidence using hash comparisons.",
        tools: ["HxD", "FTK Imager", "PhotoRec", "HashMyFiles"],
        outcomes: ["Reconstructed damaged NTFS/MBR structures.", "Carved a hidden DOCX contract embedded in a PNG and recovered deleted files.", "Correlated browser and JumpList artifacts and verified results with hashes."]
      },
      {
        id: "playpath", title: "PlayPath — security management", type: "Governance", category: "security", year: "2026", status: "Roadmap",
        image: "assets/projects/playpath.svg",
        summary: "A COBIT and NIST-aligned information security management roadmap.",
        description: "Designed an information security management program using COBIT 2019 and NIST CSF 2.0. The work prioritized governance objectives, assessed capability maturity, mapped outcomes, and produced a phased gap-closure roadmap.",
        tools: ["COBIT 2019", "NIST CSF 2.0", "Maturity assessment"],
        outcomes: ["Prioritized governance and security objectives.", "Mapped outcomes across Govern, Identify, Protect, Detect, Respond, and Recover.", "Produced a phased roadmap to close identified gaps."]
      },
      {
        id: "network", title: "Secure multi-site enterprise network", type: "Network design", category: "systems", year: "2025", status: "Architecture",
        image: "assets/projects/network.svg",
        summary: "A segmented Cisco network design with layered access controls and site connectivity.",
        description: "Designed and configured a multi-site network with VLAN segmentation, access control lists, site-to-site IPsec VPNs, SSH/AAA, firewall zones and a DMZ, NAT, DHCP/DNS, port security, and DHCP snooping.",
        tools: ["Cisco Packet Tracer", "VLANs", "IPsec", "ACLs"],
        outcomes: ["Separated network zones and controlled access between segments.", "Designed secure site connectivity and management access.", "Applied infrastructure hardening controls."]
      },
      {
        id: "analytics", title: "CPU market analytics & forecasting", type: "Data analytics", category: "data", year: "2026", status: "Dashboard",
        image: "assets/projects/analytics.svg",
        summary: "Power BI dashboards for CPU pricing, sales rank, and product forecasting.",
        description: "Collected structured CPU market data, cleaned and transformed the dataset in Power BI, built monthly pricing and sales-rank KPIs, created dashboards, and applied forecasting to evaluate product performance and pricing decisions.",
        tools: ["Power BI", "Data preparation", "Forecasting"],
        outcomes: ["Built monthly pricing and sales-rank measures.", "Created visual dashboards for market trends.", "Applied forecasting to support product and pricing analysis."]
      },
      {
        id: "deadzone", title: "DeadZone — e-commerce platform", type: "Commerce & strategy", category: "data", year: "2026", status: "Platform build",
        image: "assets/projects/deadzone.svg",
        summary: "A responsive gaming store built with WordPress and WooCommerce.",
        description: "Built and documented a gaming e-commerce platform with searchable and filterable products, product variations, JOD pricing, customer accounts, wishlist, cart and checkout, newsletter integration, and 3D product presentation. Developed the supporting e-tailer and customer-journey strategy.",
        tools: ["WordPress", "WooCommerce", "Responsive UX"],
        outcomes: ["Created product discovery and purchase flows.", "Integrated accounts, cart, checkout, and newsletter features.", "Documented SWOT, customer journey, and multi-channel strategy."]
      },
      {
        id: "risk", title: "Cyber risk & threat modeling", type: "Risk analysis", category: "security", year: "2026", status: "Risk model",
        image: "assets/projects/risk.svg",
        summary: "Structured threat and risk analysis across SQL injection and ransomware scenarios.",
        description: "Modeled SQL-injection and ransomware scenarios using STRIDE, DREAD, MITRE ATT&CK, and FAIR. Used Monte Carlo simulations to explore risk and prioritize practical mitigation recommendations.",
        tools: ["STRIDE", "DREAD", "MITRE ATT&CK", "FAIR"],
        outcomes: ["Mapped threats and attack scenarios using structured models.", "Applied quantitative simulation to risk analysis.", "Prioritized mitigation recommendations."]
      }
    ];
