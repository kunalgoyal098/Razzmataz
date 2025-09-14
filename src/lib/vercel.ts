// Vercel API Integration for Website Deployment

interface DeploymentFiles {
  [filename: string]: string;
}

interface VercelDeploymentResponse {
  url: string;
  deploymentId: string;
}

export async function deployToVercel(
  files: DeploymentFiles,
  projectName: string
): Promise<VercelDeploymentResponse> {
  const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token not found. Please add NEXT_PUBLIC_VERCEL_TOKEN to your environment variables.');
  }

  // Sanitize project name for Vercel
  const sanitizedProjectName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63);

  try {
    // Use inline deployment method with proper base64 encoding
    console.log('Creating deployment with inline files...');
    
    const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: sanitizedProjectName,
        files: Object.entries(files).map(([filename, content]) => {
          // Check if this is an image file (already base64) or text file
          const isImageFile = filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
          
          if (isImageFile) {
            // Image files are already base64 encoded
            return {
              file: filename,
              data: content, // Already base64
              encoding: 'base64'
            };
          } else {
            // Text files (HTML, CSS, JS) need to be converted to base64
            return {
              file: filename,
              data: Buffer.from(content, 'utf8').toString('base64'),
              encoding: 'base64'
            };
          }
        }),
        projectSettings: {
          framework: null,
          buildCommand: null,
          outputDirectory: null,
          installCommand: null,
          devCommand: null
        },
        target: 'production'
      })
    });

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json();
      throw new Error(`Vercel deployment failed: ${errorData.error?.message || deploymentResponse.statusText}`);
    }

    const deploymentData = await deploymentResponse.json();
    
    // Wait for deployment to be fully ready and get the public domain
    console.log('Waiting for deployment to be ready... This may take up to 2 minutes.');
    let attempts = 0;
    const maxAttempts = 20; // Increased from 10 to 20
    const waitTime = 6000; // Increased from 3000ms to 6000ms (6 seconds)
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Checking deployment status... (attempt ${attempts + 1}/${maxAttempts})`);
        
        const statusResponse = await fetch(`https://api.vercel.com/v13/deployments/${deploymentData.id}`, {
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          }
        });
        
        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          console.log('Status check error:', errorData);
          throw new Error(`Status check failed: ${errorData.error?.message || statusResponse.statusText}`);
        }
        
        const status = await statusResponse.json();
        console.log(`Deployment status: ${status.readyState} (${new Date().toLocaleTimeString()})`);
        
        if (status.readyState === 'READY') {
          console.log('✅ Deployment is ready! Fetching public domain...');
          
          // Wait a bit more for domain assignment
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Try to get the project to find the public domain
          try {
            const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${sanitizedProjectName}`, {
              headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
              }
            });
            
            if (projectResponse.ok) {
              const project = await projectResponse.json();
              console.log('Project data:', {
                name: project.name,
                alias: project.alias,
                targets: project.targets
              });
              
              // Look for the shortest domain (usually the public one)
              if (project.alias && project.alias.length > 0) {
                const shortestDomain = project.alias.reduce((shortest: { domain: string }, current: { domain: string }) => 
                  current.domain.length < shortest.domain.length ? current : shortest
                );
                
                const publicUrl = `https://${shortestDomain.domain}`;
                console.log('✅ Found public project URL:', publicUrl);
                return {
                  url: publicUrl,
                  deploymentId: deploymentData.id
                };
              } else {
                console.log('⚠️ No project aliases found yet, checking deployment aliases...');
                
                // Check deployment aliases as backup
                if (status.alias && status.alias.length > 0) {
                  const shortestAlias = status.alias.reduce((shortest: string, current: string) => 
                    current.length < shortest.length ? current : shortest
                  );
                  
                  const publicUrl = `https://${shortestAlias}`;
                  console.log('✅ Using deployment alias:', publicUrl);
                  return {
                    url: publicUrl,
                    deploymentId: deploymentData.id
                  };
                }
              }
            } else {
              const projectError = await projectResponse.json();
              console.log('Project fetch error:', projectError);
            }
          } catch (projectError) {
            console.log('Could not fetch project details:', projectError);
          }
          
          // If no project domain found, use the deployment URL
          console.log('⚠️ No public domain found, will use deployment URL');
          break;
          
        } else if (status.readyState === 'ERROR') {
          console.log('❌ Deployment failed with error state');
          throw new Error('Deployment failed with ERROR state');
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Waiting ${waitTime/1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        console.log('Error checking deployment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Retrying in ${waitTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log('⚠️ Max attempts reached, using deployment URL as fallback');
    }
    
    // Fallback to deployment URL
    const deploymentUrl = `https://${deploymentData.url}`;
    console.log('Using deployment URL:', deploymentUrl);
    
    return {
      url: deploymentUrl,
      deploymentId: deploymentData.id
    };
    
  } catch (error) {
    console.error('Error deploying to Vercel:', error);
    throw error;
  }
}

// Alternative method using Vercel's file upload API
export async function deployWithFileUpload(
  files: DeploymentFiles,
  projectName: string
): Promise<VercelDeploymentResponse> {
  const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token not found');
  }

  const sanitizedProjectName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63);

  try {
    // Step 1: Upload files
    const uploadedFiles = [];
    
    for (const [filename, content] of Object.entries(files)) {
      const uploadResponse = await fetch('https://api.vercel.com/v2/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'x-vercel-filename': filename,
        },
        body: content
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${filename}`);
      }

      const uploadData = await uploadResponse.json();
      uploadedFiles.push({
        file: filename,
        sha: uploadData.sha,
        size: uploadData.size
      });
    }

    // Step 2: Create deployment with uploaded files
    const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: sanitizedProjectName,
        files: uploadedFiles,
        target: 'production'
      })
    });

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json();
      throw new Error(`Deployment failed: ${errorData.error?.message || deploymentResponse.statusText}`);
    }

    const deploymentData = await deploymentResponse.json();
    
    return {
      url: `https://${deploymentData.url}`,
      deploymentId: deploymentData.id
    };
    
  } catch (error) {
    console.error('Error with file upload deployment:', error);
    throw error;
  }
}

// Check deployment status
export async function checkDeploymentStatus(deploymentId: string): Promise<string> {
  const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token not found');
  }

  try {
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check deployment status');
    }

    const data = await response.json();
    return data.readyState; // BUILDING, READY, ERROR, etc.
    
  } catch (error) {
    console.error('Error checking deployment status:', error);
    throw error;
  }
}
