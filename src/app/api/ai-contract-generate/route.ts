import { NextRequest,NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from '../../../../supabase/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const openAi = new OpenAI({apiKey : OPENAI_API_KEY})

 // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    export async function OPTIONS(request: NextRequest) {
        return NextResponse.json({}, { headers: corsHeaders });
    }


export async function POST(request: NextRequest){
    // Check OpenAI API key configuration
    if(!OPENAI_API_KEY){
        console.error('OpenAI API key not found in environment variables');
        return NextResponse.json(
            {message : 'OpenAI API key not found'},
            {status: 500}
        )
    }

    // Authenticate user using Supabase session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            {message: 'Authentication required. Please sign in to continue.'},
            {status: 401, headers: corsHeaders}
        )
    } 
    try {
        const body = await request.json();
        const { title, contractType, clientName, prompt, clientCompany } = body;

        // Validate required fields
        if (!title || !contractType || !clientName || !prompt) {
            console.error('Missing required fields:', { title, contractType, clientName, prompt: !!prompt });
            return NextResponse.json(
                {message: 'Missing required fields: title, contractType, clientName, and prompt are required'},
                {status: 400,headers : corsHeaders}
            );
        }

        console.log('Generating contract with params:', { title, contractType, clientName, promptLength: prompt.length });

        const response = await openAi.chat.completions.create({
            model:'gpt-4',
            messages : [
                {
                    role: 'system',
                    content: `You are an expert legal contract writer. Generate a comprehensive, professional legal contract with proper formatting and all necessary legal clauses. 

CRITICAL: This contract is for digital use only - DO NOT include any signature sections, signature lines, date fields, or manual completion areas.

FORMATTING REQUIREMENTS:
- Use clear section numbering (1., 1.1, 1.2, etc.)
- Include proper legal headings and subheadings
- Use formal legal language
- Include standard legal clauses (governing law, dispute resolution, etc.)
- Format as complete legal document content
- Use proper spacing and structure

ABSOLUTELY FORBIDDEN - DO NOT INCLUDE:
- Signature lines or signature blocks
- Date fields or "Date: ____" sections
- Any blank lines like "______" or "___________"
- "Signed by:" sections
- "Party A Signature:" or "Party B Signature:" fields
- Any placeholder fields requiring manual completion
- Witness signature areas
- Notary sections

The contract should be a complete, self-contained legal document that needs no additional completion.`
                },
                {
                    role: 'user',
                    content: `Generate a ${contractType} contract with the title "${title}" for client "${clientName}"${clientCompany ? ` who works at company ${clientCompany}` : ''}.

Contract Requirements: ${prompt}

Please ensure the contract includes:
- Proper legal formatting with numbered sections
- All parties clearly identified with specific names and details
- Detailed terms and conditions
- Payment/compensation clauses
- Termination conditions
- Dispute resolution
- Governing law
- Complete legal content ready for PDF generation

CRITICAL REMINDER: This is a DIGITAL CONTRACT ONLY. Do NOT include:
❌ Signature blocks or signature lines
❌ Date fields or "Date: ____" sections  
❌ Any "______" blank lines or fill-in spaces
❌ "Signed by:" sections
❌ Witness or notary sections
❌ Any manual completion areas

The contract should END with the final legal clause (like governing law or entire agreement clause) and nothing more. No signature areas whatsoever.

Make this a complete, professional legal contract that is ready for immediate digital use.`
                }
            ],
            max_completion_tokens : 3000,
            temperature : 0.2
        });

        if (!response.choices || !response.choices[0] || !response.choices[0].message?.content) {
            console.error('Invalid response from OpenAI:', response);
            return NextResponse.json(
                {message: 'Invalid response from AI service'},
                {status: 500, headers: corsHeaders}
            );
        }

        const generatedContract = response.choices[0].message.content;

        console.log('Contract generated successfully, length:', generatedContract.length);

        return NextResponse.json(
            {
                contract : generatedContract,
                success : true
            },
            {status: 200,headers : corsHeaders}
        );

    }
    catch(error: any){
        console.error('Error generating contract:', {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
            cause: error?.cause
        });
        
        // Return a safe error message without exposing internal details
        const errorMessage = error?.message || 'Failed to generate contract';
        
        return NextResponse.json(
            {
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error?.message : undefined
            },
            {status : 500, headers: corsHeaders}
        );
    }

}
