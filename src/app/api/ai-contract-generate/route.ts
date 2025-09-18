import { NextRequest,NextResponse } from "next/server";
import OpenAI from "openai";
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY
const openAi = new OpenAI({apiKey : OPEN_AI_API_KEY})


export async function POST(request: NextRequest){
    if(!OPEN_AI_API_KEY){
        return NextResponse.json(
            {message : 'Open AI API key not found'},
            {status: 500}
        )
    }
    try {
        const { title, contractType, clientName, prompt, clientCompany} = await request.json()

        const response = await openAi.chat.completions.create({
            model:'gpt-4',
            messages : [
                {
                    role: 'system',
                    content: `You are an expert legal contract writer. Generate a comprehensive, professional legal contract with proper formatting and all necessary legal clauses. 

FORMATTING REQUIREMENTS:
- Use clear section numbering (1., 1.1, 1.2, etc.)
- Include proper legal headings and subheadings
- Use formal legal language
- Include standard legal clauses (governing law, dispute resolution, etc.)
- Format as complete legal document content
- Use proper spacing and structure
- NO signature lines, date fields, or blank fill-in spaces
- NO empty lines like "______" or placeholder fields
- Include specific company names, addresses, and details as provided

The contract should be legally sound, comprehensive, and ready for PDF generation without any manual fill-ins required.`
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

IMPORTANT: Do NOT include signature blocks, date fields, or any blank fill-in spaces like "______". The contract should be complete legal content without requiring any manual completion. All names, companies, and details should be filled in based on the provided information.

Make this a complete, professional legal contract with all content populated and ready for immediate use.`
                }
            ],
            max_completion_tokens : 3000,
            temperature : 0.2
        });

        const generatedContract = response.choices[0].message.content;

        return NextResponse.json(
            {
                contract : generatedContract,
                success : true
            },
            {status: 200}
        );

    }
    catch(error){
        console.error(`error occured ${error}`)
        return NextResponse.json(
            {
                message: 'Failed to generate contract',
                error: error

            },
            {status : 500}
        );
    }

}
