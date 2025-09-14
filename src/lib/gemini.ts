// Gemini LLM Integration for Website Generation
import { GoogleGenAI } from "@google/genai";

interface InsuranceAgentData {
  agentName: string;
  businessName: string;
  address: string;
  contactNumber: string;
  email: string;
  logoFileName?: string;
  officePhotoFileNames?: string[];
}

interface GeneratedWebsiteFiles {
  'index.html': string;
  'style.css': string;
  'script.js': string;
}

export async function generateInsuranceWebsite(
  agentData: InsuranceAgentData
): Promise<GeneratedWebsiteFiles> {
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using fallback templates.');
    return {
      'index.html': generateFallbackHTML(agentData),
      'style.css': generateFallbackCSS(),
      'script.js': generateFallbackJS()
    };
  }

  try {
    console.log('Generating website using Gemini AI...');
    
    // Initialize GoogleGenAI with API key
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    });

    const logoSection = agentData.logoFileName ? 
      `- Logo file: ${agentData.logoFileName} (use this exact filename in HTML)` : 
      '- No logo provided (do not include logo img tags)';
    
    const officePhotosSection = agentData.officePhotoFileNames && agentData.officePhotoFileNames.length > 0 ? 
      `- Office photos: ${agentData.officePhotoFileNames.join(', ')} (use these exact filenames in HTML)` : 
      '- No office photos provided (do not include office photo img tags)';

    const prompt = `Create a complete professional insurance agent website for the following agent:

Agent Details:
- Name: ${agentData.agentName}
- Business: ${agentData.businessName}
- Address: ${agentData.address}
- Phone: ${agentData.contactNumber}
- Email: ${agentData.email}
${logoSection}
${officePhotosSection}

CRITICAL IMAGE RULES:
- DO NOT use any placeholder images, stock photos, or generic image URLs
- DO NOT include <img> tags for images that don't exist or aren't provided
- ONLY use the specific image files mentioned above (if any)
- NO external image URLs, NO placeholder.com, NO unsplash.com, NO generic "Insurance Image" or "Team Image"
- If no images are provided, use CSS gradients and styling for visual appeal

Requirements:
1. Generate 3 separate files: HTML, CSS, and JavaScript
2. Create a modern, responsive insurance website
3. Include sections: Hero, About, Services, Contact
4. Use professional color scheme (blues, whites, grays)
5. Include insurance services: Auto, Home, Life, Business Insurance
6. Use CSS styling, gradients, and colors for visual appeal instead of placeholder images
7. Make it mobile-first responsive
8. IMPORTANT: Only include img tags for files that are provided above
9. If logo is provided, use it in the header navigation
10. If office photos are provided, use them in the About section at different places
11. Use modern CSS Grid/Flexbox layouts
12. In contact section, dont put a form and just put the details to contact the person 
13. Add smooth scrolling and interactive elements
14. Use CSS gradients and styling in hero section instead of placeholder images

Please provide the code in this exact format:
\`\`\`html
[HTML content here]
\`\`\`

\`\`\`css
[CSS content here]
\`\`\`

\`\`\`javascript
[JavaScript content here]
\`\`\`

Make it look professional and trustworthy for an insurance business.`;

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Using the latest model
      contents: prompt,
    });

    const generatedContent = response.text;
    console.log('Gemini response received, parsing content...');

    // Parse the generated content to extract HTML, CSS, and JS
    const htmlMatch = generatedContent?.match(/```html\n([\s\S]*?)\n```/);
    const cssMatch = generatedContent?.match(/```css\n([\s\S]*?)\n```/);
    const jsMatch = generatedContent?.match(/```javascript\n([\s\S]*?)\n```/);

    const files: GeneratedWebsiteFiles = {
      'index.html': htmlMatch ? htmlMatch[1] : generateFallbackHTML(agentData),
      'style.css': cssMatch ? cssMatch[1] : generateFallbackCSS(),
      'script.js': jsMatch ? jsMatch[1] : generateFallbackJS()
    };

    console.log('Website files generated successfully with Gemini AI');
    return files;

  } catch (error) {
    console.error('Error generating website with Gemini:', error);
    console.log('Falling back to template generation...');
    
    // Fallback to template-based generation
    return {
      'index.html': generateFallbackHTML(agentData),
      'style.css': generateFallbackCSS(),
      'script.js': generateFallbackJS()
    };
  }
}

// Fallback HTML template
function generateFallbackHTML(agentData: InsuranceAgentData): string {
  const logoSection = agentData.logoFileName ? 
    `<img src="${agentData.logoFileName}" alt="${agentData.businessName} Logo" style="height: 40px; margin-right: 10px;">` : '';
  
  const officePhotosSection = agentData.officePhotoFileNames && agentData.officePhotoFileNames.length > 0 ? 
    agentData.officePhotoFileNames.map((photo, index) => 
      `<img src="${photo}" alt="Office Photo ${index + 1}" style="width: 300px; height: 200px; object-fit: cover; margin: 10px; border-radius: 8px;">`
    ).join('') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${agentData.businessName} - Insurance Services</title>
      <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    ${logoSection}
                    <h2>${agentData.businessName}</h2>
                </div>
                <ul class="nav-menu">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="hero-content">
                <h1>Protecting What Matters Most</h1>
                <p>Professional insurance services by ${agentData.agentName}</p>
                <button class="cta-button">Get a Quote</button>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2>About ${agentData.agentName}</h2>
                <p>Your trusted insurance professional serving the community with comprehensive coverage solutions.</p>
                ${officePhotosSection ? `<div class="office-photos">${officePhotosSection}</div>` : ''}
            </div>
        </section>

        <section id="services" class="services">
            <div class="container">
                <h2>Our Services</h2>
                <div class="services-grid">
                    <div class="service-card">
                        <h3>Auto Insurance</h3>
                        <p>Comprehensive coverage for your vehicle</p>
                    </div>
                    <div class="service-card">
                        <h3>Home Insurance</h3>
                        <p>Protect your home and belongings</p>
                    </div>
                    <div class="service-card">
                        <h3>Life Insurance</h3>
                        <p>Secure your family's future</p>
                    </div>
                    <div class="service-card">
                        <h3>Business Insurance</h3>
                        <p>Coverage for your business needs</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2>Contact Us</h2>
                <div class="contact-info">
                    <div class="contact-item">
                        <h3>Address</h3>
                        <p>${agentData.address}</p>
                    </div>
                    <div class="contact-item">
                        <h3>Phone</h3>
                        <p>${agentData.contactNumber}</p>
                    </div>
                    <div class="contact-item">
                        <h3>Email</h3>
                        <p>${agentData.email}</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 ${agentData.businessName}. All rights reserved.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
}

// Fallback CSS template
function generateFallbackCSS(): string {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navigation */
.navbar {
    background: #2c3e50;
    color: white;
    padding: 1rem 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    color: white;
    text-decoration: none;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #3498db;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 150px 0 100px;
    text-align: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.cta-button {
    background: #e74c3c;
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 5px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s;
}

.cta-button:hover {
    background: #c0392b;
}

/* Sections */
section {
    padding: 80px 0;
}

.about {
    background: #f8f9fa;
}

.services {
    background: white;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.service-card {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
    transition: transform 0.3s;
}

.service-card:hover {
    transform: translateY(-5px);
}

.contact {
    background: #2c3e50;
    color: white;
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.contact-form {
    max-width: 600px;
    margin: 0 auto;
}

.contact-form input,
.contact-form textarea {
    width: 100%;
    padding: 15px;
    margin-bottom: 1rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
}

.contact-form button {
    background: #3498db;
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background 0.3s;
}

.contact-form button:hover {
    background: #2980b9;
}

footer {
    background: #1a252f;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-menu {
        flex-direction: column;
        gap: 1rem;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
    
    .services-grid {
        grid-template-columns: 1fr;
    }
}`;
}

// Fallback JavaScript template
function generateFallbackJS(): string {
  return `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form handling
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate form submission
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(44, 62, 80, 0.95)';
    } else {
        navbar.style.background = '#2c3e50';
    }
});

// Animate service cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});`;
}
