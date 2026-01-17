'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Globe, Scale, FileText, Users, Calendar, DollarSign, FileSignature, CheckCircle } from 'lucide-react'
import countriesData from "../../utils/country-info.json"
import { useAiContractGenerate } from '@/hooks/use-ai-contract-generate'
import { Progress } from '@/components/ui/progress'

interface CountryInfo {
  e_signature_valid: boolean
  language_required: string
  notes: string
}

export default function ContractsInformation() {
  const [selectedCountry, setSelectedCountry] = useState('')
  const countryNames: string[] = Object.keys(countriesData)
  const countriesMap: Map<string, CountryInfo> = new Map(Object.entries(countriesData))
  const selectedCountryInfo = countriesMap.get(selectedCountry) || null
  const { loading, progress } = useAiContractGenerate()

  const elements = [
    { icon: <Users className="h-4 w-4" />, title: 'Parties', description: 'Clear identification of all parties involved' },
    { icon: <FileText className="h-4 w-4" />, title: 'Scope of Work', description: 'Detailed description of services and deliverables' },
    { icon: <DollarSign className="h-4 w-4" />, title: 'Payment Terms', description: 'Amount, schedule, and payment methods' },
    { icon: <Calendar className="h-4 w-4" />, title: 'Timeline', description: 'Deadlines, milestones, and termination' }
  ]

  const message = 'Educational resources about contracts for freelancers - Learn about binding vs non-binding agreements, key elements, and best practices'
  const goodExample = `
    FREELANCE SERVICE AGREEMENT
    
    1. PARTIES
    Client: XYZ Corp
    Freelancer: Jane Doe
    
    2. SCOPE OF WORK
    - Design and develop a website
    - 2 revisions
    
    3. PAYMENT TERMS
    - Total: $3,000 USD
    - 50% upfront
    - 50% on completion
    
    4. TIMELINE
    - Start: Jan 1st
    - Delivery: Jan 31st
    
    5. SIGNATURES
    - Both parties sign
  `

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Contract Information</h1>
        <p className="text-lg text-muted-foreground">{message}</p>
        <Alert className="max-w-3xl mx-auto bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 text-sm">Educational resources about contracts for freelancers. This guide is not legal advice.</AlertDescription>
        </Alert>
        {loading && (
          <Card className="max-w-3xl mx-auto mt-4">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generating contract...</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basics">Legal Basics</TabsTrigger>
          <TabsTrigger value="binding">Binding vs Non-Binding</TabsTrigger>
          <TabsTrigger value="elements">Key Elements</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="country">Country</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6"> 
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                What Makes a Contract Legally Binding?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Essential requirements include offer, acceptance, consideration, mutual intent, and legality.</p>
            </CardContent>
          </Card>
          <div className="text-sm text-muted-foreground">{goodExample}</div>
        </TabsContent>

        <TabsContent value="binding" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="h-4 w-4" /> Binding Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Binding contracts are legally enforceable agreements. </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {elements.map((e, i) => (
              <Card key={i} className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {e.icon}
                    {e.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{e.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" /> Good Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-white p-3 rounded border">{goodExample}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="country" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Country Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="country-select">Select Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countryNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCountry && selectedCountryInfo && (
                <div className="mt-4 p-3 border rounded bg-white">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <FileSignature className="h-4 w-4" /> Electronic Signatures
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold text-gray-700">E-Signature:</div>
                      <Badge variant={selectedCountryInfo.e_signature_valid ? 'default' : 'destructive'}>
                        {selectedCountryInfo.e_signature_valid ? '✓ Valid' : '✗ Not Valid'}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Language:</div>
                      <span>{selectedCountryInfo.language_required}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">Notes: {selectedCountryInfo.notes || 'None'}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
