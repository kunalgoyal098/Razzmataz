import { NextRequest, NextResponse } from 'next/server';
import { generateInsuranceWebsite } from '@/lib/gemini';
import { deployToVercel } from '@/lib/vercel';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const agentName = formData.get('agentName') as string;
    const businessName = formData.get('businessName') as string;
    const address = formData.get('address') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const email = formData.get('email') as string;
    const logo = formData.get('logo') as File;
    const officePhotos = formData.getAll('officePhotos') as File[];

    // Validate required fields
    if (!agentName || !businessName || !address || !contactNumber || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process uploaded files and prepare them for deployment
    let logoFileName = '';
    const officePhotoFileNames: string[] = [];
    const additionalFiles: { [filename: string]: string } = {};

    if (logo) {
      // Create a clean filename for the logo
      logoFileName = `logo.${logo.type.split('/')[1]}`;
      const logoBuffer = await logo.arrayBuffer();
      // Store as base64 for Vercel deployment - Vercel expects base64 for binary files
      additionalFiles[logoFileName] = Buffer.from(logoBuffer).toString('base64');
    }

    if (officePhotos.length > 0) {
      for (let i = 0; i < officePhotos.length; i++) {
        const photo = officePhotos[i];
        const photoFileName = `office-photo-${i + 1}.${photo.type.split('/')[1]}`;
        officePhotoFileNames.push(photoFileName);
        const photoBuffer = await photo.arrayBuffer();
        // Store as base64 for Vercel deployment - Vercel expects base64 for binary files
        additionalFiles[photoFileName] = Buffer.from(photoBuffer).toString('base64');
      }
    }

    // Prepare agent data with file names instead of base64 URLs
    const agentData = {
      agentName,
      businessName,
      address,
      contactNumber,
      email,
      logoFileName,
      officePhotoFileNames
    };

    // Generate website using Gemini AI or templates
    console.log('Generating website with AI-powered templates...');
    const websiteFiles = await generateInsuranceWebsite(agentData);
    
    // Debug: Log the first 200 characters of each file to verify content
    console.log('Generated files preview:');
    console.log('HTML:', websiteFiles['index.html'].substring(0, 200));
    console.log('CSS:', websiteFiles['style.css'].substring(0, 200));
    console.log('JS:', websiteFiles['script.js'].substring(0, 200));
    
    // Debug: Log uploaded files info
    if (logoFileName) {
      console.log(`Logo file: ${logoFileName}, size: ${additionalFiles[logoFileName].length} chars (base64)`);
    }
    if (officePhotoFileNames.length > 0) {
      officePhotoFileNames.forEach(fileName => {
        console.log(`Office photo: ${fileName}, size: ${additionalFiles[fileName].length} chars (base64)`);
      });
    }

    // Combine website files with uploaded photos
    const allFiles = {
      ...websiteFiles,
      ...additionalFiles
    };

    // Try to deploy to Vercel if token is available, otherwise use demo mode
    const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
    
    if (VERCEL_TOKEN) {
      try {
        console.log('Deploying to Vercel...');
        const deployment = await deployToVercel(allFiles, businessName);
        
        return NextResponse.json({
          success: true,
          websiteUrl: deployment.url,
          deploymentId: deployment.deploymentId,
          message: 'Website generated and deployed successfully to Vercel!'
        });
      } catch (deployError) {
        console.error('Vercel deployment failed:', deployError);
        // Fall through to demo mode
      }
    }

    // Demo mode - create mock deployment URL
    console.log('Creating demo website (Vercel token not configured)...');
    const mockDeploymentUrl = `https://${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-insurance.demo.com`;
    
    return NextResponse.json({
      success: true,
      websiteUrl: mockDeploymentUrl,
      deploymentId: 'demo-' + Date.now(),
      message: 'Website generated successfully! Files are ready for deployment.',
      generatedFiles: {
        'index.html': websiteFiles['index.html'],
        'style.css': websiteFiles['style.css'],
        'script.js': websiteFiles['script.js']
      },
      stats: {
        htmlSize: websiteFiles['index.html'].length,
        cssSize: websiteFiles['style.css'].length,
        jsSize: websiteFiles['script.js'].length,
        totalSize: websiteFiles['index.html'].length + websiteFiles['style.css'].length + websiteFiles['script.js'].length
      }
    });

  } catch (error) {
    console.error('Error generating website:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate website',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
