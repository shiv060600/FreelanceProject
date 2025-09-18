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
