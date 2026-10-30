import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

interface PlanRequestBody {
  eventName: string;
  eventType: string;
  totalGuests: number;
  budget: number;
  isStrictBudget: boolean;
  location: string;
  venueType: string;
  foodPreference: string;
  theme?: string;
  cakePreference?: {
    flavor: string;
    tiers: number;
    message?: string;
  };
  additionalNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PlanRequestBody = await req.json();

    const {
      eventName,
      eventType,
      totalGuests,
      budget,
      isStrictBudget,
      location,
      venueType,
      foodPreference,
      theme,
      cakePreference,
      additionalNotes,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is not present, use the deterministic fallback engine
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return NextResponse.json({
        source: 'deterministic-fallback',
        warning: 'Gemini API key is not configured. High-fidelity deterministic rules generated this plan.',
        ...generateDeterministicPlan(body),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
You are CelebrAI, an expert celebration and event architect.
Generate a structured, context-rich plan for the following event:

Event Name: ${eventName || 'Milestone Celebration'}
Event Type: ${eventType || 'Celebration'}
Total Guests: ${totalGuests || 50}
Budget: INR ${budget || 20000} (${isStrictBudget ? 'STRICT budget ceiling' : 'Flexible budget'})
Location: ${location || 'India'}
Venue Preference: ${venueType || 'indoor'}
Food Preference: ${foodPreference || 'vegetarian'}
Theme Preference: ${theme || 'Festive & Elegant'}
Cake Flavor & Details: ${cakePreference?.flavor || 'Chocolate'} (${cakePreference?.tiers || 1} tier(s), Message: "${cakePreference?.message || ''}")
Additional Notes: ${additionalNotes || 'None'}

Provide:
1. 3 distinct, creative theme concepts with color palettes and tangible decor ideas.
2. Menu suggestions respecting the "${foodPreference}" preference with realistic portions.
3. Cake weight and design recommendations based on ${totalGuests} guests (approx. 60g-70g per guest).
4. 3 personalized invitation drafts (Warm & Festive, Formal, Playful).
5. A realistic schedule outline for the celebration.
6. 4 practical, actionable cost-saving tips tailored to staying within INR ${budget}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are CelebrAI, an expert event planner. Always return practical, culturally respectful, and realistic celebration recommendations in JSON format conforming strictly to the requested schema. Never invent unverified market guarantees.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  colorPalette: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  decorIdeas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'description', 'colorPalette', 'decorIdeas'],
              },
            },
            menuSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  course: { type: Type.STRING },
                  name: { type: Type.STRING },
                  dietary: { type: Type.STRING },
                  suggestedPortionPerPerson: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ['course', 'name', 'dietary', 'suggestedPortionPerPerson'],
              },
            },
            cakeRecommendation: {
              type: Type.OBJECT,
              properties: {
                recommendedWeightKg: { type: Type.NUMBER },
                flavors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                designNotes: { type: Type.STRING },
              },
              required: ['recommendedWeightKg', 'flavors', 'designNotes'],
            },
            invitationDrafts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tone: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['tone', 'text'],
              },
            },
            scheduleOutline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ['timeSlot', 'activity'],
              },
            },
            costSavingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'themes',
            'menuSuggestions',
            'cakeRecommendation',
            'invitationDrafts',
            'scheduleOutline',
            'costSavingTips',
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response received from Gemini model');
    }

    const parsedData = JSON.parse(text);

    return NextResponse.json({
      source: 'gemini',
      model: 'gemini-3.8-flash',
      ...parsedData,
    });
  } catch (error: unknown) {
    console.error('Gemini plan API error (falling back to deterministic):', error);

    // Fall back gracefully to deterministic plan generator so user experience never fails
    return NextResponse.json({
      source: 'deterministic-fallback',
      warning: 'Live AI request unavailable. CelebrAI deterministic rule engine generated this plan.',
      ...generateDeterministicPlan({} as PlanRequestBody),
    });
  }
}

function generateDeterministicPlan(body: Partial<PlanRequestBody>) {
  const guests = body.totalGuests || 50;
  const budget = body.budget || 20000;
  const eventName = body.eventName || 'Celebration';
  const foodPref = body.foodPreference || 'vegetarian';
  const cakeWeight = Math.max(1.5, Math.ceil(guests * 0.065 * 2) / 2);

  return {
    themes: [
      {
        title: `${body.theme || 'Enchanted Starlight Elegance'}`,
        description:
          'Deep midnight indigo paired with royal gold and ivory textures, creating a timeless festive ambiance.',
        colorPalette: ['#1E1B4B', '#3B1E48', '#D97706', '#FAF9F6'],
        decorIdeas: [
          'Warm fairy light backdrop wall behind stage / cake table',
          'Geometric gold centerpiece stands with fresh seasonal blooms',
          'Subtle photo entryway with welcome milestone chalkboard',
        ],
      },
      {
        title: 'Modern Minimalist Pastel Bloom',
        description:
          'Soft sage, warm blush, and cream tones delivering clean, uncluttered celebration aesthetics.',
        colorPalette: ['#065F46', '#F43F5E', '#FEF3C7', '#F3F4F6'],
        decorIdeas: [
          'Eco-friendly eucalyptus and paper floral arches',
          'Clean ivory table linen with handwritten calligraphy name cards',
        ],
      },
      {
        title: 'Traditional Cultural Radiance',
        description:
          'Vibrant marigold yellows and deep crimson accents honouring festive Indian celebration roots.',
        colorPalette: ['#991B1B', '#D97706', '#FBBF24', '#FEF2F2'],
        decorIdeas: [
          'Brass urlis with floating candles and marigold petals',
          'Fabric draping in crimson and warm saffron',
        ],
      },
    ],
    menuSuggestions: [
      {
        course: 'starter',
        name: foodPref === 'vegetarian' ? 'Crispy Paneer Tikka & Corn Kebabs' : 'Tandoori Murgh & Paneer Tikka',
        dietary: foodPref === 'vegetarian' ? 'Vegetarian' : 'Mixed',
        suggestedPortionPerPerson: '100g per person',
        notes: 'Serve with spicy mint chutney and lemon wedges.',
      },
      {
        course: 'main',
        name: foodPref === 'vegetarian' ? 'Paneer Butter Masala & Dal Makhani' : 'Butter Chicken & Dal Makhani',
        dietary: foodPref === 'vegetarian' ? 'Vegetarian' : 'Mixed',
        suggestedPortionPerPerson: '250g combined',
        notes: 'Accompanied by hot tandoori rotis and fragrant jeera rice.',
      },
      {
        course: 'dessert',
        name: 'Warm Kesar Gulab Jamun & Ice Cream',
        dietary: 'Vegetarian',
        suggestedPortionPerPerson: '2 pieces + 1 scoop',
        notes: 'Classic all-age crowd favorite.',
      },
      {
        course: 'beverage',
        name: 'Fresh Mint Lemonade & Kulhad Chai',
        dietary: 'Vegetarian',
        suggestedPortionPerPerson: '250ml',
        notes: 'Refreshing welcome drinks upon arrival.',
      },
    ],
    cakeRecommendation: {
      recommendedWeightKg: cakeWeight,
      flavors: [
        body.cakePreference?.flavor || 'Belgian Chocolate Truffle',
        'Vanilla Buttercream with Fresh Berries',
        'Red Velvet with Cream Cheese',
      ],
      designNotes: `Calculated at ~65g per serving for ${guests} guests. 2-tier celebration stand with customizable lettering "${
        body.cakePreference?.message || `Celebrating ${eventName}`
      }".`,
    },
    invitationDrafts: [
      {
        tone: 'Warm & Festive',
        text: `✨ Let's Celebrate! You are warmly invited to ${eventName} on our special day. Join us for an evening of warmth, delicious food, and joyous memories. Venue: ${
          body.location || 'Local Hall'
        }. RSVP appreciated!`,
      },
      {
        tone: 'Playful & Casual',
        text: `🎉 The countdown is on! We are getting together to celebrate ${eventName}. Expect great music, tasty bites, and lots of laughs. See you there!`,
      },
      {
        tone: 'Formal',
        text: `We cordially invite you and your family to grace the celebration of ${eventName}. Your presence will bring immense happiness to our celebration.`,
      },
    ],
    scheduleOutline: [
      {
        timeSlot: '17:30 - 18:15',
        activity: 'Guest Reception & Welcome Refreshments',
        notes: 'Welcome drinks and starters served as guests arrive.',
      },
      {
        timeSlot: '18:15 - 19:15',
        activity: 'Celebration Activities & Stage Photographs',
        notes: 'Interactive moments, family photos, and music.',
      },
      {
        timeSlot: '19:15 - 19:45',
        activity: 'Cake Cutting & Toast',
        notes: 'Gather all attendees for the ceremonial cutting.',
      },
      {
        timeSlot: '19:45 - 21:00',
        activity: 'Dinner Buffet Opening',
        notes: 'Full banquet service with hot bread rotation.',
      },
      {
        timeSlot: '21:00 - 21:30',
        activity: 'Thank You & Parting Favors',
        notes: 'Distribution of return gifts and farewells.',
      },
    ],
    costSavingTips: [
      `Anchor your budget at INR ${budget}: Prioritize catering and cake (usually 55% of budget) and keep decor smart and reusable.`,
      'Use digital RSVP tracking via CelebrAI to finalize guest counts 48 hours prior, avoiding payment for unused catering plates.',
      'Purchase eco-friendly compostable dinnerware in wholesale packs to reduce rental costs by up to 35%.',
      'Opt for venue-included sound and lighting equipment rather than hiring third-party AV vendors for intimate gatherings.',
    ],
  };
}
