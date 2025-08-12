'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, AlertTriangle, Globe, Scale, FileText, Users, Calendar, DollarSign } from 'lucide-react'
import countriesData from "../../utils/country-info.json"


interface CountryInfo {
  e_signature_valid: boolean;
  language_required: string;
  notes: string;
}

export default function ContractsInformation() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const countryNames: string[] = Object.keys(countriesData);
  const countriesMap: Map<string, CountryInfo> = new Map(Object.entries(countriesData));
  const selectedCountryInfo = countriesMap.get(selectedCountry) || null;

  const legalElements = [
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      title: "Parties",
      description: "Clear identification of all parties involved (names, addresses, roles)"
    },
    {
      icon: <FileText className="h-5 w-5 text-green-600" />,
      title: "Scope of Work",
      description: "Detailed description of services, deliverables, and expectations"
    },
    {
      icon: <DollarSign className="h-5 w-5 text-yellow-600" />,
      title: "Payment Terms",
      description: "Amount, payment schedule, late fees, and accepted payment methods"
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      title: "Timeline",
      description: "Start date, deadlines, milestones, and termination conditions"
    }
  ];

  const goodContractExample = `
FREELANCE SERVICE AGREEMENT

1. PARTIES
Client: ABC Corporation, 123 Business St, City, State 12345
Freelancer: John Doe, 456 Work Ave, City, State 67890

2. SCOPE OF WORK
- Design and develop a responsive website with 5 pages
- Include contact form and basic SEO optimization
- Provide 2 rounds of revisions
- Deliver source files and documentation

3. PAYMENT TERMS
- Total: $5,000 USD
- 50% upfront ($2,500)
- 50% upon completion ($2,500)
- Payment due within 15 days of invoice
- Late fee: 1.5% per month on overdue amounts

4. TIMELINE
- Start Date: January 1, 2024
- First Draft: January 15, 2024
- Final Delivery: February 1, 2024
- Either party may terminate with 7 days written notice

5. INTELLECTUAL PROPERTY
All work product becomes property of Client upon full payment.

6. SIGNATURES
Both parties sign and date the agreement.`;

  const badContractExample = `
Work Agreement

We'll build you a website. It will be good.

Payment: Some money upfront, rest later.

Timeline: Sometime soon.

If you don't like it, we'll fix it.

Thanks!`;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Contract Legal Guide
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about creating legally binding contracts for your freelance business
        </p>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Legal Basics</TabsTrigger>
          <TabsTrigger value="elements">Key Elements</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="country">Country Info</TabsTrigger>
        </TabsList>

        {/* Legal Basics Tab */}
        <TabsContent value="basics" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-blue-600" />
                What Makes a Contract Legally Binding?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Essential Requirements
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Offer:</strong> One party proposes specific terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Acceptance:</strong> The other party agrees to those terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Consideration:</strong> Something of value is exchanged (money, services)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Capacity:</strong> Both parties are legally able to enter contracts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Legality:</strong> The contract purpose must be legal</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-700 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    What Invalidates Contracts
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fraud or misrepresentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Duress or undue influence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Impossibility of performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Illegal activities or purposes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Lack of mental capacity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute legal advice. 
              Always consult with a qualified attorney for specific legal questions about your contracts.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Key Elements Tab */}
        <TabsContent value="elements" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {legalElements.map((element, index) => (
              <Card key={index} className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {element.icon}
                    {element.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{element.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Additional Important Clauses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">Recommended Clauses</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Intellectual property ownership</li>
                    <li>• Confidentiality and non-disclosure</li>
                    <li>• Termination conditions</li>
                    <li>• Dispute resolution process</li>
                    <li>• Force majeure (unforeseeable circumstances)</li>
                    <li>• Governing law and jurisdiction</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-700">For Freelancers</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Kill fee for cancelled projects</li>
                    <li>• Revision limits and additional fees</li>
                    <li>• Client responsibility for delays</li>
                    <li>• Portfolio and credit rights</li>
                    <li>• Independent contractor status</li>
                    <li>• Expense reimbursement terms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Good Contract Example */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-6 w-6" />
                  Good Contract Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-white p-4 rounded border overflow-x-auto whitespace-pre-wrap">
                  {goodContractExample}
                </pre>
                <div className="mt-4">
                  <h4 className="font-semibold text-green-700 mb-2">Why This Works:</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ Clear parties identification</li>
                    <li>✓ Specific scope and deliverables</li>
                    <li>✓ Detailed payment terms</li>
                    <li>✓ Realistic timeline with milestones</li>
                    <li>✓ IP ownership clarification</li>
                    <li>✓ Proper signatures</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Bad Contract Example */}
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-6 w-6" />
                  Poor Contract Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-white p-4 rounded border overflow-x-auto whitespace-pre-wrap">
                  {badContractExample}
                </pre>
                <div className="mt-4">
                  <h4 className="font-semibold text-red-700 mb-2">Problems:</h4>
                  <ul className="text-sm space-y-1">
                    <li>✗ Vague scope ("good website")</li>
                    <li>✗ No specific payment amounts</li>
                    <li>✗ No clear timeline</li>
                    <li>✗ Missing party details</li>
                    <li>✗ No termination terms</li>
                    <li>✗ Unprofessional language</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Country Information Tab */}
        <TabsContent value="country" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600" />
                Country-Specific Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country-select">Select a country to view specific requirements:</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger id="country-select" className="w-full md:w-96">
                      <SelectValue placeholder="Choose a country..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countryNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && selectedCountryInfo && (
                  <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-700">
                        {selectedCountry} - Contract Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Electronic Signature Validity:</h4>
                          <Badge variant={selectedCountryInfo.e_signature_valid ? "default" : "destructive"}>
                            {selectedCountryInfo.e_signature_valid ? "✓ Valid" : "✗ Not Valid"}
                          </Badge>
                          {!selectedCountryInfo.e_signature_valid && (
                            <p className="text-sm text-red-600 mt-1">
                              Physical signatures may be required for legal enforcement.
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Required Language(s):</h4>
                          <span className="text-blue-800 font-medium">
                            {selectedCountryInfo.language_required}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Additional Notes:</h4>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-gray-600">
                            {selectedCountryInfo.notes || "No additional notes available for this country."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedCountry && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a country above to view specific contract requirements and legal considerations.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
