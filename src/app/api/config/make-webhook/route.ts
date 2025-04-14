import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File path for storing Make.com webhook URL
const configFilePath = path.join(process.cwd(), 'src/lib/config/make-webhook.json');

// Make sure the directory exists
const configDir = path.join(process.cwd(), 'src/lib/config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Initialize the file if it doesn't exist
if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(configFilePath, JSON.stringify({ webhookUrl: '' }), 'utf8');
}

// Get the current Make.com webhook URL
export async function GET() {
  try {
    const configData = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configData);
    
    return NextResponse.json({
      success: true,
      webhookUrl: config.webhookUrl
    });
  } catch (error) {
    console.error('Error reading Make.com webhook config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

// Update the Make.com webhook URL
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { webhookUrl } = data;
    
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'Webhook URL is required' },
        { status: 400 }
      );
    }
    
    // Save the webhook URL to the config file
    fs.writeFileSync(configFilePath, JSON.stringify({ webhookUrl }), 'utf8');
    
    return NextResponse.json({
      success: true,
      message: 'Make.com webhook URL saved successfully'
    });
  } catch (error) {
    console.error('Error saving Make.com webhook config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
