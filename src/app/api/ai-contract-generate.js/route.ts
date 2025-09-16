import { NextRequest,NextResponse } from "next/server";
import OpenAI from "openai";
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY
const openAi = new OpenAI({apiKey : OPEN_AI_API_KEY})


export async function GET(request: NextRequest){
    if(!OPEN_AI_API_KEY){
        return NextResponse.json(
            {message : 'Open AI API key not found'},
            {status: 500}
        )
    }
    try {
        const { title, contractType, clientName, prompt} = await request.json()

        const response = await openAi.chat.completions.create({
            model:'gpt-4',
            messages : [
                {
                    role: 'system',
                    content: `You are an expert legal contract writer. Generate a comprehensive, professional legal contract with proper formatting, section numbering, and all necessary legal clauses. 

FORMATTING REQUIREMENTS:
- Use clear section numbering (1., 1.1, 1.2, etc.)
- Include proper legal headings and subheadings
- Add signature lines at the end
- Use formal legal language
- Include standard legal clauses (governing law, dispute resolution, etc.)
- Format as a complete, ready-to-use legal document
- Include proper spacing and structure

The contract should be legally sound and comprehensive for the specified contract type.`
                },
                {
                    role: 'user',
                    content: `Generate a ${contractType} contract with the title "${title}" for client "${clientName}".

Contract Requirements: ${prompt}

Please ensure the contract includes:
- Proper legal formatting with numbered sections
- All parties clearly identified
- Detailed terms and conditions
- Payment/compensation clauses
- Termination conditions
- Dispute resolution
- Governing law
- Signature blocks
- Date fields

Make this a complete, professional legal contract that could be used in a real business situation.`
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
