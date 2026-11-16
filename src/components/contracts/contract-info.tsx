'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { X, CheckCircle, XCircle, AlertTriangle, Globe, Scale, FileText, Users, Calendar, DollarSign, FileSignature } from 'lucide-react'
import { Button } from '@/components/ui/button'
import countriesData from "../../utils/country-info.json"
import { ScrollArea } from '@/components/ui/scroll-area'

interface CountryInfo {
  e_signature_valid: boolean;
  language_required: string;
  notes: string;
}

interface ContractInfoProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}

export default function ContractInfo({ open, setOpen }: ContractInfoProps) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const countryNames: string[] = Object.keys(countriesData);
  const countriesMap: Map<string, CountryInfo> = new Map(Object.entries(countriesData));
  const selectedCountryInfo = countriesMap.get(selectedCountry) || null;

  const legalElements = [
    {
      icon: <Users className="h-4 w-4 text-primary" />,
      title: "Parties",
      description: "Clear identification of all parties involved"
    },
    {
      icon: <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />,
      title: "Scope of Work",
      description: "Detailed description of services and deliverables"
    },
    {
      icon: <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
      title: "Payment Terms",
      description: "Amount, schedule, and payment methods"
    },
    {
      icon: <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      title: "Timeline",
      description: "Deadlines, milestones, and termination"
    }
  ];

  const goodContractExample = `FREELANCE SERVICE AGREEMENT

1. PARTIES
Client: ABC Corporation, 123 Business St
Freelancer: John Doe, 456 Work Ave

2. SCOPE OF WORK
- Design responsive website (5 pages)
- Include contact form and SEO
- 2 rounds of revisions

3. PAYMENT TERMS
- Total: $5,000 USD
- 50% upfront, 50% on completion
- Payment due within 15 days

4. TIMELINE
- Start: January 1, 2024
- Delivery: February 1, 2024
- Termination: 7 days notice`;

  const badContractExample = `Work Agreement

We'll build you a website. It will be good.

Payment: Some money upfront, rest later.

Timeline: Sometime soon.`;

  return (
    <div className={`w-[25%] flex flex-col h-screen sticky top-0 transition-all duration-500 ease-in-out ${
      open 
        ? 'opacity-100 translate-x-0' 
        : 'opacity-0 translate-x-full pointer-events-none'
    }`}>
      <div className="bg-gradient-to-br from-muted via-primary/5 to-purple-50/20 dark:to-purple-500/10 backdrop-blur-sm border-l border-border/60 shadow-lg flex flex-col h-full rounded-l-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contract Guide</h2>
          <p className="text-sm text-muted-foreground">Legal information & best practices</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="h-8 w-8 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto mb-4 bg-card/60 backdrop-blur-sm border border-border/50 gap-1 p-1">
              <TabsTrigger value="basics" className="text-xs py-2 px-3">Basics</TabsTrigger>
              <TabsTrigger value="binding" className="text-xs py-2 px-3">Legality</TabsTrigger>
              <TabsTrigger value="elements" className="text-xs py-2 px-3">Elements</TabsTrigger>
              <TabsTrigger value="examples" className="text-xs py-2 px-3">Examples</TabsTrigger>
              <TabsTrigger value="country" className="text-xs py-2 px-3">Country</TabsTrigger>
            </TabsList>

            {/* Legal Basics Tab */}
            <TabsContent value="basics" className="space-y-3">
              <Card className="bg-gradient-to-r from-primary/5 to-purple-50 dark:to-purple-500/10 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Scale className="h-5 w-5 text-primary" />
                    Legally Binding Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-green-700 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Essential Requirements
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Offer:</strong> Specific terms proposed</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Acceptance:</strong> Agreement to terms</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Consideration:</strong> Value exchanged</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Capacity:</strong> Legal ability to contract</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span><strong>Legality:</strong> Legal purpose required</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <h3 className="font-semibold text-sm text-red-700 dark:text-red-400 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Invalidates Contracts
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Fraud or misrepresentation</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Duress or undue influence</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>Illegal activities</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Alert className="text-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Disclaimer:</strong> Educational purposes only. Consult an attorney for legal advice.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Binding vs Non-Binding Tab */}
            <TabsContent value="binding" className="space-y-3">
              <Alert className="text-sm bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>Disclaimer:</strong> Educational info only, not legal advice. Consult an attorney for your situation.
                </AlertDescription>
              </Alert>

              <Card className="border-green-200 dark:border-green-500/30 bg-gradient-to-r from-green-50 dark:from-green-500/10 to-emerald-50 dark:to-emerald-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Binding Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-foreground/80">
                    Legally enforceable - parties can pursue legal action if terms aren't met.
                  </p>
                  <div>
                    <h4 className="font-semibold text-xs text-green-700 dark:text-green-400 mb-1">Required:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• Offer & Acceptance</li>
                      <li>• Consideration (value exchanged)</li>
                      <li>• Mutual Intent to be bound</li>
                      <li>• Legal purpose</li>
                      <li>• Capacity to contract</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-indigo-50 dark:to-indigo-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-primary">
                    <FileText className="h-4 w-4" />
                    Non-Binding Agreements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-foreground/80">
                    Preliminary discussions without legal obligations. Either party can walk away.
                  </p>
                  <div>
                    <h4 className="font-semibold text-xs text-primary mb-1">Characteristics:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• Missing binding elements</li>
                      <li>• Contains "non-binding" language</li>
                      <li>• Used for initial discussions</li>
                      <li>• No legal enforcement</li>
                    </ul>
                  </div>
                  <div className="bg-card p-2 rounded border text-xs">
                    <strong>Example:</strong> Letter of intent, MOU
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
                    <Users className="h-4 w-4" />
                    Verbal Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-foreground/80">
                    Can be binding BUT very difficult to prove. Always get it in writing!
                  </p>
                  <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded border border-red-200 dark:border-red-500/30">
                    <h4 className="font-semibold text-xs text-red-700 dark:text-red-400 mb-0.5">Why Written is Better:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• Hard to prove verbal terms</li>
                      <li>• Memories differ</li>
                      <li>• No documentation for disputes</li>
                      <li>• Some contracts must be written by law</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                    When Informal Becomes Binding
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="bg-orange-50 dark:bg-orange-500/10 p-2 rounded border">
                    <h4 className="font-semibold text-xs text-orange-700 dark:text-orange-400 mb-0.5">Watch Out For:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• Acceptance language</li>
                      <li>• Specific deadlines</li>
                      <li>• "Good faith" terms</li>
                      <li>• Value already exchanged</li>
                    </ul>
                  </div>
                  <div className="bg-primary/5 p-2 rounded border">
                    <h4 className="font-semibold text-xs text-primary mb-0.5">Keep It Non-Binding:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• Add "non-binding" language</li>
                      <li>• Note "subject to formal agreement"</li>
                      <li>• State "discussion purposes only"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 dark:border-indigo-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-400">
                    <FileSignature className="h-4 w-4" />
                    Electronic Signatures
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-foreground/80">
                    E-signatures are valid in many countries but check your jurisdiction.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 dark:bg-green-500/10 p-2 rounded border text-xs">
                      <div className="font-semibold text-green-700 dark:text-green-400 mb-0.5">✓ Usually OK:</div>
                      <div>Service contracts, NDAs, sales</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-500/10 p-2 rounded border text-xs">
                      <div className="font-semibold text-yellow-700 dark:text-yellow-400 mb-0.5">⚠️ May Need Physical:</div>
                      <div>Wills, court docs, some real estate</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground bg-card p-2 rounded border">
                    Check "Country" tab for e-signature validity by region
                  </p>
                </CardContent>
              </Card>

              <Alert className="text-sm bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-sm text-red-800 dark:text-red-400">
                  <strong>Legal Disclaimer:</strong> FreelanceFlow provides tools but is not a law firm. This is educational information only. 
                  Consult a licensed attorney in your jurisdiction for legal advice.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Key Elements Tab */}
            <TabsContent value="elements" className="space-y-3 mt-0">
              <div className="space-y-3">
                {legalElements.map((element, index) => (
                  <Card key={index} className="bg-gradient-to-r from-primary/5 to-purple-50 dark:to-purple-500/10 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {element.icon}
                        {element.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{element.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Additional Clauses</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm text-primary mb-1">Recommended:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• IP ownership</li>
                      <li>• Confidentiality</li>
                      <li>• Termination terms</li>
                      <li>• Dispute resolution</li>
                      <li>• Governing law</li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">For Freelancers:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>• Kill fees</li>
                      <li>• Revision limits</li>
                      <li>• Portfolio rights</li>
                      <li>• Contractor status</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-3 mt-0">
              <Card className="border-green-200 dark:border-green-500/30 bg-gradient-to-r from-green-50 dark:from-green-500/10 to-emerald-50 dark:to-emerald-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Good Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="text-xs bg-card p-3 rounded border overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {goodContractExample}
                  </pre>
                  <div className="mt-2">
                    <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-1">Why This Works:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>✓ Clear parties</li>
                      <li>✓ Specific scope</li>
                      <li>✓ Payment terms</li>
                      <li>✓ Timeline</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-500/30 bg-gradient-to-r from-red-50 dark:from-red-500/10 to-pink-50 dark:to-pink-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <XCircle className="h-4 w-4" />
                    Poor Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="text-xs bg-card p-3 rounded border overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {badContractExample}
                  </pre>
                  <div className="mt-2">
                    <h4 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-1">Problems:</h4>
                    <ul className="text-sm space-y-0.5">
                      <li>✗ Vague scope</li>
                      <li>✗ No payment amounts</li>
                      <li>✗ No timeline</li>
                      <li>✗ Missing details</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Country Information Tab */}
            <TabsContent value="country" className="space-y-3 mt-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-5 w-5 text-primary" />
                    Country Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <Label htmlFor="country-select" className="text-sm">Select Country:</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country-select" className="w-full h-10 text-sm mt-1">
                        <SelectValue placeholder="Choose country..." />
                      </SelectTrigger>
                      <SelectContent>
                        {countryNames.map((name) => (
                          <SelectItem key={name} value={name} className="text-sm">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCountry && selectedCountryInfo && (
                    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50 dark:to-purple-500/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-primary">
                          {selectedCountry}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground/80 mb-1">E-Signature:</h4>
                          <Badge variant={selectedCountryInfo.e_signature_valid ? "default" : "destructive"} className="text-sm">
                            {selectedCountryInfo.e_signature_valid ? "✓ Valid" : "✗ Not Valid"}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground/80 mb-1">Language:</h4>
                          <span className="text-sm text-primary font-medium">
                            {selectedCountryInfo.language_required}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground/80 mb-1">Notes:</h4>
                          <div className="bg-card p-3 rounded border text-sm max-h-24 overflow-y-auto">
                            <p className="text-muted-foreground">
                              {selectedCountryInfo.notes || "No additional notes."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!selectedCountry && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a country to view requirements</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      </div>
    </div>
  );
}
