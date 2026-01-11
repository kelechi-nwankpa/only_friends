'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Gift, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const occasions = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'valentines', label: "Valentine's Day" },
  { value: 'mothers_day', label: "Mother's Day" },
  { value: 'fathers_day', label: "Father's Day" },
  { value: 'other', label: 'Other' },
];

interface Suggestion {
  name: string;
  description: string;
  priceRange: string;
  reason: string;
}

export default function AISuggestionsPage() {
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestions = async () => {
    setIsLoading(true);

    // Simulate AI response for now
    // In production, this would call the backend AI endpoint
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockSuggestions: Suggestion[] = [
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium audio experience for music lovers',
        priceRange: '$100-$300',
        reason: 'Great for someone who enjoys music or works from home',
      },
      {
        name: 'Artisan Coffee Subscription',
        description: 'Monthly delivery of specialty coffee from around the world',
        priceRange: '$15-$30/month',
        reason: 'Perfect for coffee enthusiasts who love trying new flavors',
      },
      {
        name: 'Smart Home Starter Kit',
        description: 'Voice-controlled lights, plugs, and speaker bundle',
        priceRange: '$100-$200',
        reason: 'Ideal for tech-savvy individuals looking to upgrade their home',
      },
      {
        name: 'Personalized Star Map',
        description: 'Custom poster showing the night sky from a special date and location',
        priceRange: '$30-$80',
        reason: 'Meaningful gift to commemorate a special moment',
      },
      {
        name: 'Experience Gift Card',
        description: 'Cooking class, spa day, or adventure experience',
        priceRange: '$50-$200',
        reason: 'Creates lasting memories instead of adding more stuff',
      },
    ];

    setSuggestions(mockSuggestions);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Gift Suggestions
        </h1>
        <p className="text-muted-foreground">
          Get personalized gift ideas powered by AI. Tell us about the recipient and we&apos;ll suggest perfect gifts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Gift Finder</CardTitle>
            <CardDescription>
              Enter details about the person you&apos;re shopping for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Name</Label>
              <Input
                id="recipient"
                placeholder="e.g., Mom, John, etc."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((occ) => (
                    <SelectItem key={occ.value} value={occ.value}>
                      {occ.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Max budget in $"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests & Hobbies</Label>
              <Input
                id="interests"
                placeholder="e.g., cooking, gaming, reading..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple interests with commas
              </p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleGetSuggestions}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding gifts...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {suggestions.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold">
                Gift Ideas {recipientName && `for ${recipientName}`}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((suggestion, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{suggestion.name}</CardTitle>
                        <Badge variant="secondary">{suggestion.priceRange}</Badge>
                      </div>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Why this gift: </span>
                        {suggestion.reason}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Search Online
                        </Button>
                        <Button size="sm" className="gap-1">
                          <Gift className="h-3 w-3" />
                          Add to List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Fill out the form and click &quot;Get Suggestions&quot; to receive AI-powered gift recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
